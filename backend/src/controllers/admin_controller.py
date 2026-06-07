from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt
from bson import ObjectId
from src.config.database import mongo
from src.utils.serializers import serialize_document


# =========================
# INTERNAL ADMIN CHECK FUNCTION
# =========================
def is_admin():
    claims = get_jwt()
    return claims.get("role") == "admin"


def is_admin_or_alumni():
    claims = get_jwt()
    return claims.get("role") in ["admin", "alumni"]


# =========================
# 🔔 VERIFY ALUMNI (ADMIN ONLY)
# =========================
@jwt_required()
def verify_alumni_controller(user_id):
    # 🔒 Role Protection
    if not is_admin():
        return jsonify({"msg": "Admin access required"}), 403

    users = mongo.db.users

    try:
        result = users.update_one(
            {
                "_id": ObjectId(user_id),
                "role": "alumni"
            },
            {
                "$set": {"is_verified": True}
            }
        )

        if result.matched_count == 0:
            return jsonify({"msg": "Alumni user not found"}), 404

        return jsonify({
            "msg": "Alumni verified successfully"
        }), 200

    except Exception as e:
        return jsonify({
            "msg": f"Verification failed: {str(e)}"
        }), 500


# =========================
# 🎓 GET ALL STUDENTS (ADMIN ONLY)
# =========================
@jwt_required()
def get_all_students_controller():
    if not is_admin_or_alumni():
        return jsonify({"msg": "Admin or alumni access required"}), 403

    users = mongo.db.users

    students = list(users.find(
        {"role": "student"},
        {"password": 0}
    ))

    for student in students:
        student["_id"] = str(student["_id"])

    return jsonify({
        "count": len(students),
        "students": students
    }), 200


# =========================
# 👨‍💼 GET ALL VERIFIED ALUMNI (ADMIN ONLY)
# =========================
@jwt_required()
def get_verified_alumni_controller():
    if not is_admin():
        return jsonify({"msg": "Admin access required"}), 403

    users = mongo.db.users

    alumni = list(users.find(
        {"role": "alumni", "is_verified": True},
        {"password": 0}
    ))

    for alum in alumni:
        alum["_id"] = str(alum["_id"])

    return jsonify({
        "count": len(alumni),
        "alumni": alumni
    }), 200


# =========================
# 📋 GET PENDING ALUMNI (ADMIN PANEL)
# =========================
@jwt_required()
def get_pending_alumni_controller():
    if not is_admin():
        return jsonify({"msg": "Admin access required"}), 403

    alumni = list(
        mongo.db.users.find(
            {"role": "alumni", "is_verified": False},
            {"password": 0}
        )
    )

    for user in alumni:
        user["_id"] = str(user["_id"])

    return jsonify({
        "count": len(alumni),
        "pending_alumni": alumni
    }), 200


@jwt_required()
def get_admin_overview_controller():
    if not is_admin():
        return jsonify({"msg": "Admin access required"}), 403

    users = mongo.db.users
    conversations = mongo.db.conversations
    messages = mongo.db.messages
    job_posts = mongo.db.job_posts
    job_applications = mongo.db.job_applications

    overview = {
        "students": users.count_documents({"role": "student"}),
        "verified_alumni": users.count_documents({"role": "alumni", "is_verified": True}),
        "pending_alumni": users.count_documents({"role": "alumni", "is_verified": False}),
        "active_conversations": conversations.count_documents({"status": "active"}),
        "flagged_conversations": conversations.count_documents({"moderation_status": {"$in": ["flagged", "muted"]}}),
        "mentorship_requests": conversations.count_documents({"type": "mentorship"}),
        "messages_sent": messages.count_documents({}),
        "job_posts": job_posts.count_documents({}),
        "job_applications": job_applications.count_documents({}),
        "forum_posts": mongo.db.forum_posts.count_documents({}),
        "flagged_forum_posts": mongo.db.forum_posts.count_documents({"sentiment.flagged": True}),
    }

    return jsonify({"overview": overview}), 200


@jwt_required()
def get_conversations_controller():
    if not is_admin():
        return jsonify({"msg": "Admin access required"}), 403

    conversations = list(mongo.db.conversations.find().sort("updated_at", -1))
    serialized = []

    for conversation in conversations:
        item = serialize_document(conversation)
        item["message_count"] = mongo.db.messages.count_documents({"conversation_id": conversation["_id"]})
        serialized.append(item)

    return jsonify({"conversations": serialized}), 200


@jwt_required()
def update_conversation_status_controller(conversation_id):
    if not is_admin():
        return jsonify({"msg": "Admin access required"}), 403

    from flask import request

    data = request.get_json() or {}
    moderation_status = data.get("moderation_status", "active")
    admin_note = data.get("admin_note", "")

    if not ObjectId.is_valid(conversation_id):
        return jsonify({"msg": "Invalid conversation id"}), 400

    mongo.db.conversations.update_one(
        {"_id": ObjectId(conversation_id)},
        {
            "$set": {
                "moderation_status": moderation_status,
                "admin_note": admin_note,
            }
        },
    )

    conversation = mongo.db.conversations.find_one({"_id": ObjectId(conversation_id)})
    if not conversation:
        return jsonify({"msg": "Conversation not found"}), 404

    return jsonify({"conversation": serialize_document(conversation)}), 200
