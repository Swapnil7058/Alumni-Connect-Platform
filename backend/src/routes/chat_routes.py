from flask import Blueprint

from src.controllers.chat_controller import (
    get_messages_controller,
    list_conversations_controller,
    send_message_controller,
)


chat_bp = Blueprint("chat", __name__)

chat_bp.route("/conversations", methods=["GET"])(list_conversations_controller)
chat_bp.route("/conversations/<conversation_id>/messages", methods=["GET"])(get_messages_controller)
chat_bp.route("/conversations/<conversation_id>/messages", methods=["POST"])(send_message_controller)
