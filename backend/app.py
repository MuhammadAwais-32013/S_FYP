import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, User, BMI, DietPlan, MedicalRecord
import bcrypt
import json
import csv
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Ensure instance folder exists
if not os.path.exists(os.path.join(os.path.dirname(__file__), 'instance')):
    os.makedirs(os.path.join(os.path.dirname(__file__), 'instance'))

# Create exports directory if it doesn't exist
export_dir = os.path.join(os.path.dirname(__file__), 'exports')
if not os.path.exists(export_dir):
    os.makedirs(export_dir)

# Database configuration - use explicit path
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'diet_consultant.db')
print(f"Using database at: {db_path}")
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db.init_app(app)

# Create tables
with app.app_context():
    try:
        db.create_all()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating database tables: {str(e)}")

# Helper functions for CSV export
def export_user_to_csv(user):
    """Append a user to the users CSV file"""
    filename = os.path.join(export_dir, 'users.csv')
    file_exists = os.path.isfile(filename)
    
    with open(filename, 'a', newline='') as csvfile:
        fieldnames = ['id', 'name', 'email', 'created_at']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        if not file_exists:
            writer.writeheader()
        
        writer.writerow({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'created_at': user.created_at.isoformat()
        })
    
    print(f"Exported user {user.id} to CSV")

def export_bmi_to_csv(bmi):
    """Append a BMI record to the CSV file"""
    filename = os.path.join(export_dir, 'bmi_records.csv')
    file_exists = os.path.isfile(filename)
    
    with open(filename, 'a', newline='') as csvfile:
        fieldnames = ['id', 'user_id', 'height', 'weight', 'bmi', 'category', 'timestamp']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        if not file_exists:
            writer.writeheader()
        
        writer.writerow({
            'id': bmi.id,
            'user_id': bmi.user_id,
            'height': bmi.height,
            'weight': bmi.weight,
            'bmi': bmi.bmi,
            'category': bmi.category,
            'timestamp': bmi.timestamp.isoformat()
        })
    
    print(f"Exported BMI record {bmi.id} to CSV")

def export_diet_plan_to_csv(plan):
    """Append a diet plan to the CSV file"""
    filename = os.path.join(export_dir, 'diet_plans.csv')
    file_exists = os.path.isfile(filename)
    
    with open(filename, 'a', newline='') as csvfile:
        fieldnames = ['id', 'user_id', 'bmi', 'plan', 'created_at']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        if not file_exists:
            writer.writeheader()
        
        writer.writerow({
            'id': plan.id,
            'user_id': plan.user_id,
            'bmi': plan.bmi,
            'plan': plan.plan,
            'created_at': plan.created_at.isoformat()
        })
    
    print(f"Exported diet plan {plan.id} to CSV")

def export_medical_record_to_csv(record):
    """Append a medical record to the CSV file"""
    filename = os.path.join(export_dir, 'medical_records.csv')
    file_exists = os.path.isfile(filename)
    
    with open(filename, 'a', newline='') as csvfile:
        fieldnames = ['id', 'user_id', 'date', 'bp', 'sugar', 'notes', 'created_at']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        if not file_exists:
            writer.writeheader()
        
        writer.writerow({
            'id': record.id,
            'user_id': record.user_id,
            'date': record.date.isoformat(),
            'bp': record.bp,
            'sugar': record.sugar,
            'notes': record.notes,
            'created_at': record.created_at.isoformat()
        })
    
    print(f"Exported medical record {record.id} to CSV")

# Helper function to get current user ID (in a real app, this would use JWT)
def get_current_user_id():
    # For simplicity, we'll just use a fixed user ID for testing
    # In a real app, you would get this from the JWT token
    return 1

# Authentication endpoints
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        print("Signup request received:", data)
        
        if not data:
            print("No JSON data in request")
            return jsonify({'success': False, 'error': 'No data provided'}), 400
            
        if not all(key in data for key in ['name', 'email', 'password']):
            print("Missing required fields in signup data")
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            print(f"Email already registered: {data['email']}")
            return jsonify({'success': False, 'error': 'Email already registered'}), 400
        
        # Hash the password
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        # Create new user
        new_user = User(
            name=data['name'],
            email=data['email'],
            password=hashed_password.decode('utf-8')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Export new user to CSV
        export_user_to_csv(new_user)
        
        print(f"User created successfully: {data['email']}")
        return jsonify({'success': True, 'message': 'User registered successfully'}), 201
    except Exception as e:
        print(f"Error in signup endpoint: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        print("Login request received for:", data.get('email', 'unknown'))
        
        if not data:
            print("No JSON data in login request")
            return jsonify({'success': False, 'error': 'No data provided'}), 400
            
        if not all(key in data for key in ['email', 'password']):
            print("Missing required fields in login data")
            return jsonify({'success': False, 'error': 'Missing email or password'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            print(f"No user found with email: {data['email']}")
            return jsonify({'success': False, 'error': 'Invalid email or password'}), 401
            
        password_valid = bcrypt.checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8'))
        
        if not password_valid:
            print(f"Invalid password for user: {data['email']}")
            return jsonify({'success': False, 'error': 'Invalid email or password'}), 401
        
        print(f"Login successful for: {data['email']}")
        return jsonify({
            'success': True,
            'name': user.name
        }), 200
    except Exception as e:
        print(f"Error in login endpoint: {str(e)}")
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500

# BMI endpoint
@app.route('/api/bmi', methods=['POST'])
def calculate_bmi():
    data = request.get_json()
    height = float(data['height'])  # in cm
    weight = float(data['weight'])  # in kg
    
    # Calculate BMI
    bmi = weight / ((height / 100) ** 2)
    
    # Determine BMI category
    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal Weight"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"
    
    # Store BMI in database
    new_bmi = BMI(
        user_id=get_current_user_id(),
        height=height,
        weight=weight,
        bmi=bmi,
        category=category
    )
    
    db.session.add(new_bmi)
    db.session.commit()
    
    # Export BMI record to CSV
    export_bmi_to_csv(new_bmi)
    
    # Store BMI in session for use in diet plan
    # In a real app, you'd store this in the user's account
    
    return jsonify({
        'success': True,
        'bmi': bmi,
        'category': category
    }), 200

# Diet plan endpoints
@app.route('/api/diet-plan', methods=['GET'])
def get_diet_plan():
    bmi = float(request.args.get('bmi', 0))
    
    # Try to find an existing diet plan for this user and BMI
    diet_plan = DietPlan.query.filter_by(
        user_id=get_current_user_id(),
        bmi=bmi
    ).order_by(DietPlan.created_at.desc()).first()
    
    if diet_plan:
        # Return existing plan
        plan_data = json.loads(diet_plan.plan)
        return jsonify({
            'success': True,
            'dietPlan': plan_data
        }), 200
    else:
        # Generate a new plan
        return generate_diet_plan_handler(bmi)

@app.route('/api/diet-plan', methods=['POST'])
def regenerate_diet_plan():
    data = request.get_json()
    bmi = float(data['bmi'])
    
    return generate_diet_plan_handler(bmi)

def generate_diet_plan_handler(bmi):
    # Generate diet plan based on BMI
    if bmi < 18.5:
        # Underweight plan
        plan = {
            'breakfast': [
                'Oatmeal with nuts and fruits',
                'Whole grain toast with avocado and eggs',
                'Protein smoothie with banana and peanut butter'
            ],
            'lunch': [
                'Chicken or tofu wrap with vegetables',
                'Quinoa salad with chickpeas and vegetables',
                'Pasta with meat sauce and side salad'
            ],
            'dinner': [
                'Salmon with sweet potato and vegetables',
                'Lean steak with rice and vegetables',
                'Chicken stir-fry with vegetables and rice'
            ],
            'snacks': [
                'Greek yogurt with honey',
                'Trail mix with nuts and dried fruits',
                'Protein bar',
                'Banana with peanut butter'
            ],
            'tips': [
                'Eat larger portions to gain healthy weight',
                'Focus on protein-rich foods to help build muscle',
                'Include healthy fats like avocados, nuts, and olive oil',
                'Try to eat more frequently throughout the day'
            ]
        }
    elif bmi < 25:
        # Normal weight plan
        plan = {
            'breakfast': [
                'Greek yogurt with berries and granola',
                'Whole grain toast with avocado and egg',
                'Oatmeal with fruit and nuts'
            ],
            'lunch': [
                'Grilled chicken salad with mixed greens',
                'Turkey and vegetable wrap',
                'Quinoa bowl with vegetables and lean protein'
            ],
            'dinner': [
                'Baked fish with roasted vegetables',
                'Stir-fried tofu with vegetables and brown rice',
                'Lean meat with sweet potato and broccoli'
            ],
            'snacks': [
                'Apple slices with almond butter',
                'Carrot sticks with hummus',
                'Greek yogurt',
                'Handful of mixed nuts'
            ],
            'tips': [
                'Maintain your balanced diet to stay in the healthy weight range',
                'Stay hydrated with water throughout the day',
                'Include a variety of fruits and vegetables for micronutrients',
                'Moderate portion sizes to maintain your weight'
            ]
        }
    else:
        # Overweight/obese plan
        plan = {
            'breakfast': [
                'Vegetable omelette with whole grain toast',
                'Greek yogurt with berries',
                'Overnight oats with chia seeds and fruit'
            ],
            'lunch': [
                'Large salad with grilled chicken and light dressing',
                'Vegetable soup with a side of lean protein',
                'Lettuce wraps with lean ground turkey'
            ],
            'dinner': [
                'Grilled fish with steamed vegetables',
                'Baked chicken with roasted vegetables',
                'Tofu and vegetable stir-fry with small portion of brown rice'
            ],
            'snacks': [
                'Cucumber slices with hummus',
                'Celery with small amount of nut butter',
                'Small apple',
                'Hard-boiled egg'
            ],
            'tips': [
                'Focus on portion control to reduce calorie intake',
                'Include plenty of vegetables to feel full with fewer calories',
                'Choose lean proteins to support muscle maintenance',
                'Stay hydrated as thirst can sometimes be mistaken for hunger',
                'Reduce processed foods and added sugars'
            ]
        }
    
    # Store in database
    new_plan = DietPlan(
        user_id=get_current_user_id(),
        bmi=bmi,
        plan=json.dumps(plan)
    )
    
    db.session.add(new_plan)
    db.session.commit()
    
    # Export diet plan to CSV
    export_diet_plan_to_csv(new_plan)
    
    return jsonify({
        'success': True,
        'dietPlan': plan
    }), 200

# Medical record endpoints
@app.route('/api/records', methods=['POST'])
def add_medical_record():
    data = request.get_json()
    
    # Parse date
    record_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    
    # Create new record
    new_record = MedicalRecord(
        user_id=get_current_user_id(),
        date=record_date,
        bp=data['bloodPressure'],
        sugar=float(data['bloodSugar']),
        notes=data.get('notes', '')
    )
    
    db.session.add(new_record)
    db.session.commit()
    
    # Export medical record to CSV
    export_medical_record_to_csv(new_record)
    
    return jsonify({
        'success': True,
        'message': 'Medical record added successfully'
    }), 201

@app.route('/api/records', methods=['GET'])
def get_medical_records():
    records = MedicalRecord.query.filter_by(
        user_id=get_current_user_id()
    ).order_by(MedicalRecord.date.desc()).all()
    
    return jsonify({
        'success': True,
        'records': [record.to_dict() for record in records]
    }), 200

# Admin API endpoints
@app.route('/api/admin/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify({
        'success': True,
        'users': [user.to_dict() for user in users]
    }), 200

@app.route('/api/admin/bmi', methods=['GET'])
def get_bmi_records():
    user_id = request.args.get('user_id', 'all')
    
    if user_id != 'all':
        bmi_records = BMI.query.filter_by(user_id=int(user_id)).order_by(BMI.timestamp.desc()).all()
    else:
        bmi_records = BMI.query.order_by(BMI.timestamp.desc()).all()
    
    return jsonify({
        'success': True,
        'bmi_records': [record.to_dict() for record in bmi_records]
    }), 200

@app.route('/api/admin/diet-plans', methods=['GET'])
def get_diet_plans():
    user_id = request.args.get('user_id', 'all')
    
    if user_id != 'all':
        diet_plans = DietPlan.query.filter_by(user_id=int(user_id)).order_by(DietPlan.created_at.desc()).all()
    else:
        diet_plans = DietPlan.query.order_by(DietPlan.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'diet_plans': [
            {
                'id': plan.id,
                'user_id': plan.user_id,
                'bmi': plan.bmi,
                'created_at': plan.created_at.isoformat(),
                'plan': json.loads(plan.plan)
            }
            for plan in diet_plans
        ]
    }), 200

@app.route('/api/admin/medical-records', methods=['GET'])
def get_all_medical_records():
    user_id = request.args.get('user_id', 'all')
    
    if user_id != 'all':
        records = MedicalRecord.query.filter_by(user_id=int(user_id)).order_by(MedicalRecord.date.desc()).all()
    else:
        records = MedicalRecord.query.order_by(MedicalRecord.date.desc()).all()
    
    return jsonify({
        'success': True,
        'records': [record.to_dict() for record in records]
    }), 200

# Export data endpoint for admin
@app.route('/api/admin/export-data', methods=['GET'])
def export_all_data():
    """API endpoint to trigger a full data export"""
    try:
        # Export users
        users_csv = os.path.join(export_dir, f'users_full_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv')
        with app.app_context():
            users = User.query.all()
            
            with open(users_csv, 'w', newline='') as csvfile:
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
        
        # Export BMI records
        bmi_csv = os.path.join(export_dir, f'bmi_full_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv')
        with app.app_context():
            records = BMI.query.all()
            
            with open(bmi_csv, 'w', newline='') as csvfile:
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
        
        # Export diet plans
        diet_csv = os.path.join(export_dir, f'diet_plans_full_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv')
        with app.app_context():
            plans = DietPlan.query.all()
            
            with open(diet_csv, 'w', newline='') as csvfile:
                fieldnames = ['id', 'user_id', 'bmi', 'plan', 'created_at']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for plan in plans:
                    writer.writerow({
                        'id': plan.id,
                        'user_id': plan.user_id,
                        'bmi': plan.bmi,
                        'plan': plan.plan,
                        'created_at': plan.created_at.isoformat()
                    })
        
        # Export medical records
        medical_csv = os.path.join(export_dir, f'medical_records_full_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv')
        with app.app_context():
            records = MedicalRecord.query.all()
            
            with open(medical_csv, 'w', newline='') as csvfile:
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
        
        return jsonify({
            'success': True,
            'message': 'All data exported successfully',
            'files': {
                'users': os.path.basename(users_csv),
                'bmi_records': os.path.basename(bmi_csv),
                'diet_plans': os.path.basename(diet_csv),
                'medical_records': os.path.basename(medical_csv)
            }
        }), 200
    except Exception as e:
        print(f"Error exporting data: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error exporting data: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 