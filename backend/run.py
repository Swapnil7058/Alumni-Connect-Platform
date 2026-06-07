import os
from src.app import create_app
from src.services.socket_service import socketio

app = create_app()


if __name__ == "__main__":
    socketio.run(
        app,
        debug=False,
        use_reloader=False,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
    )
