from flask import Blueprint

from src.controllers.mentorship_controller import (
    get_recommendations_controller,
    request_mentor_controller,
)


mentorship_bp = Blueprint("mentorship", __name__)

mentorship_bp.route("/recommendations", methods=["GET"])(get_recommendations_controller)
mentorship_bp.route("/request/<mentor_id>", methods=["POST"])(request_mentor_controller)
