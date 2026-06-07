from datetime import datetime

class UserSchema:
    @staticmethod
    def format_user(data):
        """
        Structures the user document for MongoDB.
        Supports student, alumni, and admin roles.
        """

        role = data.get("role", "student").lower()

        return {
            "email": data.get("email").lower().strip(),
            "password": data.get("password"),  # Already hashed in controller
            "name": data.get("fullName"),
            "role": role,  # student / alumni / admin

            # 🔒 Alumni require admin approval
            "is_verified": False if role == "alumni" else True,

            "created_at": datetime.utcnow(),

            # 👤 Role-Specific Profile Data
            "profile": {
                "prn_id": data.get("prnOrId"),
                "graduation_year": data.get("graduationYear"),
                "headline": data.get("headline", ""),
                "bio": data.get("bio", ""),
                "skills": data.get("skills", []),
                "career_goals": data.get("careerGoals", []),
                "mentorship_topics": data.get("mentorshipTopics", []),
                "availability": data.get("availability", "open"),
                "location": data.get("location", ""),
                "communication_preference": data.get("communicationPreference", "chat"),
                "company": data.get("company", ""),
                "social_links": {
                    "linkedin": "",
                    "github": ""
                }
            },

            # ⚙️ System metadata
            "last_login": None,
            "account_status": "active"
        }
