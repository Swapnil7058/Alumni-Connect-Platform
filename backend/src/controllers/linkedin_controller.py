import json
import os
from datetime import datetime, timedelta
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from bson import ObjectId
from flask import jsonify, redirect, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from itsdangerous import BadSignature, URLSafeSerializer

from src.config.database import mongo
from src.services.socket_service import emit_job_linkedin_updated
from src.utils.serializers import serialize_document


LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_POSTS_URL = "https://api.linkedin.com/rest/posts"
LINKEDIN_ORGANIZATIONS_URL = "https://api.linkedin.com/rest/organizations"


def _serializer():
    secret = os.getenv("JWT_SECRET_KEY", "fallback-secret-key")
    return URLSafeSerializer(secret, salt="linkedin-organization-auth")


def _frontend_url():
    return os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")


def _linkedin_version():
    return os.getenv("LINKEDIN_VERSION", "202604").strip() or "202604"


def _organization_urn():
    return os.getenv("LINKEDIN_ORGANIZATION_URN", "").strip()


def _get_linkedin_config_error():
    if not os.getenv("LINKEDIN_CLIENT_ID", "").strip():
        return "Missing LINKEDIN_CLIENT_ID"
    if not os.getenv("LINKEDIN_CLIENT_SECRET", "").strip():
        return "Missing LINKEDIN_CLIENT_SECRET"
    if not os.getenv("LINKEDIN_REDIRECT_URI", "").strip():
        return "Missing LINKEDIN_REDIRECT_URI"
    if not _organization_urn():
        return "Missing LINKEDIN_ORGANIZATION_URN"
    return ""


def _platform_settings_collection():
    return mongo.db.platform_settings


def _get_org_auth():
    return _platform_settings_collection().find_one({"_id": "linkedin_org_auth"}) or {}


def _redirect_to_jobs(status, message=""):
    query = {"linkedin": status}
    if message:
        query["message"] = message
    return redirect(f"{_frontend_url()}/admin/jobs?{urlencode(query)}")


def _encode_form(data):
    return urlencode(data).encode("utf-8")


def _exchange_code_for_token(code):
    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": os.getenv("LINKEDIN_REDIRECT_URI", "").strip(),
        "client_id": os.getenv("LINKEDIN_CLIENT_ID", "").strip(),
        "client_secret": os.getenv("LINKEDIN_CLIENT_SECRET", "").strip(),
    }

    request_obj = Request(
        LINKEDIN_TOKEN_URL,
        data=_encode_form(payload),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    with urlopen(request_obj, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def _safe_caption(job):
    custom_caption = (job.get("linkedin_caption") or "").strip()
    if custom_caption:
        return custom_caption

    tags = " ".join(
        f"#{str(tag).replace(' ', '')}" for tag in (job.get("tags") or [])[:6]
    )
    lines = [
        f"We are hiring for {job.get('title')} at {job.get('company')}.",
        f"Location: {job.get('location')}" if job.get("location") else "",
        job.get("description") or "",
        f"Apply here: {job.get('link')}" if job.get("link") else "",
        tags,
    ]
    return "\n\n".join(line for line in lines if line)


def _publish_to_linkedin(access_token, commentary):
    body = {
        "author": _organization_urn(),
        "commentary": commentary,
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False,
    }

    request_obj = Request(
        LINKEDIN_POSTS_URL,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
            "Linkedin-Version": _linkedin_version(),
        },
        method="POST",
    )

    with urlopen(request_obj, timeout=20) as response:
        response_body = response.read().decode("utf-8")
        payload = json.loads(response_body) if response_body else {}
        post_urn = response.headers.get("x-restli-id") or payload.get("id") or payload.get("urn")
        return {"payload": payload, "post_urn": post_urn}


def _lookup_organization_by_vanity(access_token, vanity_name):
    query = urlencode({"q": "vanityName", "vanityName": vanity_name})
    request_obj = Request(
        f"{LINKEDIN_ORGANIZATIONS_URL}?{query}",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
            "Linkedin-Version": _linkedin_version(),
        },
        method="GET",
    )

    with urlopen(request_obj, timeout=20) as response:
        response_body = response.read().decode("utf-8")
        return json.loads(response_body) if response_body else {}


@jwt_required()
def linkedin_status_controller():
    user = mongo.db.users.find_one({"email": get_jwt_identity()}, {"password": 0})
    if not user:
        return jsonify({"msg": "User not found"}), 404

    org_auth = _get_org_auth()
    connected = bool(org_auth.get("connected") and org_auth.get("access_token"))

    return (
        jsonify(
            {
                "connected": connected,
                "organization_urn": org_auth.get("organization_urn") or _organization_urn(),
                "connected_by": org_auth.get("connected_by"),
                "connected_at": org_auth.get("connected_at"),
                "expires_at": org_auth.get("expires_at"),
                "config_error": _get_linkedin_config_error(),
                "can_manage": user.get("role") == "admin",
            }
        ),
        200,
    )


@jwt_required()
def linkedin_lookup_organization_controller():
    user = mongo.db.users.find_one({"email": get_jwt_identity()}, {"password": 0})
    if not user:
        return jsonify({"msg": "User not found"}), 404

    if user.get("role") != "admin":
        return jsonify({"msg": "Only admins can look up organization ids"}), 403

    org_auth = _get_org_auth()
    access_token = org_auth.get("access_token")
    if not org_auth.get("connected") or not access_token:
        return jsonify({"msg": "Connect the organization LinkedIn account first"}), 400

    vanity_name = (request.args.get("vanityName") or "").strip()
    if not vanity_name:
        return jsonify({"msg": "vanityName query parameter is required"}), 400

    try:
        payload = _lookup_organization_by_vanity(access_token, vanity_name)
    except Exception:
        return jsonify({"msg": "LinkedIn organization lookup failed"}), 502

    elements = payload.get("elements") or []
    if not elements:
        return jsonify({"msg": "No LinkedIn organization found for that vanity name"}), 404

    organization = elements[0]
    organization_id = organization.get("id")
    organization_urn = f"urn:li:organization:{organization_id}" if organization_id else ""

    return (
        jsonify(
            {
                "organization": organization,
                "organization_id": organization_id,
                "organization_urn": organization_urn,
            }
        ),
        200,
    )


@jwt_required()
def linkedin_connect_controller():
    user = mongo.db.users.find_one({"email": get_jwt_identity()}, {"password": 0})
    if not user:
        return jsonify({"msg": "User not found"}), 404

    if user.get("role") != "admin":
        return jsonify({"msg": "Only admins can connect the organization LinkedIn account"}), 403

    config_error = _get_linkedin_config_error()
    if config_error:
        return jsonify({"msg": config_error}), 500

    state = _serializer().dumps(
        {
            "email": user["email"],
            "role": user.get("role"),
            "ts": datetime.utcnow().isoformat(),
        }
    )

    auth_url = (
        f"{LINKEDIN_AUTH_URL}?"
        + urlencode(
            {
                "response_type": "code",
                "client_id": os.getenv("LINKEDIN_CLIENT_ID", "").strip(),
                "redirect_uri": os.getenv("LINKEDIN_REDIRECT_URI", "").strip(),
                "state": state,
                "scope": os.getenv("LINKEDIN_SCOPE", "w_organization_social").strip() or "w_organization_social",
            }
        )
    )
    return redirect(auth_url)


def linkedin_callback_controller():
    state = request.args.get("state", "")
    code = request.args.get("code", "")
    error = request.args.get("error")
    error_description = request.args.get("error_description", "LinkedIn authorization was not completed.")

    if not state:
        return _redirect_to_jobs("error", "Missing LinkedIn state.")

    try:
        state_payload = _serializer().loads(state)
    except BadSignature:
        return _redirect_to_jobs("error", "Invalid LinkedIn state.")

    if error:
        return _redirect_to_jobs("error", error_description)

    if not code:
        return _redirect_to_jobs("error", "LinkedIn did not return an authorization code.")

    try:
        token_payload = _exchange_code_for_token(code)
    except Exception:
        return _redirect_to_jobs("error", "LinkedIn token exchange failed.")

    access_token = token_payload.get("access_token")
    if not access_token:
        return _redirect_to_jobs("error", "LinkedIn did not provide an access token.")

    expires_at = datetime.utcnow() + timedelta(seconds=int(token_payload.get("expires_in") or 0))

    _platform_settings_collection().update_one(
        {"_id": "linkedin_org_auth"},
        {
            "$set": {
                "connected": True,
                "access_token": access_token,
                "scope": token_payload.get("scope", os.getenv("LINKEDIN_SCOPE", "w_organization_social")),
                "organization_urn": _organization_urn(),
                "connected_by": state_payload.get("email"),
                "connected_at": datetime.utcnow().isoformat(),
                "expires_at": expires_at.isoformat(),
            }
        },
        upsert=True,
    )

    return _redirect_to_jobs("connected")


@jwt_required()
def publish_job_to_linkedin_controller(job_id):
    user = mongo.db.users.find_one({"email": get_jwt_identity()}, {"password": 0})
    if not user or user.get("role") not in {"alumni", "admin", "college"}:
        return jsonify({"msg": "Only alumni, admin, or college accounts can publish jobs to LinkedIn"}), 403

    if not ObjectId.is_valid(job_id):
        return jsonify({"msg": "Invalid job id"}), 400

    config_error = _get_linkedin_config_error()
    if config_error:
        return jsonify({"msg": config_error}), 500

    org_auth = _get_org_auth()
    access_token = org_auth.get("access_token")
    if not org_auth.get("connected") or not access_token:
        return jsonify({"msg": "The organization LinkedIn account is not connected yet"}), 400

    job = mongo.db.job_posts.find_one({"_id": ObjectId(job_id)})
    if not job:
        return jsonify({"msg": "Job not found"}), 404

    if job.get("linkedin_post_urn") and job.get("linkedin_published_at"):
        return jsonify({"msg": "Job already published to LinkedIn", "job": serialize_document(job)}), 200

    commentary = _safe_caption(job)

    try:
        publish_result = _publish_to_linkedin(access_token, commentary)
    except Exception:
        return jsonify({"msg": "LinkedIn publishing failed. Check scopes, organization URN, and page permissions."}), 502

    post_urn = publish_result.get("post_urn")
    linkedin_post_url = (
        f"https://www.linkedin.com/feed/update/{quote(post_urn, safe='')}/" if post_urn else ""
    )

    mongo.db.job_posts.update_one(
        {"_id": job["_id"]},
        {
            "$set": {
                "published_to_linkedin": True,
                "linkedin_status": "published",
                "linkedin_post_url": linkedin_post_url,
                "linkedin_post_urn": post_urn,
                "linkedin_caption": commentary,
                "linkedin_published_at": datetime.utcnow(),
                "linkedin_published_by": user.get("email"),
            }
        },
    )

    updated_job = mongo.db.job_posts.find_one({"_id": job["_id"]})
    serialized_job = serialize_document(updated_job)
    emit_job_linkedin_updated(serialized_job)
    return jsonify({"msg": "Job published to LinkedIn", "job": serialized_job}), 200
