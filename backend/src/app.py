import os
from datetime import timedelta
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Import internal modules
from src.config.database import init_mongodb
from src.routes.auth_routes import auth_bp
from src.routes.profile_routes import profile_bp
from src.routes.admin_routes import admin_bp
from src.routes.chat_routes import chat_bp
from src.routes.mentorship_routes import mentorship_bp
from src.routes.forum_routes import forum_bp
from src.routes.job_routes import job_bp
from src.routes.linkedin_routes import linkedin_bp
from src.routes.ai_tools_routes import ai_tools_bp
from src.services.socket_service import init_socketio

load_dotenv()


def _get_allowed_origins():
    configured_origins = os.getenv("FRONTEND_ORIGINS")
    if configured_origins:
        return [
            origin.strip()
            for origin in configured_origins.split(",")
            if origin.strip()
        ]

    return [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ]


def create_app():
    app = Flask(__name__)

    # ✅ CORS Configuration (REQUIRED FOR COOKIES)
    CORS(
        app,
        supports_credentials=True,
        origins=_get_allowed_origins(),
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

    # ✅ JWT & Security Configuration
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret-key")

    # ⭐ IMPORTANT FOR COOKIE AUTH
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    app.config["JWT_ACCESS_COOKIE_PATH"] = "/"
    app.config["JWT_COOKIE_HTTPONLY"] = True
    app.config["JWT_COOKIE_SECURE"] = True  # True in HTTPS only
    app.config["JWT_COOKIE_SAMESITE"] = "None"

    # 🚨 ADD THIS LINE (THIS FIXES YOUR 401)
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False

    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=2)

    # Initialize Extensions
    init_mongodb(app)
    init_socketio(app)
    jwt = JWTManager(app)

    # Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(mentorship_bp, url_prefix='/api/mentorship')
    app.register_blueprint(forum_bp, url_prefix='/api/forum')
    app.register_blueprint(job_bp, url_prefix='/api/jobs')
    app.register_blueprint(linkedin_bp, url_prefix='/api/linkedin')
    app.register_blueprint(ai_tools_bp, url_prefix='/api/ai')

    @app.route("/")
    def home():
        return {"msg": "Alumni Connect Backend is Live"}, 200

    return app
