from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from src.config.database import mongo
from src.services.gemini_service import (
    gemini_enabled,
    gemini_improve_resume_section,
    gemini_resume_sections,
)


def _split_csv(text):
    if isinstance(text, list):
        return [str(item).strip() for item in text if str(item).strip()]

    return [item.strip() for item in str(text or "").split(",") if item.strip()]


def _split_lines(text):
    if isinstance(text, list):
        return [str(item).strip() for item in text if str(item).strip()]

    return [item.strip() for item in str(text or "").splitlines() if item.strip()]


def _title_case_words(items):
    return [item.strip().title() for item in items if item.strip()]


def _ensure_bullets(text_or_lines, default_line):
    if isinstance(text_or_lines, list):
        lines = [str(item).strip().lstrip("- ").strip() for item in text_or_lines if str(item).strip()]
    else:
        lines = [
            line.strip().lstrip("- ").strip()
            for line in str(text_or_lines or "").splitlines()
            if line.strip()
        ]

    if not lines:
        lines = [default_line]

    return [f"- {line}" for line in lines[:4]]


def _improve_summary(data, profile, full_name, target_role):
    raw_summary = (data.get("professionalSummary") or "").strip()
    skills = _title_case_words(data.get("technicalSkills", {}).get("core", []) or profile.get("skills", [])[:6])
    projects = data.get("projects", [])
    strengths = skills[:4] if skills else ["problem solving", "collaboration", "practical development"]
    strengths_text = ", ".join(strengths)

    if raw_summary:
        summary_lines = [
            f"{full_name} is an aspiring {target_role} with hands-on exposure to {strengths_text}.",
            raw_summary.rstrip("."),
            "Prepared to contribute through strong fundamentals, consistent execution, and fast learning in team environments.",
        ]
        return _ensure_bullets(summary_lines, f"Aspiring {target_role} with strong motivation and developing technical depth.")

    project_count = len(projects)
    return _ensure_bullets(
        [
            f"Motivated {target_role} with a strong academic foundation and growing experience in {strengths_text}.",
            (
                "Known for building practical solutions, learning quickly, and translating classroom concepts into production-style projects"
                f"{' across ' + str(project_count) + ' major project experiences' if project_count else ''}."
            ),
            "Focused on writing clean solutions, improving continuously, and contributing effectively to real-world software teams.",
        ],
        f"Motivated {target_role} with strong academic grounding and practical learning mindset.",
    )


def _improve_skills(technical_skills):
    buckets = []
    for label, values in [
        ("Programming", technical_skills.get("core", [])),
        ("Frameworks", technical_skills.get("frameworks", [])),
        ("Databases", technical_skills.get("databases", [])),
        ("Tools", technical_skills.get("tools", [])),
    ]:
        cleaned = _title_case_words(values)
        if cleaned:
            buckets.append(f"{label}: {', '.join(cleaned)}")
    return buckets


def _improve_education(education_entries):
    lines = []
    for edu in education_entries:
        degree = edu.get("degree", "").strip()
        institute = edu.get("institution", "").strip()
        year = edu.get("year", "").strip()
        score = edu.get("score", "").strip()
        highlights = _split_csv(edu.get("highlights", ""))

        base = " | ".join(part for part in [degree, institute, year] if part)
        if score:
            base = f"{base} | Score: {score}" if base else f"Score: {score}"

        statement = base or "Academic qualification"
        excellence = []
        if score:
            excellence.append("demonstrating consistent academic commitment")
        if highlights:
            excellence.append(f"with emphasis on {', '.join(highlights[:3])}")
        if not excellence:
            excellence.append("supported by a strong focus on practical and conceptual excellence")

        lines.append(f"- {statement}. {full_sentence('This stage reflects', excellence)}")

    return lines or ["- Add your education details to generate a stronger academic section."]


def _improve_experiences(experience_entries):
    lines = []
    for item in experience_entries:
        title = item.get("title", "").strip() or "Professional Experience"
        organization = item.get("organization", "").strip()
        duration = item.get("duration", "").strip()
        raw_details = _split_lines(item.get("details", ""))
        headline = " | ".join(part for part in [title, organization, duration] if part)
        lines.append(f"- {headline}")
        if raw_details:
            polished = " ".join(detail.rstrip(".") + "." for detail in raw_details[:3])
            lines.append(f"  Improved contribution summary: Delivered responsibilities with focus on ownership, execution quality, and measurable learning outcomes. {polished}")
        else:
            lines.append("  Improved contribution summary: Built practical exposure through structured execution, documentation, teamwork, and continuous learning.")
    return lines or ["- Add internships, trainings, or volunteer experience to strengthen this section."]


def _improve_certifications(certifications):
    lines = []
    for item in certifications:
        cleaned = item.strip()
        if cleaned:
            lines.append(f"- {cleaned}: demonstrates initiative toward structured upskilling and industry readiness.")
    return lines or ["- Add certifications or training programs to highlight continuous learning."]


def _improve_projects(projects):
    lines = []
    for project in projects:
        name = project.get("name", "").strip() or "Project"
        stack = ", ".join(_title_case_words(_split_csv(project.get("techStack", ""))))
        features = _split_lines(project.get("features", ""))
        effort = (project.get("effort") or "").strip()

        intro_parts = [name]
        if stack:
            intro_parts.append(f"Tech Stack: {stack}")
        if effort:
            intro_parts.append(f"Student Effort: {effort}")
        lines.append(f"- {' | '.join(intro_parts)}")

        if features:
            feature_summary = "; ".join(features[:4])
            lines.append(f"  Project overview: Designed and implemented a solution featuring {feature_summary}. The project reflects applied problem-solving, feature planning, and hands-on development effort.")
        else:
            lines.append("  Project overview: Built as a practical implementation project that demonstrates planning, coding discipline, and real-world problem solving.")

    return lines or ["- Add academic or personal projects to showcase initiative and implementation depth."]


def _improve_simple_list(items, suffix):
    cleaned = [item.strip() for item in items if item.strip()]
    return [f"- {item}{suffix}" for item in cleaned] or [f"- Add entries here to enrich the resume's final profile section."]


def full_sentence(prefix, phrases):
    return f"{prefix} {' and '.join(phrases)}."


def _skills_to_form_strings(technical_skills):
    return {
        "core": ", ".join(_title_case_words(technical_skills.get("core", []))),
        "frameworks": ", ".join(_title_case_words(technical_skills.get("frameworks", []))),
        "databases": ", ".join(_title_case_words(technical_skills.get("databases", []))),
        "tools": ", ".join(_title_case_words(technical_skills.get("tools", []))),
    }


def _improve_education_for_form(education_entries):
    improved = []
    for edu in education_entries:
        item = dict(edu)
        degree = item.get("degree", "").strip()
        institute = item.get("institution", "").strip()
        score = item.get("score", "").strip()
        highlights = _split_csv(item.get("highlights", ""))

        phrases = []
        if degree and institute:
            phrases.append(f"built a strong academic base in {degree}")
        if score:
            phrases.append(f"reflected consistent academic performance through a score of {score}")
        if highlights:
            phrases.append(f"with focused learning in {', '.join(highlights[:3])}")
        if not phrases:
            phrases.append("demonstrated a disciplined and growth-oriented academic journey")

        item["highlights"] = full_sentence("Academic excellence", phrases)
        improved.append(item)
    return improved


def _improve_experiences_for_form(experience_entries):
    improved = []
    for item in experience_entries:
        entry = dict(item)
        raw_title = (entry.get("title") or "").strip()
        raw_details = _split_lines(entry.get("details", ""))

        if raw_title and "intern" not in raw_title.lower() and "training" not in raw_title.lower():
            entry["title"] = f"{raw_title} Experience"

        if raw_details:
            entry["details"] = "\n".join(
                f"{detail.rstrip('.')} with emphasis on execution quality, collaboration, and practical outcomes."
                for detail in raw_details[:4]
            )
        else:
            entry["details"] = (
                "Contributed through structured execution, hands-on learning, documentation, and team coordination."
            )

        improved.append(entry)
    return improved


def _improve_projects_for_form(project_entries):
    improved = []
    for item in project_entries:
        project = dict(item)
        features = _split_lines(project.get("features", ""))
        effort = (project.get("effort") or "").strip()
        stack = ", ".join(_title_case_words(_split_csv(project.get("techStack", ""))))

        if features:
            project["features"] = "\n".join(
                f"{feature.rstrip('.')} with a focus on usability, implementation depth, and real-world relevance."
                for feature in features[:4]
            )
        else:
            project["features"] = "Implemented meaningful modules that demonstrate practical problem solving and feature delivery."

        if effort:
            project["effort"] = (
                f"{effort.rstrip('.')} while contributing to planning, development, testing, and iterative improvement."
            )
        elif stack:
            project["effort"] = (
                f"Built the project using {stack} with active involvement in design decisions, coding, and refinement."
            )
        else:
            project["effort"] = "Handled planning, implementation, and refinement to turn the idea into a working project."

        improved.append(project)
    return improved


def _improve_final_details_for_form(data):
    return {
        "softSkills": ", ".join(_title_case_words(_split_csv(data.get("softSkills", "")))),
        "languages": ", ".join(_title_case_words(_split_csv(data.get("languages", "")))),
        "hobbies": ", ".join(_title_case_words(_split_csv(data.get("hobbies", "")))),
    }


def _local_improve_section(section, form_data, user):
    profile = user.get("profile", {}) or {}
    personal = form_data.get("personalDetails", {}) or {}
    full_name = (personal.get("name") or user.get("name") or "Student").strip()
    target_role = (form_data.get("targetRole") or profile.get("headline") or "Software Engineer").strip()

    if section == "professionalSummary":
        return _improve_summary(form_data, profile, full_name, target_role)
    if section == "technicalSkills":
        return _skills_to_form_strings(form_data.get("technicalSkills", {}) or {})
    if section == "education":
        return _improve_education_for_form(form_data.get("education", []) or [])
    if section == "experiences":
        return _improve_experiences_for_form(form_data.get("experiences", []) or [])
    if section == "certifications":
        lines = _split_lines(form_data.get("certifications", ""))
        return "\n".join(
            f"{line}: strengthened professional development and domain readiness."
            for line in lines
        ) or "Add certifications or training programs here to highlight structured upskilling."
    if section == "projects":
        return _improve_projects_for_form(form_data.get("projects", []) or [])
    if section == "finalDetails":
        return _improve_final_details_for_form(form_data)
    raise ValueError("Unsupported resume section")


def _render_template(template_id, full_name, target_role, contact_line, summary, education, skills, experiences, certifications, projects, soft_skills, languages, hobbies):
    summary_block = "\n".join(_ensure_bullets(summary, f"Aspiring {target_role} with a strong learning mindset."))
    skills_block = "\n".join(f"- {item}" for item in skills) if skills else "- Add technical skills to generate this section."
    sections = {
        "summary": summary_block,
        "education": "\n".join(education),
        "skills": skills_block,
        "experiences": "\n".join(experiences),
        "certifications": "\n".join(certifications),
        "projects": "\n".join(projects),
        "soft_skills": "\n".join(soft_skills),
        "languages": "\n".join(languages),
        "hobbies": "\n".join(hobbies),
    }

    if template_id == "modern":
        return "\n".join(
            [
                full_name.upper(),
                f"{target_role} | {contact_line}",
                "",
                "PROFILE HIGHLIGHTS",
                sections["summary"],
                "",
                "CORE SKILLS",
                sections["skills"],
                "",
                "PROJECT PORTFOLIO",
                sections["projects"],
                "",
                "EXPERIENCE",
                sections["experiences"],
                "",
                "EDUCATION",
                sections["education"],
                "",
                "CERTIFICATIONS",
                sections["certifications"],
                "",
                "PERSONAL STRENGTHS",
                sections["soft_skills"],
                "",
                "LANGUAGES",
                sections["languages"],
                "",
                "HOBBIES",
                sections["hobbies"],
            ]
        )

    if template_id == "ats":
        return "\n".join(
            [
                full_name,
                target_role,
                contact_line,
                "",
                "PROFESSIONAL SUMMARY",
                sections["summary"],
                "",
                "TECHNICAL SKILLS",
                sections["skills"],
                "",
                "EXPERIENCE",
                sections["experiences"],
                "",
                "PROJECTS",
                sections["projects"],
                "",
                "EDUCATION",
                sections["education"],
                "",
                "CERTIFICATIONS",
                sections["certifications"],
                "",
                "SOFT SKILLS",
                sections["soft_skills"],
                "",
                "LANGUAGES",
                sections["languages"],
            ]
        )

    if template_id == "executive":
        return "\n".join(
            [
                f"{full_name} | {target_role}",
                contact_line,
                "",
                "EXECUTIVE PROFILE",
                sections["summary"],
                "",
                "EDUCATION AND ACADEMIC EXCELLENCE",
                sections["education"],
                "",
                "TECHNOLOGY CAPABILITIES",
                sections["skills"],
                "",
                "EXPERIENCE AND TRAINING",
                sections["experiences"],
                "",
                "KEY PROJECTS",
                sections["projects"],
                "",
                "CERTIFICATIONS",
                sections["certifications"],
                "",
                "COMMUNICATION AND LEADERSHIP",
                sections["soft_skills"],
                "",
                "LANGUAGES AND INTERESTS",
                sections["languages"],
                "\n".join(hobbies),
            ]
        )

    if template_id == "creative":
        return "\n".join(
            [
                f"{full_name}",
                f"Target Role: {target_role}",
                f"Connect: {contact_line}",
                "",
                "ABOUT ME",
                sections["summary"],
                "",
                "WHAT I BUILD",
                sections["projects"],
                "",
                "TOOLS AND TECHNOLOGIES",
                sections["skills"],
                "",
                "LEARNING JOURNEY",
                sections["education"],
                "",
                "REAL-WORLD EXPOSURE",
                sections["experiences"],
                "",
                "CERTIFICATIONS AND TRAINING",
                sections["certifications"],
                "",
                "SOFT SKILLS",
                sections["soft_skills"],
                "",
                "LANGUAGES",
                sections["languages"],
                "",
                "HOBBIES",
                sections["hobbies"],
            ]
        )

    return "\n".join(
        [
            full_name,
            target_role,
            contact_line,
            "",
            "PROFESSIONAL SUMMARY",
            sections["summary"],
            "",
            "EDUCATION",
            sections["education"],
            "",
            "TECHNICAL SKILLS",
            sections["skills"],
            "",
            "EXPERIENCE AND TRAINING",
            sections["experiences"],
            "",
            "CERTIFICATIONS",
            sections["certifications"],
            "",
            "PROJECTS",
            sections["projects"],
            "",
            "SOFT SKILLS",
            sections["soft_skills"],
            "",
            "LANGUAGES",
            sections["languages"],
            "",
            "HOBBIES",
            sections["hobbies"],
        ]
    )


@jwt_required()
def generate_resume_controller():
    user = mongo.db.users.find_one({"email": get_jwt_identity()}, {"password": 0})
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json() or {}
    profile = user.get("profile", {})

    personal = data.get("personalDetails", {}) or {}
    full_name = (personal.get("name") or user.get("name") or "Student").strip()
    email = (personal.get("email") or user.get("email") or "").strip()
    github = (personal.get("github") or profile.get("social_links", {}).get("github") or "").strip()
    linkedin = (personal.get("linkedin") or profile.get("social_links", {}).get("linkedin") or "").strip()
    location = (personal.get("location") or profile.get("location") or "").strip()
    template_id = (data.get("template") or "classic").strip().lower()

    target_role = (data.get("targetRole") or profile.get("headline") or "Software Engineer").strip()
    summary = _improve_summary(data, profile, full_name, target_role)
    skills = _improve_skills(data.get("technicalSkills", {}) or {})
    education = _improve_education(data.get("education", []) or [])
    experiences = _improve_experiences(data.get("experiences", []) or [])
    certifications = _improve_certifications(_split_lines(data.get("certifications", "")))
    projects = _improve_projects(data.get("projects", []) or [])

    if gemini_enabled():
        try:
            gemini_sections = gemini_resume_sections(
                full_name,
                {
                    "template": template_id,
                    "targetRole": target_role,
                    "professionalSummary": data.get("professionalSummary", ""),
                    "education": data.get("education", []),
                    "technicalSkills": data.get("technicalSkills", {}),
                    "experiences": data.get("experiences", []),
                    "certifications": _split_lines(data.get("certifications", "")),
                    "projects": data.get("projects", []),
                    "softSkills": _split_csv(data.get("softSkills", "")),
                    "languages": _split_csv(data.get("languages", "")),
                    "hobbies": _split_csv(data.get("hobbies", "")),
                },
            )
            summary = gemini_sections.get("professionalSummary") or summary
            skills = gemini_sections.get("technicalSkills") or skills
            education = gemini_sections.get("education") or education
            experiences = gemini_sections.get("experiences") or experiences
            certifications = gemini_sections.get("certifications") or certifications
            projects = gemini_sections.get("projects") or projects
        except Exception:
            pass
    summary = _ensure_bullets(summary, f"Aspiring {target_role} with strong fundamentals and practical learning mindset.")
    soft_skills = _improve_simple_list(_split_csv(data.get("softSkills", "")), ": presented as a professional strength.")
    languages = _improve_simple_list(_split_csv(data.get("languages", "")), ": suitable for teamwork and communication contexts.")
    hobbies = _improve_simple_list(_split_csv(data.get("hobbies", "")), ": adds personality and balance to the profile.")

    contact_line = " | ".join(part for part in [email, location, github, linkedin] if part)
    resume_text = _render_template(
        template_id,
        full_name,
        target_role,
        contact_line,
        summary,
        education,
        skills,
        experiences,
        certifications,
        projects,
        soft_skills,
        languages,
        hobbies,
    )

    completeness_score = 45
    completeness_score += min(18, len(skills) * 4)
    completeness_score += min(15, len(data.get("education", []) or []) * 5)
    completeness_score += min(10, len(data.get("experiences", []) or []) * 5)
    completeness_score += min(12, len(data.get("projects", []) or []) * 4)
    completeness_score += min(8, len(_split_lines(data.get("certifications", ""))) * 4)
    score = min(98, completeness_score)

    return jsonify(
        {
            "resumeText": resume_text,
            "score": score,
            "template": template_id,
            "generatedSections": {
                "professionalSummary": summary,
                "technicalSkills": skills,
                "education": education,
                "experiences": experiences,
                "certifications": certifications,
                "projects": projects,
            },
            "aiProvider": "gemini" if gemini_enabled() else "local-fallback",
            "suggestions": [
                "Add quantified outcomes wherever possible, such as percentages, timelines, or team size.",
                "Keep project features concrete and aligned with the role you are targeting.",
                "Update education and certifications with latest academic achievements before export.",
            ],
        }
    ), 200


@jwt_required()
def improve_resume_section_controller():
    user = mongo.db.users.find_one({"email": get_jwt_identity()}, {"password": 0})
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json() or {}
    section = (data.get("section") or "").strip()
    form_data = data.get("formData") or {}
    attempt = max(1, int(data.get("attempt") or 1))

    if not section:
        return jsonify({"msg": "Section is required"}), 400

    try:
        improved_content = _local_improve_section(section, form_data, user)
        provider = "local-fallback"
        notes = "Improved with clearer and more professional resume wording."

        if gemini_enabled():
            personal = form_data.get("personalDetails", {}) or {}
            full_name = (personal.get("name") or user.get("name") or "Student").strip()

            section_payload_map = {
                "professionalSummary": form_data.get("professionalSummary", ""),
                "technicalSkills": form_data.get("technicalSkills", {}),
                "education": form_data.get("education", []),
                "experiences": form_data.get("experiences", []),
                "certifications": form_data.get("certifications", ""),
                "projects": form_data.get("projects", []),
                "finalDetails": {
                    "softSkills": form_data.get("softSkills", ""),
                    "languages": form_data.get("languages", ""),
                    "hobbies": form_data.get("hobbies", ""),
                },
            }

            try:
                gemini_response = gemini_improve_resume_section(
                    full_name,
                    section,
                    section_payload_map.get(section),
                    full_payload=form_data,
                    attempt=attempt,
                )
                if "content" in gemini_response:
                    improved_content = gemini_response["content"]
                    provider = "gemini"
                    notes = gemini_response.get("notes") or notes
            except Exception:
                pass

        if section == "professionalSummary":
            improved_content = "\n".join(
                _ensure_bullets(
                    improved_content,
                    "A motivated student with growing technical depth and readiness for professional opportunities.",
                )
            )

        return jsonify(
            {
                "section": section,
                "content": improved_content,
                "aiProvider": provider,
                "attempt": attempt,
                "notes": notes,
            }
        ), 200
    except ValueError as exc:
        return jsonify({"msg": str(exc)}), 400


@jwt_required()
def generate_article_controller():
    data = request.get_json() or {}
    topic = (data.get("topic") or "").strip()
    audience = (data.get("audience") or "students").strip()

    if not topic:
        return jsonify({"msg": "Topic is required"}), 400

    title = f"{topic}: Practical Guidance for {audience.title()}"
    body = "\n\n".join(
        [
            f"Introduction\n{topic} matters because students and alumni need focused, real-world guidance to move from theory to execution.",
            f"Key Insights\n1. Build strong fundamentals around {topic}.\n2. Learn from alumni case studies and recent projects.\n3. Track progress through mentorship, applications, and discussion forums.",
            f"Action Plan\nStart with one measurable project, document outcomes, seek mentor feedback, and refine your portfolio based on industry expectations.",
            "Closing\nConsistent community learning, structured reflection, and alumni support create the strongest path to career readiness.",
        ]
    )

    return jsonify({"title": title, "body": body}), 200


@jwt_required()
def assistant_reply_controller():
    data = request.get_json() or {}
    message = (data.get("message") or "").strip()
    lower = message.lower()

    if not message:
        return jsonify({"msg": "Message is required"}), 400

    if "resume" in lower:
        reply = "Start with a focused target role, 5-8 core skills, two strong projects, and quantified achievements. Then use the resume builder to turn that into a structured draft."
    elif "job" in lower:
        reply = "Use the job portal to filter by matching skills, apply early, and tailor your resume summary and project bullets to each opportunity."
    elif "mentor" in lower or "mentorship" in lower:
        reply = "Open AI Mentorship Matching, review the highest-ranked alumni, send a mentorship request, and continue the conversation in the live chat module."
    else:
        reply = "I can help with mentorship, resume building, job applications, article drafting, and platform navigation. Ask me about any of those directly."

    return jsonify({"reply": reply}), 200
