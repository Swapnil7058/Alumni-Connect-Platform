from flask import Blueprint
from src.controllers.admin_controller import (
    verify_alumni_controller,
    get_all_students_controller,
    get_verified_alumni_controller,
    get_pending_alumni_controller,
    get_admin_overview_controller,
    get_conversations_controller,
    update_conversation_status_controller,
)

admin_bp = Blueprint("admin", __name__)

# 🔔 Verify Alumni
@admin_bp.route("/verify-alumni/<user_id>", methods=["PUT"])
def verify_alumni(user_id):
    return verify_alumni_controller(user_id)


# 🎓 Get All Students
@admin_bp.route("/students", methods=["GET"])
def get_students():
    return get_all_students_controller()


# 👨‍💼 Get Verified Alumni
@admin_bp.route("/alumni", methods=["GET"])
def get_alumni():
    return get_verified_alumni_controller()


# 📋 Get Pending Alumni
@admin_bp.route("/pending-alumni", methods=["GET"])
def get_pending():
    return get_pending_alumni_controller()


@admin_bp.route("/overview", methods=["GET"])
def get_overview():
    return get_admin_overview_controller()


@admin_bp.route("/conversations", methods=["GET"])
def get_conversations():
    return get_conversations_controller()


@admin_bp.route("/conversations/<conversation_id>/moderate", methods=["PUT"])
def moderate_conversation(conversation_id):
    return update_conversation_status_controller(conversation_id)
