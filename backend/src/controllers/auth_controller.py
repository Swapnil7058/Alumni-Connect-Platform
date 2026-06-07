import bcrypt
from datetime import datetime

from flask import jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
    set_access_cookies,
    unset_jwt_cookies,
)

from src.config.database import mongo
from src.models.user_model import UserSchema


def _auth_error(message, status_code):
    response = jsonify({"msg": message})
    unset_jwt_cookies(response)
    return response, status_code


def register_controller():
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password") or not data.get("role"):
        return jsonify({"msg": "Email, password and role are required"}), 400

    users = mongo.db.users
    email = data["email"].lower().strip()

    if users.find_one({"email": email}):
        return jsonify({"msg": "User already exists"}), 400

    hashed_password = bcrypt.hashpw(
        data["password"].encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")

    data["password"] = hashed_password
    new_user = UserSchema.format_user(data)
    users.insert_one(new_user)

    return jsonify({"msg": "Registration successful. Await admin approval if alumni."}), 201


def login_controller():
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password") or not data.get("role"):
       return _auth_error("Email, password and role required", 400)

    email = data["email"].lower().strip()
    requested_role = data["role"].lower().strip()
    user = mongo.db.users.find_one({"email": email})

    if not user:
       return _auth_error("Invalid credentials", 401)

    if not bcrypt.checkpw(
        data["password"].encode("utf-8"),
        user["password"].encode("utf-8"),
    ):
        return _auth_error("Invalid credentials", 401)

    actual_role = user.get("role")
    if actual_role != requested_role:
        return _auth_error(f"Please login from the correct portal.", 403)

    if actual_role == "alumni" and not user.get("is_verified", False):
        return _auth_error("Your alumni account is pending admin approval.", 403)

    mongo.db.users.update_one(
        {"email": email},
        {"$set": {"last_login": datetime.utcnow()}},
    )

    access_token = create_access_token(
        identity=user["email"],
        additional_claims={
            "role": actual_role,
            "is_verified": user.get("is_verified", True),
        },
    )

    response = jsonify(
        {
            "msg": "Login successful",
            "user": {
                "email": user["email"],
                "role": actual_role,
                "name": user.get("name"),
                "is_verified": user.get("is_verified", True),
            },
        }
    )

    set_access_cookies(response, access_token)
    return response, 200


@jwt_required()
def get_me_controller():
    current_user_email = get_jwt_identity()
    claims = get_jwt()

    user = mongo.db.users.find_one({"email": current_user_email}, {"password": 0})
    if not user:
        return jsonify({"msg": "User not found"}), 404

    return (
        jsonify(
            {
                "user": {
                    "email": user["email"],
                    "role": claims.get("role"),
                    "name": user.get("name"),
                    "is_verified": user.get("is_verified", True),
                }
            }
        ),
        200,
    )


def logout_controller():
    response = jsonify({"msg": "Logout successful"})
    unset_jwt_cookies(response)
    return response, 200