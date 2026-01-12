# Collexa Backend - Job & Internship Portal API

A MERN stack backend API for a job and internship portal similar to Internshala.

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Postman (for testing APIs)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create .env File

Create a `.env` file in the root directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/collexa

# For MongoDB Atlas (replace with your connection string):
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/collexa?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**
- Make sure MongoDB is running on your system
- Default connection: `mongodb://localhost:27017/collexa`

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and get your connection string
- Replace `MONGO_URI` in `.env` with your Atlas connection string

### Step 4: Run the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
MongoDB connected
Server running on port 5000
```

## 📡 API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "emailId": "john@example.com",
  "phoneNumber": "+1234567890",
  "password": "password123",
  "role": "student"
}
```

#### Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "emailId": "john@example.com",
  "password": "password123"
}
```
- **Response:** Sets HTTP-only cookie with JWT token

#### Forget Password
- **POST** `/api/auth/forgetPassword`
- **Body:**
```json
{
  "emailId": "john@example.com"
}
```

### User Profile (Requires Authentication)

- **GET** `/api/userprofile` - Get user profile
- **POST** `/api/userprofile` - Create/update profile
- **PATCH** `/api/userprofile` - Update profile
- **DELETE** `/api/userprofile` - Delete account

### Jobs (Requires Authentication)

- **POST** `/api/jobs/addjob` - Create job (Employer only)
- **GET** `/api/jobs/listingjob` - List all jobs
- **GET** `/api/jobs/jobdetails/:id` - Get job details
- **PATCH** `/api/jobs/updatejob/:id` - Update job (Employer only)
- **DELETE** `/api/jobs/deletejob/:id` - Delete job (Employer only)

### Internships (Requires Authentication)

- **POST** `/api/internship/addjob` - Create internship (Employer only)
- **GET** `/api/internship/listingjob` - List all internships
- **GET** `/api/internship/internship/:id` - Get internship details
- **PATCH** `/api/internship/updatejob/:id` - Update internship (Employer only)
- **DELETE** `/api/internship/deletejob/:id` - Delete internship (Employer only)

## 🧪 Testing with Postman

### 1. Register a User

1. Open Postman
2. Create a new **POST** request
3. URL: `http://localhost:5000/api/auth/register`
4. Go to **Body** → **raw** → Select **JSON**
5. Paste this:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "emailId": "john@example.com",
  "phoneNumber": "+1234567890",
  "password": "password123",
  "role": "student"
}
```
6. Click **Send**
7. You should get: `{"message": "User registered successfully", "userId": "..."}`

### 2. Check MongoDB

- Open MongoDB Compass or use `mongosh`
- Connect to your database
- Check the `users` collection - you should see the registered user!

### 3. Login

1. Create a new **POST** request
2. URL: `http://localhost:5000/api/auth/login`
3. Body (JSON):
```json
{
  "emailId": "john@example.com",
  "password": "password123"
}
```
4. Click **Send**
5. Check **Cookies** tab in Postman - you should see a `token` cookie
6. The response will include the token and user data

### 4. Test Protected Routes

For routes that require authentication:
1. After login, copy the `token` from the response
2. In your request, go to **Headers**
3. Add: `Authorization: Bearer <your_token>`
   OR
4. Postman will automatically use cookies if you're in the same session

## 📁 Project Structure

```
collexa-backend/
├── src/
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   └── Internship.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   └── internshipRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## 🔒 Security Notes

- Never commit `.env` file to git
- Change `JWT_SECRET` to a strong random string in production
- Use strong passwords in production
- Enable HTTPS in production

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running
- Check your `MONGO_URI` in `.env`
- For Atlas, ensure your IP is whitelisted

**Port Already in Use:**
- Change `PORT` in `.env` to a different port (e.g., 5001)

**JWT Token Error:**
- Make sure `JWT_SECRET` is set in `.env`
