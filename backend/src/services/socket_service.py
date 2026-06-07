import os
from flask import request
from flask_jwt_extended import decode_token
from flask_socketio import SocketIO, emit, join_room



ALLOWED_ORIGINS = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:5173"
).split(",")

socketio = SocketIO(
    cors_allowed_origins=ALLOWED_ORIGINS,
    supports_credentials=True
)

def init_socketio(app):
    socketio.init_app(
        app,
        cors_allowed_origins=ALLOWED_ORIGINS
    )

def _resolve_socket_identity():
    token = request.cookies.get("access_token_cookie")
    if not token:
        return None

    try:
        decoded = decode_token(token)
        return {
            "email": decoded.get("sub"),
            "role": decoded.get("role"),
        }
    except Exception:
        return None


def emit_conversation_update(conversation, message):
    participant_emails = conversation.get("participant_emails", [])
    conversation_id = str(conversation["_id"])

    socketio.emit("chat:message", message, room=f"conversation:{conversation_id}")

    for email in participant_emails:
        socketio.emit(
            "chat:conversation-updated",
            {
                "conversationId": conversation_id,
                "lastMessage": message,
            },
            room=f"user:{email}",
        )


def emit_job_created(job):
    socketio.emit("jobs:created", job, room="jobs:feed")


def emit_job_deleted(job_id):
    socketio.emit("jobs:deleted", {"jobId": job_id}, room="jobs:feed")


def emit_job_application_updated(job_id, payload):
    socketio.emit(
        "jobs:application-updated",
        {
            "jobId": job_id,
            **payload,
        },
        room="jobs:feed",
    )


def emit_job_linkedin_updated(job):
    socketio.emit("jobs:linkedin-updated", job, room="jobs:feed")


@socketio.on("connect")
def handle_connect():
    identity = _resolve_socket_identity()
    if not identity or not identity.get("email"):
        return False

    join_room(f"user:{identity['email']}")
    join_room("jobs:feed")
    if identity.get("role"):
        join_room(f"role:{identity['role']}")
    emit("socket:ready", {"email": identity["email"], "role": identity.get("role")})


@socketio.on("join_conversation")
def handle_join_conversation(payload):
    identity = _resolve_socket_identity()
    if not identity or not payload or not payload.get("conversationId"):
        return

    join_room(f"conversation:{payload['conversationId']}")
    emit("chat:joined", {"conversationId": payload["conversationId"]})
