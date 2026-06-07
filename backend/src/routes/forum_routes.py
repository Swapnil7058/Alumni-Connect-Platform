from flask import Blueprint

from src.controllers.forum_controller import (
    create_forum_post_controller,
    list_forum_posts_controller,
)


forum_bp = Blueprint("forum", __name__)

forum_bp.route("/posts", methods=["GET"])(list_forum_posts_controller)
forum_bp.route("/posts", methods=["POST"])(create_forum_post_controller)
