from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

#database 로직
#
class UserInteraction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_input = db.Column(db.Text, nullable=False)
    server_response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Interaction(input='{self.user_input}', response='{self.server_response}')>"

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()