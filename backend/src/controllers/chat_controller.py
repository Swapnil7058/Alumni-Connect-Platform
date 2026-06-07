from datetime import datetime
from bson import ObjectId
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from src.config.database import mongo
from src.services.socket_service import emit_conversation_update
from src.utils.serializers import serialize_document


def _conversation_filter_for_user(email):
    return {"participant_emails": email}


def _get_current_user():
    email = get_jwt_identity()
    return mongo.db.users.find_one({"email": email}, {"password": 0})


@jwt_required()
def list_conversations_controller():
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "User not found"}), 404

    conversations = list(
        mongo.db.conversations.find(_conversation_filter_for_user(current_user["email"])).sort("updated_at", -1)
    )

    return jsonify({"conversations": serialize_document(conversations)}), 200


@jwt_required()
def get_messages_controller(conversation_id):
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "User not found"}), 404

    if not ObjectId.is_valid(conversation_id):
        return jsonify({"msg": "Invalid conversation id"}), 400

    conversation = mongo.db.conversations.find_one(
        {"_id": ObjectId(conversation_id), "participant_emails": current_user["email"]}
    )
    if not conversation:
        return jsonify({"msg": "Conversation not found"}), 404

    messages = list(
        mongo.db.messages.find({"conversation_id": conversation["_id"]}).sort("created_at", 1)
    )
    return jsonify({"conversation": serialize_document(conversation), "messages": serialize_document(messages)}), 200


@jwt_required()
def send_message_controller(conversation_id):
    current_user = _get_current_user()
    data = request.get_json() or {}

    if not current_user:
        return jsonify({"msg": "User not found"}), 404

    if not ObjectId.is_valid(conversation_id):
        return jsonify({"msg": "Invalid conversation id"}), 400

    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"msg": "Message text is required"}), 400

    conversations = mongo.db.conversations
    messages = mongo.db.messages

    conversation = conversations.find_one(
        {"_id": ObjectId(conversation_id), "participant_emails": current_user["email"]}
    )
    if not conversation:
        return jsonify({"msg": "Conversation not found"}), 404

    if conversation.get("moderation_status") in {"muted", "closed"}:
        return jsonify({"msg": "This conversation is currently restricted by admin"}), 403

    now = datetime.utcnow()
    message = {
        "conversation_id": conversation["_id"],
        "sender_email": current_user["email"],
        "sender_name": current_user.get("name"),
        "sender_role": current_user.get("role"),
        "text": text,
        "kind": "user",
        "created_at": now,
    }
    inserted = messages.insert_one(message)
    message["_id"] = inserted.inserted_id

    conversations.update_one(
        {"_id": conversation["_id"]},
        {
            "$set": {
                "last_message": text,
                "last_message_at": now,
                "updated_at": now,
            }
        },
    )
    conversation = conversations.find_one({"_id": conversation["_id"]})
    serialized_message = serialize_document(message)
    emit_conversation_update(conversation, serialized_message)

    return jsonify({"message": serialized_message}), 201
