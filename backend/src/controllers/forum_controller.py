from datetime import datetime

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from src.config.database import mongo
from src.services.sentiment_service import analyze_sentiment
from src.utils.serializers import serialize_document


def _community_health(posts):
    if not posts:
        return {"score": 0.92, "label": "Healthy"}

    average = sum(post.get("sentiment", {}).get("score", 0.5) for post in posts) / len(posts)
    label = "Healthy" if average >= 0.65 else "Monitor" if average >= 0.45 else "At Risk"
    return {"score": round(average, 2), "label": label}


@jwt_required()
def list_forum_posts_controller():
    posts = list(mongo.db.forum_posts.find().sort("created_at", -1))
    return jsonify(
        {
            "posts": serialize_document(posts),
            "community_health": _community_health(posts),
        }
    ), 200


@jwt_required()
def create_forum_post_controller():
    data = request.get_json() or {}
    content = (data.get("text") or "").strip()
    if not content:
        return jsonify({"msg": "Post text is required"}), 400

    user = mongo.db.users.find_one({"email": get_jwt_identity()}, {"password": 0})
    if not user:
        return jsonify({"msg": "User not found"}), 404

    sentiment = analyze_sentiment(content)
    post = {
        "user_email": user["email"],
        "user_name": user.get("name"),
        "role": user.get("role"),
        "company": user.get("profile", {}).get("company", ""),
        "text": content,
        "likes": 0,
        "replies": [],
        "sentiment": sentiment,
        "created_at": datetime.utcnow(),
    }
    inserted = mongo.db.forum_posts.insert_one(post)
    post["_id"] = inserted.inserted_id

    return jsonify({"post": serialize_document(post)}), 201
