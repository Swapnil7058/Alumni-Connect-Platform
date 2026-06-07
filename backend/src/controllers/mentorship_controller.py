from datetime import datetime
from bson import ObjectId
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from src.config.database import mongo
from src.services.gemini_service import gemini_enabled, gemini_match_recommendations
from src.services.matching_service import recommend_mentors
from src.utils.serializers import serialize_document


@jwt_required()
def get_recommendations_controller():
    email = get_jwt_identity()
    users = mongo.db.users
    area_of_interest = (request.args.get("area_of_interest") or "").strip()

    student = users.find_one({"email": email}, {"password": 0})
    if not student:
        return jsonify({"msg": "User not found"}), 404

    alumni = list(
        users.find(
            {
                "role": "alumni",
                "is_verified": True,
                "email": {"$ne": email},
            },
            {"password": 0},
        )
    )

    recommendations = recommend_mentors(student, alumni, area_of_interest=area_of_interest)

    if gemini_enabled() and recommendations:
        try:
            gemini_result = gemini_match_recommendations(
                {
                    "name": student.get("name"),
                    "area_of_interest": area_of_interest,
                    "skills": student.get("profile", {}).get("skills", []),
                    "career_goals": student.get("profile", {}).get("career_goals", []),
                    "mentorship_topics": student.get("profile", {}).get("mentorship_topics", []),
                },
                [
                    {
                        "id": item["id"],
                        "name": item["name"],
                        "company": item["company"],
                        "skills": item.get("skills", []),
                        "mentorship_topics": item.get("mentorship_topics", []),
                        "headline": item.get("headline", ""),
                    }
                    for item in recommendations
                ],
            )
            ranked = {
                item["id"]: {
                    "score": item.get("score", 0),
                    "match_reason": item.get("match_reason", ""),
                }
                for item in gemini_result.get("recommendations", [])
                if item.get("id")
            }
            for item in recommendations:
                if item["id"] in ranked:
                    item["score"] = ranked[item["id"]]["score"] or item["score"]
                    item["match_reason"] = ranked[item["id"]]["match_reason"] or item["match_reason"]
            recommendations.sort(key=lambda mentor: (-mentor["score"], mentor["name"]))
        except Exception:
            pass

    return jsonify(
        {
            "student": {
                "email": student["email"],
                "name": student.get("name"),
                "profile": student.get("profile", {}),
            },
            "area_of_interest": area_of_interest,
            "aiProvider": "gemini" if gemini_enabled() else "local-fallback",
            "recommendations": recommendations,
        }
    ), 200


@jwt_required()
def request_mentor_controller(mentor_id):
    requester_email = get_jwt_identity()
    users = mongo.db.users
    conversations = mongo.db.conversations
    messages = mongo.db.messages

    if not ObjectId.is_valid(mentor_id):
        return jsonify({"msg": "Invalid mentor id"}), 400

    student = users.find_one({"email": requester_email}, {"password": 0})
    mentor = users.find_one(
        {"_id": ObjectId(mentor_id), "role": "alumni", "is_verified": True},
        {"password": 0},
    )

    if not student or not mentor:
        return jsonify({"msg": "Unable to create mentorship request"}), 404

    participant_emails = sorted([student["email"], mentor["email"]])
    conversation = conversations.find_one({"participant_emails": participant_emails})

    if conversation is None:
        now = datetime.utcnow()
        conversation = {
            "type": "mentorship",
            "status": "active",
            "moderation_status": "active",
            "participant_emails": participant_emails,
            "participants": [
                {
                    "email": student["email"],
                    "name": student.get("name"),
                    "role": student.get("role"),
                },
                {
                    "email": mentor["email"],
                    "name": mentor.get("name"),
                    "role": mentor.get("role"),
                },
            ],
            "mentorship_request": {
                "student_email": student["email"],
                "mentor_email": mentor["email"],
                "requested_at": now,
            },
            "last_message": "Mentorship request created",
            "last_message_at": now,
            "created_at": now,
            "updated_at": now,
        }
        inserted = conversations.insert_one(conversation)
        conversation["_id"] = inserted.inserted_id

        messages.insert_one(
            {
                "conversation_id": conversation["_id"],
                "sender_email": "system@alumniconnect.local",
                "sender_name": "System",
                "text": f"{student.get('name', 'Student')} requested mentorship from {mentor.get('name', 'mentor')}.",
                "kind": "system",
                "created_at": now,
            }
        )
    else:
        conversations.update_one(
            {"_id": conversation["_id"]},
            {"$set": {"updated_at": datetime.utcnow(), "status": "active", "moderation_status": "active"}},
        )
        conversation = conversations.find_one({"_id": conversation["_id"]})

    return jsonify({"conversation": serialize_document(conversation)}), 201
