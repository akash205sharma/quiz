# Quiz Management Platform

A full-stack web application for managing and taking quizzes. This platform allows faculty members to create, manage, and publish quizzes, while students can take quizzes and view their results. It includes an email alert system to notify students when a new quiz is published.

## Features

### 🎓 Faculty
- **Authentication**: Secure login and registration.
- **Quiz Management**: Create, update, delete, and list quizzes.
- **Targeted Quizzes**: Create quizzes specifically for students of a certain Year (1-4) and Branch (CSE, MNC, MAE, ECE).
- **Question Management**: Add, edit, and remove questions from quizzes.
- **Publishing**: Publish/Unpublish quizzes.
- **Email Alerts**: Automatically sends email notifications to **targeted** students when a quiz is published.
- **Analytics**: View submission statistics, average scores, and question-wise performance.

### 🧑‍🎓 Student
- **Authentication**: Secure login and registration with Year and Branch details.
- **Dashboard**: View available published quizzes that match your Year and Branch.
- **Take Quiz**: Interactive quiz interface.
- **Results**: Instant scoring and detailed result view (correct/incorrect answers).

## 🛠️ Tech Stack

### Frontend
- **React**: UI Library
- **React Router**: Navigation
- **Axios**: HTTP Client
- **CSS**: Custom styling

### Backend
- **Node.js & Express**: Server framework
- **MongoDB & Mongoose**: Database and ODM
- **JWT (JSON Web Tokens)**: Authentication
- **Bcryptjs**: Password hashing
- **Nodemailer**: Email services

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (Local or Atlas connection string)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd quiz
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```
*Note: For Gmail, use an **App Password** for `SMTP_PASS`.*

Start the backend server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the frontend application:
```bash
npm start
# App runs on http://localhost:3000
```

## 🏃‍♂️ Usage

1.  **Register**: Create a new account.
    - **Faculty**: Select 'Faculty' role.
    - **Student**: Select 'Student' role and provide your **Year** and **Branch**.
2.  **Faculty Flow**:
    - Log in as Faculty.
    - Click "Create Quiz" to start a new quiz.
    - **Targeting**: Select the Target Year and Target Branches for the quiz.
    - Add questions and save.
    - Click "Publish" to make it live and send email alerts to **only the targeted students**.
3.  **Student Flow**:
    - Log in as Student.
    - See the list of published quizzes that match your Year and Branch.
    - Click "Take Quiz".
    - Submit to see your score.

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/quizzes` | List quizzes |
| POST | `/api/quizzes` | Create quiz (Faculty) |
| PUT | `/api/quizzes/:id/publish` | Toggle publish status |
| POST | `/api/quizzes/:id/submit` | Submit quiz answers |
| GET | `/api/quizzes/:id/analytics` | Get quiz stats (Faculty) |

## 🧪 Testing Email Alerts
To test the email feature:
1.  Ensure `SMTP` credentials are set in `backend/.env`.
2.  Login as Faculty.
3.  Create a quiz targeting a specific Year/Branch.
4.  Publish the quiz.
5.  Check the inbox of a student matching that Year/Branch. Other students will not receive the email.
