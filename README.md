# MERN Stack Developer Machine Test

## Objective
Implement a basic full-stack application using the MERN (MongoDB, Express.js, React.js, Node.js) stack with the following core features:

- Admin User Login with JWT Authentication
- Agent Creation & Management
- Uploading CSV Lists and Distributing Tasks Among Agents

---

## Features and Functionality

### 1. User Login
- Login form with email and password fields.
- Authenticate users by matching credentials with MongoDB registered data.
- Use JSON Web Tokens (JWT) for secure authentication.
- On successful login, redirect users to the dashboard.
- Show error messages on failed login attempts.

### 2. Add Agents
- Ability to create new agents.
- Each agent includes the following details:
  - Name
  - Email
  - Mobile Number including country code
  - Password

### 3. Upload CSV and Distribute Lists
- Upload CSV files containing the following columns:
  - FirstName (Text)
  - Phone (Number)
  - Notes (Text)
- Validate file upload to accept only `.csv`, `.xlsx`, and `.axls` file types.
- Validate CSV format to ensure correct structure.
- Distribute the uploaded list items equally among 5 agents.
  - E.g., 25 items result in 5 items assigned to each agent.
  - If the list size isn't divisible by 5, distribute remaining items sequentially.
- Save distributed lists in MongoDB.
- Display the distributed lists for each agent on the frontend.

---

## Technology Stack

- **Frontend:** React.js (or Next.js)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)

---

## Technical Requirements

- Proper validation and error handling throughout the application.
- Maintain clean, readable, and well-commented code.
- Provide a `.env` file for environment-specific configurations including:
  - MongoDB connection string
  - JWT secret key

---

## Setup and Running Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running locally or on a remote server

### Steps

1. **Clone the repository**
git clone <repository-url>
cd <repository-folder>

2. **Install dependencies**
npm install

3. **Set up environment variables**
Create a `.env` file in the root directory and add the following:
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret-key>

4. **Start the server**
npm start

5. **Access the application**
Open a browser and navigate to http://localhost:3000

---

---

Feel free to explore the code, test the login, add agents, and upload your CSV lists for distribution.

If you encounter issues or have questions, please refer to the documentation or contact the developer.

------