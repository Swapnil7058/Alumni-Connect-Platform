from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from flask import jsonify


def role_required(allowed_roles):
    """
    Middleware to restrict access based on user role.
    Example:
        @role_required(["admin"])
        @role_required(["student", "alumni"])
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()

            user_role = claims.get("role")

            if user_role not in allowed_roles:
                return jsonify({
                    "msg": "Access forbidden: Insufficient permissions",
                    "required_roles": allowed_roles
                }), 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper


def admin_required(fn):
    """Shortcut middleware for admin-only routes"""
    @wraps(fn)
    def decorator(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()

        if claims.get("role") != "admin":
            return jsonify({"msg": "Admin access only"}), 403

        return fn(*args, **kwargs)
    return decorator
