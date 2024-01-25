const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');


const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3001;

app.use(cors());

// Load environment variables from a .env file (optional)
//require('dotenv').config();//
// Construct the MongoDB connection string for localhost
const mongoURI = 'mongodb+srv://williamsmicheal237:%40Wrongman%21@cluster0.wmuc96c.mongodb.net/signup_db?retryWrites=true&w=majority';


mongoose.connect(mongoURI, {
  connectTimeoutMS: 30000,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());


app.post('/api/signup', async (req, res) => {
    try {
      const { name, email, phone, password } = req.body;
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already registered' });
      }
  
      // Configure NodeMailer
      const transporter = nodemailer.createTransport({
        host: 'firstradeaucity.online',
        port: 465,
        secure: true, // Use SSL/TLS
        auth: {
          user: 'support@firstradeaucity.online',
          pass: 'Z,EaT_}uLb7r',
        },
      });
  
      // Include the login link directly in the email
      const loginLink = 'https://www.firstaucity.com/auth';
  
      // Send a welcome email
      const mailOptions = {
        from: support@firstradeaucity.online,
          //process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Your App',
        text: `Hello ${name}, Thank you for signing up! Click the following link to log in: ${loginLink}`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
  
      // Save user to the database
      const user = new User({ name, email, phone, password });
      await user.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});
// User change password route
app.patch('/api/change-password/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { oldPassword, newPassword } = req.body;

    // Find the user by ID and check if the old password matches
    const user = await User.findOne({ _id: userId, password: oldPassword });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// User sign out route
app.post('/api/sign-out', (req, res) => {
  // In a real-world scenario, you might handle session or token expiration
  res.status(200).json({ message: 'Sign out successful' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


