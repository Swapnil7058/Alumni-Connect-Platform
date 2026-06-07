from flask import Blueprint

from src.controllers.linkedin_controller import (
    linkedin_callback_controller,
    linkedin_connect_controller,
    linkedin_lookup_organization_controller,
    linkedin_status_controller,
    publish_job_to_linkedin_controller,
)


linkedin_bp = Blueprint("linkedin", __name__)

linkedin_bp.route("/status", methods=["GET"])(linkedin_status_controller)
linkedin_bp.route("/lookup-organization", methods=["GET"])(linkedin_lookup_organization_controller)
linkedin_bp.route("/connect", methods=["GET"])(linkedin_connect_controller)
linkedin_bp.route("/callback", methods=["GET"])(linkedin_callback_controller)
linkedin_bp.route("/publish-job/<job_id>", methods=["POST"])(publish_job_to_linkedin_controller)
