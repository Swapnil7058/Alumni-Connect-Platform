from flask import Blueprint

from src.controllers.ai_tools_controller import (
    assistant_reply_controller,
    generate_article_controller,
    improve_resume_section_controller,
    generate_resume_controller,
)


ai_tools_bp = Blueprint("ai_tools", __name__)

ai_tools_bp.route("/resume/generate", methods=["POST"])(generate_resume_controller)
ai_tools_bp.route("/resume/improve-section", methods=["POST"])(improve_resume_section_controller)
ai_tools_bp.route("/articles/generate", methods=["POST"])(generate_article_controller)
ai_tools_bp.route("/assistant/reply", methods=["POST"])(assistant_reply_controller)
