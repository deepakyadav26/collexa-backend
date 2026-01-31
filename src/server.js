const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const companyRoutes = require('./routes/companyRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const blogRoutes = require('./routes/blogRoutes');
const campusCourseRoutes = require('./routes/campusCourseRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ message: 'Collexa Backend API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/userprofile', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/internship', internshipRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/admin', adminUserRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/campuscourses', campusCourseRoutes);
app.use('/api/applications', applicationRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collexa';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

