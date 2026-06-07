import json
import os
from urllib import error, parse, request


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()


def gemini_enabled():
    return bool(GEMINI_API_KEY)


def _extract_text(response_json):
    candidates = response_json.get("candidates", [])
    if not candidates:
        return ""

    parts = candidates[0].get("content", {}).get("parts", [])
    return "".join(part.get("text", "") for part in parts if part.get("text"))


def _clean_json_text(text):
    cleaned = (text or "").strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()
    return cleaned


def call_gemini_json(prompt):
    if not gemini_enabled():
        raise RuntimeError("Gemini API key not configured")

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{parse.quote(GEMINI_MODEL)}:generateContent?key={parse.quote(GEMINI_API_KEY)}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.4,
            "responseMimeType": "application/json",
        },
    }

    data = json.dumps(payload).encode("utf-8")
    req = request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with request.urlopen(req, timeout=45) as response:
        body = json.loads(response.read().decode("utf-8"))

    text = _clean_json_text(_extract_text(body))
    return json.loads(text)


def gemini_resume_sections(student_name, payload):
    prompt = f"""
You are a resume-writing assistant for college students.
Improve the student's raw input and return strict JSON with this schema:
{{
  "professionalSummary": "string",
  "technicalSkills": ["string"],
  "education": ["string"],
  "experiences": ["string"],
  "certifications": ["string"],
  "projects": ["string"]
}}

Rules:
- Make the language professional, concise, and ATS-friendly.
- Professional summary should be 3-4 lines and based on raw student data.
- Clean technical skills from raw text and group them into polished categories.
- Education entries should include 1 professional line about academic excellence.
- Experience/training/certification headlines should sound professional.
- Project entries should describe features, impact, and student effort.
- Do not invent unrealistic achievements, companies, or metrics.

Student name: {student_name}
Payload:
{json.dumps(payload, ensure_ascii=True)}
"""
    return call_gemini_json(prompt)


def gemini_match_recommendations(student_payload, mentor_payload):
    prompt = f"""
You are matching a student to alumni mentors.
Return strict JSON with this schema:
{{
  "recommendations": [
    {{
      "id": "mentor id",
      "score": 0,
      "match_reason": "short reason"
    }}
  ]
}}

Rules:
- Focus on area of interest, career goals, skills, mentorship topics, and practical fit.
- Scores must be integers between 50 and 98.
- Prefer mentors with stronger alignment to the student's area of interest.
- Keep match_reason under 20 words.
- Only use ids provided in mentors list.

Student:
{json.dumps(student_payload, ensure_ascii=True)}

Mentors:
{json.dumps(mentor_payload, ensure_ascii=True)}
"""
    return call_gemini_json(prompt)


def gemini_improve_resume_section(student_name, section, section_payload, full_payload=None, attempt=1):
    prompt = f"""
You are improving one section of a college student's resume draft.
Return strict JSON with this schema:
{{
  "section": "{section}",
  "content": "string, object, or array depending on the input shape",
  "notes": "one short sentence about what was improved"
}}

Rules:
- Keep the same general structure as the input section.
- Make the language more professional, clearer, and ATS-friendly.
- Do not invent unrealistic achievements, companies, or metrics.
- If this is another attempt, vary the wording so the student can compare versions.
- For lists or grouped fields, preserve usability for editing in a form.

Student name: {student_name}
Attempt number: {attempt}
Section name: {section}
Section payload:
{json.dumps(section_payload, ensure_ascii=True)}

Full resume payload for context:
{json.dumps(full_payload or {}, ensure_ascii=True)}
"""
    return call_gemini_json(prompt)
