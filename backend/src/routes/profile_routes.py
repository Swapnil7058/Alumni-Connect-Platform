from flask import Blueprint
from src.controllers.profile_controller import (
    update_profile_controller, 
    get_my_profile_controller, 
    get_public_profile_controller
)

profile_bp = Blueprint('profile', __name__)

# Update current user profile
@profile_bp.route('/update', methods=['PUT'])
def update():
    return update_profile_controller()

# Get current user profile (Private)
@profile_bp.route('/me', methods=['GET'])
def get_me():
    return get_my_profile_controller()

# Get any user profile (Public)
@profile_bp.route('/<email>', methods=['GET'])
def get_public(email):
    return get_public_profile_controller(email)