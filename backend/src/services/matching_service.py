def _normalize_tokens(*values):
    tokens = set()

    for value in values:
        if value is None:
            continue

        if isinstance(value, list):
            for item in value:
                tokens.update(_normalize_tokens(item))
            continue

        text = str(value).lower().replace("/", " ").replace("-", " ")
        for raw in text.split():
            cleaned = "".join(ch for ch in raw if ch.isalnum())
            if len(cleaned) > 1:
                tokens.add(cleaned)

    return tokens


def _build_profile_tokens(user):
    profile = user.get("profile", {})
    return _normalize_tokens(
        user.get("name"),
        profile.get("headline"),
        profile.get("bio"),
        profile.get("skills", []),
        profile.get("career_goals", []),
        profile.get("mentorship_topics", []),
        profile.get("company"),
    )


def _score_overlap(student, alumni, area_of_interest=""):
    student_profile = student.get("profile", {})
    alumni_profile = alumni.get("profile", {})

    student_skills = _normalize_tokens(student_profile.get("skills", []))
    alumni_skills = _normalize_tokens(
        alumni_profile.get("skills", []),
        alumni_profile.get("mentorship_topics", []),
    )

    student_tokens = _build_profile_tokens(student)
    alumni_tokens = _build_profile_tokens(alumni)

    skill_overlap = len(student_skills & alumni_skills)
    semantic_overlap = len(student_tokens & alumni_tokens)

    score = 40
    score += skill_overlap * 14
    score += semantic_overlap * 3

    if alumni_profile.get("company"):
        score += 6

    if alumni_profile.get("availability", "open") == "open":
        score += 5

    if student_profile.get("career_goals") and alumni_profile.get("mentorship_topics"):
        score += min(len(_normalize_tokens(student_profile.get("career_goals")) & _normalize_tokens(alumni_profile.get("mentorship_topics"))), 3) * 4

    if area_of_interest:
        interest_overlap = len(
            _normalize_tokens(area_of_interest)
            & _normalize_tokens(
                alumni_profile.get("skills", []),
                alumni_profile.get("mentorship_topics", []),
                alumni_profile.get("headline"),
                alumni_profile.get("bio"),
            )
        )
        score += min(interest_overlap * 8, 16)

    return min(max(score, 45), 98)


def recommend_mentors(student, alumni_list, limit=8, area_of_interest=""):
    recommendations = []

    for alumni in alumni_list:
        score = _score_overlap(student, alumni, area_of_interest=area_of_interest)
        alumni_profile = alumni.get("profile", {})
        shared_focus = list(
            _normalize_tokens(student.get("profile", {}).get("skills", []), student.get("profile", {}).get("career_goals", []), area_of_interest)
            & _normalize_tokens(alumni_profile.get("skills", []), alumni_profile.get("mentorship_topics", []))
        )

        recommendations.append(
            {
                "id": str(alumni["_id"]),
                "name": alumni.get("name", "Alumni Mentor"),
                "email": alumni.get("email"),
                "company": alumni_profile.get("company") or "Alumni Network",
                "headline": alumni_profile.get("headline") or "Available for mentorship",
                "bio": alumni_profile.get("bio") or "Experienced alumni ready to support students.",
                "skills": alumni_profile.get("skills", [])[:6],
                "mentorship_topics": alumni_profile.get("mentorship_topics", [])[:4],
                "availability": alumni_profile.get("availability", "open"),
                "score": score,
                "match_reason": ", ".join(shared_focus[:3]) if shared_focus else "Aligned profile, skills, and career goals",
            }
        )

    recommendations.sort(key=lambda mentor: (-mentor["score"], mentor["name"]))
    return recommendations[:limit]
