# NutriAI Diet Consultant

A modern web application that provides personalized diet plans based on BMI calculations and health metrics, with session persistence and comprehensive user tracking.

## Features

- **User Authentication**
  - Secure signup and login
  - Session persistence across page refreshes and browser tabs
  - User profile management

- **Health Assessment**
  - BMI calculation with detailed health insights
  - Health category classification with personalized recommendations
  - Visualized BMI results with color-coded categories

- **Personalized Diet Plans**
  - AI-generated meal plans based on BMI and health profile
  - Detailed meal breakdowns (breakfast, lunch, dinner, snacks)
  - Nutritional recommendations and dietary tips
  - Diet plan regeneration option

- **Health Tracking**
  - Medical record tracking with historical data
  - Blood pressure and blood sugar monitoring
  - Statistics and trends visualization
  - Filterable health record history

- **Admin Features**
  - Comprehensive admin dashboard
  - User management interface
  - Database records viewing in tabular format
  - Detailed diet plan inspection with modal views

- **AI Diet Assistant**
  - Interactive chatbot for nutritional advice
  - Personalized responses based on user health data
  - Diet and nutrition FAQ support

- **Navigation**
  - Consistent back-to-dashboard navigation across all pages
  - Intuitive user interface with clear pathways
  - Mobile-responsive design for all devices

## Tech Stack

### Frontend
- Next.js (React framework)
- React Hooks and Context API for state management
- Tailwind CSS for styling
- Axios for API calls
- LocalStorage for session persistence
- Responsive design with mobile-first approach

### Backend
- Flask (Python web framework)
- SQLAlchemy ORM for database operations
- MySQL database for data storage
- bcrypt for password security
- RESTful API architecture
- AI integration for diet recommendations

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

## Usage Guide

### For Users
1. **Sign up/Log in**: Create a new account or log in with existing credentials
2. **Calculate BMI**: Enter height and weight to get your BMI calculation
3. **View Diet Plan**: Receive a personalized diet plan based on your BMI
4. **Track Health**: Add and monitor health metrics like blood pressure and blood sugar
5. **Consult AI Assistant**: Get dietary advice from the AI chatbot

### For Administrators
1. **Access Admin Panel**: Log in with admin credentials
2. **Manage Users**: View and manage user accounts
3. **View Health Data**: Access user BMI records and medical history
4. **Inspect Diet Plans**: View detailed diet plans for all users
5. **Database Viewing**: Access all database records in tabular format

## Project Structure

### Frontend
- `/pages` - Next.js pages and routing
  - `/admin` - Administrator dashboard and management tools
  - `/records` - Health record management
- `/components` - Reusable React components
  - `BackToDashboard.js` - Navigation component for consistent UI
  - `Header.js` - Main navigation header
  - `DietChart.js` - Diet visualization component
- `/context` - React context for state management (auth, themes)
- `/utils` - Utility functions and API integration
- `/styles` - Global CSS and Tailwind configuration

### Backend
- `app.py` - Main Flask application entry point
- `models.py` - SQLAlchemy database models and schemas
- `routes/` - API route handlers
- `.env` - Environment variables and configuration
- `requirements.txt` - Python dependencies

## Session Management

The application implements robust session management through:
- Secure token storage in localStorage
- Context API for global auth state
- Automatic session restoration on page refresh
- Protected routes with authentication checks
- Intuitive login/logout flow

## Data Visualization

Health data is visualized through:
- Color-coded BMI categories
- Statistical averages for health metrics
- Historical trend displays
- Meal plan visualization with nutritional breakdown

## Security Features

- Password hashing with bcrypt
- Protected API endpoints
- Authentication middleware
- Input validation
- Secure session management

## Future Enhancements

- Enhanced data visualization with charts and graphs
- Integration with wearable health devices
- Expanded AI capabilities for more personalized advice
- Meal planning calendar and reminders
- Social sharing features for progress

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- Your Name - Initial work and ongoing development

## Acknowledgments

- Tailwind CSS for the UI framework
- Next.js team for the React framework
- Flask for the backend architecture
- AI research community for diet recommendation algorithms 