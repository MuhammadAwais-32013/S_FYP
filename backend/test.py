import os
from flask import Flask
from models import db, User
import bcrypt

# Create a test app
app = Flask(__name__)

# Database configuration
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'diet_consultant.db')
print(f"Testing database at: {db_path}")
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db.init_app(app)

# Create a test user
def create_test_user():
    with app.app_context():
        try:
            # Check if user already exists
            test_email = 'test@example.com'
            existing_user = User.query.filter_by(email=test_email).first()
            
            if existing_user:
                print(f"Test user already exists with id: {existing_user.id}")
                return
            
            # Create a new test user
            hashed_password = bcrypt.hashpw(b'password123', bcrypt.gensalt())
            new_user = User(
                name='Test User',
                email=test_email,
                password=hashed_password.decode('utf-8')
            )
            
            db.session.add(new_user)
            db.session.commit()
            print(f"Test user created successfully with id: {new_user.id}")
            
        except Exception as e:
            print(f"Error creating test user: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    # Ensure tables exist
    with app.app_context():
        try:
            db.create_all()
            print("Database tables verified successfully")
        except Exception as e:
            print(f"Error verifying database tables: {str(e)}")
    
    # Create test user
    create_test_user()
    
    # List all users
    with app.app_context():
        users = User.query.all()
        print(f"Total users in database: {len(users)}")
        for user in users:
            print(f"User ID: {user.id}, Name: {user.name}, Email: {user.email}") 