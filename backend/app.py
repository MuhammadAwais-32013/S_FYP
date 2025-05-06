import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, User, BMI, DietPlan, MedicalRecord
import bcrypt
import json
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DB_URI', 'sqlite:///diet_consultant.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

# Helper function to get current user ID (in a real app, this would use JWT)
def get_current_user_id():
    # For simplicity, we'll just use a fixed user ID for testing
    # In a real app, you would get this from the JWT token
    return 1

# Authentication endpoints
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
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
    
    return jsonify({'success': True, 'message': 'User registered successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({'success': False, 'error': 'Invalid email or password'}), 401
    
    return jsonify({
        'success': True,
        'name': user.name
    }), 200

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 