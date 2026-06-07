from flask import Blueprint
from src.controllers.auth_controller import (
    register_controller,
    login_controller,
    get_me_controller,
    logout_controller
)

auth_bp = Blueprint("auth", __name__)

auth_bp.route("/register", methods=["POST"])(register_controller)
auth_bp.route("/login", methods=["POST"])(login_controller)
auth_bp.route("/me", methods=["GET"])(get_me_controller)
auth_bp.route("/logout", methods=["POST"])(logout_controller)
