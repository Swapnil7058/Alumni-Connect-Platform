import os
from pymongo import MongoClient
from pymongo.errors import PyMongoError


class MongoExtension:
    def __init__(self):
        self.client = None
        self.db = None

    def init_app(self, app):
        mongo_uri = app.config["MONGO_URI"]
        self.client = MongoClient(mongo_uri)

        database_name = app.config.get("MONGO_DBNAME")
        if not database_name:
            database_name = self.client.get_default_database().name if self.client.get_default_database() else None

        if not database_name:
            raise ValueError("Mongo database name could not be resolved from MONGO_URI")

        self.db = self.client[database_name]


mongo = MongoExtension()

def init_mongodb(app):
    """
    Initializes MongoDB as the primary database for both 
    structured and unstructured data[cite: 395, 452].
    """
    # Use your local URI
    app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/alumniconnectDB")
    app.config["MONGO_DBNAME"] = os.getenv("MONGO_DBNAME", "alumniconnectDB")
    mongo.init_app(app)
    
    # Simple check to confirm connection
    with app.app_context():
        try:
            mongo.db.command('ping')
            print(f"Successfully connected to MongoDB database '{app.config['MONGO_DBNAME']}'")
        except (PyMongoError, ValueError) as e:
            print(f"MongoDB connection failed: {e}")
