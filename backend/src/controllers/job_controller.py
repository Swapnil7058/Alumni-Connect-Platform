from datetime import datetime

from bson import ObjectId
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from src.config.database import mongo
from src.services.socket_service import emit_job_application_updated, emit_job_created, emit_job_deleted
from src.utils.serializers import serialize_document


def _job_match_score(job, user):
    user_profile = user.get("profile", {})
    user_skills = {skill.lower() for skill in user_profile.get("skills", [])}
    job_tags = {tag.lower() for tag in job.get("tags", [])}
    overlap = len(user_skills & job_tags)

    score = 45
    score += overlap * 18

    goals = " ".join(user_profile.get("career_goals", []))
    if goals and any(tag.lower() in goals.lower() for tag in job.get("tags", [])):
        score += 10

    return min(score, 98)


def _normalize_tags(tags):
    return [str(tag).strip() for tag in (tags or []) if str(tag).strip()]


def _can_post_jobs(user):
    return user and user.get("role") in {"alumni", "admin", "college"}


def _job_query_from_request():
    query = {}
    channel = (request.args.get("channel") or "").strip().lower()
    source = (request.args.get("source") or "").strip().lower()

    if channel == "linkedin":
        query["published_to_linkedin"] = True
    if source == "linkedin":
        query["source"] = "linkedin"
    return query


def _resolved_linkedin_status(job):
    if job.get("linkedin_post_urn") and job.get("linkedin_published_at"):
        return "published"
    if job.get("linkedin_post_url"):
        return "linked"
    if job.get("published_to_linkedin"):
        return "queued"
    return "draft"


@jwt_required()
def list_jobs_controller():
    user = mongo.db.users.find_one({"email": get_jwt_identity()}, {"password": 0})
    if not user:
        return jsonify({"msg": "User not found"}), 404

    jobs = list(mongo.db.job_posts.find(_job_query_from_request()).sort("created_at", -1))
    applications = list(mongo.db.job_applications.find({"applicant_email": user["email"]}))
    applied_ids = {str(item["job_id"]) for item in applications}

    enriched = []
    for job in jobs:
        item = serialize_document(job)
        item["linkedin_status"] = _resolved_linkedin_status(job)
        item["score"] = _job_match_score(job, user)
        item["applied"] = str(job["_id"]) in applied_ids
        item["application_count"] = mongo.db.job_applications.count_documents({"job_id": job["_id"]})
        enriched.append(item)

    enriched.sort(key=lambda item: (-item["score"], item["created_at"]), reverse=False)
    return jsonify({"jobs": enriched}), 200


@jwt_required()
def list_linkedin_jobs_controller():
    return list_jobs_controller()


@jwt_required()
def create_job_controller():
    user = mongo.db.users.find_one({"email": get_jwt_identity()}, {"password": 0})
    data = request.get_json() or {}

    if not _can_post_jobs(user):
        return jsonify({"msg": "Only alumni, admin, or college accounts can post jobs"}), 403

    title = (data.get("title") or "").strip()
    company = (data.get("company") or "").strip()
    description = (data.get("description") or "").strip()
    if not title or not company or not description:
        return jsonify({"msg": "Title, company, and description are required"}), 400

    profile = user.get("profile", {}) or {}
    linkedin_post_url = (data.get("linkedin_post_url") or "").strip()
    published_to_linkedin = bool(data.get("published_to_linkedin"))
    source = (data.get("source") or "internal").strip().lower()
    publisher_name = (
        (data.get("publisher_name") or "").strip()
        or profile.get("company")
        or user.get("name")
        or company
    )

    job = {
        "title": title,
        "company": company,
        "description": description,
        "tags": _normalize_tags(data.get("tags", [])),
        "link": (data.get("link") or "").strip(),
        "location": (data.get("location") or "").strip(),
        "posted_by": user.get("name"),
        "posted_by_email": user["email"],
        "poster_role": user.get("role"),
        "publisher_name": publisher_name,
        "source": "linkedin" if source == "linkedin" else "internal",
        "published_to_linkedin": published_to_linkedin or bool(linkedin_post_url),
        "linkedin_post_url": linkedin_post_url,
        "linkedin_status": "linked" if linkedin_post_url else ("queued" if published_to_linkedin else "draft"),
        "linkedin_caption": (data.get("linkedin_caption") or "").strip(),
        "visibility": (data.get("visibility") or "public").strip().lower() or "public",
        "created_at": datetime.utcnow(),
    }
    inserted = mongo.db.job_posts.insert_one(job)
    job["_id"] = inserted.inserted_id
    serialized_job = serialize_document(job)
    emit_job_created(serialized_job)
    return jsonify({"job": serialized_job}), 201


@jwt_required()
def delete_job_controller(job_id):
    if not ObjectId.is_valid(job_id):
        return jsonify({"msg": "Invalid job id"}), 400

    user = mongo.db.users.find_one({"email": get_jwt_identity()}, {"password": 0})
    if not _can_post_jobs(user):
        return jsonify({"msg": "Only alumni, admin, or college accounts can delete jobs"}), 403

    job_object_id = ObjectId(job_id)
    delete_result = mongo.db.job_posts.delete_one({"_id": job_object_id})
    if delete_result.deleted_count == 0:
        return jsonify({"msg": "Job not found"}), 404

    mongo.db.job_applications.delete_many({"job_id": job_object_id})
    emit_job_deleted(job_id)
    return jsonify({"msg": "Job deleted successfully"}), 200


@jwt_required()
def apply_to_job_controller(job_id):
    if not ObjectId.is_valid(job_id):
        return jsonify({"msg": "Invalid job id"}), 400

    user = mongo.db.users.find_one({"email": get_jwt_identity()}, {"password": 0})
    if not user or user.get("role") != "student":
        return jsonify({"msg": "Only students can apply"}), 403

    job_object_id = ObjectId(job_id)
    job = mongo.db.job_posts.find_one({"_id": job_object_id})
    if not job:
        return jsonify({"msg": "Job not found"}), 404

    existing = mongo.db.job_applications.find_one(
        {"job_id": job_object_id, "applicant_email": user["email"]}
    )
    if existing:
        return jsonify({"msg": "Already applied"}), 200

    application = {
        "job_id": job_object_id,
        "job_title": job.get("title"),
        "applicant_email": user["email"],
        "applicant_name": user.get("name"),
        "applied_at": datetime.utcnow(),
    }
    mongo.db.job_applications.insert_one(application)
    application_count = mongo.db.job_applications.count_documents({"job_id": job_object_id})
    emit_job_application_updated(
        str(job_object_id),
        {
            "applicationCount": application_count,
            "applicantEmail": user["email"],
            "applicantName": user.get("name"),
        },
    )
    return jsonify({"msg": "Application submitted"}), 201
