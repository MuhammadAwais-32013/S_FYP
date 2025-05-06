# AI Diet Consultant

A simple web application that provides personalized diet plans based on BMI calculations and allows users to track their medical records.

## Features

- User authentication (signup/login)
- BMI calculation
- Personalized diet plan recommendations
- Medical record tracking
- AI Diet Assistant chatbot

## Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- Axios for API calls

### Backend
- Flask
- SQLAlchemy (ORM)
- MySQL database
- bcrypt for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- MySQL

### Database Setup
1. Create a MySQL database named `diet_consultant`
2. Update the database credentials in `backend/.env` if needed

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the Flask application:
   ```
   python app.py
   ```
   The backend will run on http://localhost:5000

### Frontend Setup
1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```
   The frontend will run on http://localhost:3000

## Usage

1. Sign up for a new account
2. Log in with your credentials
3. Calculate your BMI
4. View your personalized diet plan
5. Add and track your medical records
6. Chat with the Diet Assistant for additional help

## Project Structure

### Frontend
- `/pages` - Next.js pages and routing
- `/components` - Reusable React components
- `/context` - React context for auth state
- `/utils` - Utility functions and API calls
- `/styles` - Global CSS and Tailwind configuration

### Backend
- `app.py` - Main Flask application
- `models.py` - SQLAlchemy database models
- `.env` - Environment variables
- `requirements.txt` - Python dependencies

## Note

This is a beginner-friendly project meant for educational purposes. In a production environment, you would want to implement:

- JWT-based authentication
- Password reset functionality
- Form validation on the server side
- More comprehensive error handling
- Data visualization for medical records
- Unit and integration tests 