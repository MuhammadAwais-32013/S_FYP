import os
import csv
from datetime import datetime
from flask import Flask
from models import db, User, BMI, DietPlan, MedicalRecord
import json

# Create a Flask app for database access
app = Flask(__name__)

# Database configuration
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'diet_consultant.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db.init_app(app)

# Create an exports directory if it doesn't exist
export_dir = os.path.join(os.path.dirname(__file__), 'exports')
if not os.path.exists(export_dir):
    os.makedirs(export_dir)

def timestamp():
    """Generate a timestamp string for filenames"""
    return datetime.now().strftime('%Y%m%d_%H%M%S')

def export_users():
    """Export all users to a CSV file"""
    filename = os.path.join(export_dir, f'users_{timestamp()}.csv')
    
    with app.app_context():
        users = User.query.all()
        
        with open(filename, 'w', newline='') as csvfile:
            fieldnames = ['id', 'name', 'email', 'created_at']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for user in users:
                writer.writerow({
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'created_at': user.created_at.isoformat()
                })
    
    print(f"Exported {len(users)} users to {filename}")
    return filename

def export_bmi_records():
    """Export all BMI records to a CSV file"""
    filename = os.path.join(export_dir, f'bmi_records_{timestamp()}.csv')
    
    with app.app_context():
        records = BMI.query.all()
        
        with open(filename, 'w', newline='') as csvfile:
            fieldnames = ['id', 'user_id', 'height', 'weight', 'bmi', 'category', 'timestamp']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for record in records:
                writer.writerow({
                    'id': record.id,
                    'user_id': record.user_id,
                    'height': record.height,
                    'weight': record.weight,
                    'bmi': record.bmi,
                    'category': record.category,
                    'timestamp': record.timestamp.isoformat()
                })
    
    print(f"Exported {len(records)} BMI records to {filename}")
    return filename

def export_diet_plans():
    """Export all diet plans to a CSV file"""
    filename = os.path.join(export_dir, f'diet_plans_{timestamp()}.csv')
    
    with app.app_context():
        plans = DietPlan.query.all()
        
        with open(filename, 'w', newline='') as csvfile:
            fieldnames = ['id', 'user_id', 'bmi', 'plan', 'created_at']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for plan in plans:
                writer.writerow({
                    'id': plan.id,
                    'user_id': plan.user_id,
                    'bmi': plan.bmi,
                    'plan': plan.plan,  # This is a JSON string
                    'created_at': plan.created_at.isoformat()
                })
    
    print(f"Exported {len(plans)} diet plans to {filename}")
    return filename

def export_medical_records():
    """Export all medical records to a CSV file"""
    filename = os.path.join(export_dir, f'medical_records_{timestamp()}.csv')
    
    with app.app_context():
        records = MedicalRecord.query.all()
        
        with open(filename, 'w', newline='') as csvfile:
            fieldnames = ['id', 'user_id', 'date', 'bp', 'sugar', 'notes', 'created_at']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for record in records:
                writer.writerow({
                    'id': record.id,
                    'user_id': record.user_id,
                    'date': record.date.isoformat(),
                    'bp': record.bp,
                    'sugar': record.sugar,
                    'notes': record.notes,
                    'created_at': record.created_at.isoformat()
                })
    
    print(f"Exported {len(records)} medical records to {filename}")
    return filename

def export_all_data():
    """Export all database tables to CSV files"""
    print("Starting database export to CSV...")
    
    users_file = export_users()
    bmi_file = export_bmi_records()
    diet_plans_file = export_diet_plans()
    medical_records_file = export_medical_records()
    
    print("\nExport completed successfully!")
    print(f"Users: {users_file}")
    print(f"BMI Records: {bmi_file}")
    print(f"Diet Plans: {diet_plans_file}")
    print(f"Medical Records: {medical_records_file}")

if __name__ == "__main__":
    export_all_data() 