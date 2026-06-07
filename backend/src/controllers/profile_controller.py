from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from src.config.database import mongo

@jwt_required()
def update_profile_controller():
    """
    Updates the nested 'profile' object in MongoDB.
    Uses the $set operator to avoid overwriting other user data.
    """
    current_user_email = get_jwt_identity()
    data = request.json  # Expecting: { "headline": "...", "bio": "...", "skills": ["React", "Flask"] }
    
    # Structure the update for nested fields
    update_fields = {}
    if data:
        for key, value in data.items():
            # This ensures we only target fields inside the 'profile' object
            update_fields[f"profile.{key}"] = value

    if not update_fields:
        return jsonify({"msg": "No data provided for update"}), 400

    result = mongo.db.users.update_one(
        {"email": current_user_email},
        {"$set": update_fields}
    )

    if result.modified_count > 0:
        return jsonify({"msg": "Profile updated successfully"}), 200
    return jsonify({"msg": "No changes made to the profile"}), 200

@jwt_required()
def get_my_profile_controller():
    """Fetch the full profile of the logged-in user."""
    email = get_jwt_identity()
    user = mongo.db.users.find_one({"email": email}, {"password": 0, "_id": 0})
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify(user), 200

def get_public_profile_controller(email):
    """Fetch profile data for public viewing (e.g., student looking at an alumni)"""
    # Exclude sensitive system data like PRN or last_login for public view
    user = mongo.db.users.find_one(
        {"email": email}, 
        {"password": 0, "_id": 0, "profile.prn_id": 0, "last_login": 0}
    )
    
    if not user:
        return jsonify({"msg": "Profile not found"}), 404
    return jsonify(user), 200