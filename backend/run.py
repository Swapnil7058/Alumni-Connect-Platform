from src.app import create_app
from src.services.socket_service import socketio

app = create_app()

if __name__ == "__main__":
    socketio.run(app, debug=True, use_reloader=False, port=5000)
    
