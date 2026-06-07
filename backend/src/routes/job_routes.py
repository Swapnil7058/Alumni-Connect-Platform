from flask import Blueprint

from src.controllers.job_controller import (
    apply_to_job_controller,
    create_job_controller,
    delete_job_controller,
    list_linkedin_jobs_controller,
    list_jobs_controller,
)


job_bp = Blueprint("jobs", __name__)

job_bp.route("/", methods=["GET"])(list_jobs_controller)
job_bp.route("/linkedin", methods=["GET"])(list_linkedin_jobs_controller)
job_bp.route("/", methods=["POST"])(create_job_controller)
job_bp.route("/<job_id>", methods=["DELETE"])(delete_job_controller)
job_bp.route("/<job_id>/apply", methods=["POST"])(apply_to_job_controller)
