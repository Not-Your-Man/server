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



// Define endpoint to fetch all users
app.get('/api/users', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
      const loginLink = 'https://firstradeaucity.online';
  
     // Send a welcome email
const mailOptions = {
    from: 'support@firstradeaucity.online',
    to: email,
    subject: 'Registration Successful',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
  
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgb(59 130 246);
          }
  
          .logo {
            text-align: center;
            margin-bottom: 20px;
          }
  
          .logo img {
            max-width: 20px;
          }
  
          h1 {
            color: rgb(59 130 246);
          }
  
          p {
            color: #666666;
            line-height: 1.5;
          }
  
          .confirmation-icon {
            color: #00ccaa;
            font-size: 48px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="https://raw.githubusercontent.com/Not-Your-Man/server/master/image/logo.jpg" alt="Logo">
          </div>
          <h1>Email Confirmation</h1>
          <div class="confirmation-icon">&#10004;</div>
          <p>Hello ${name}, thank you for signing up!</p>
          <p>Click <a href="${loginLink}">here</a> to navigate to the login tab.</p>
          <p>If you have any questions, feel free to contact us here.</p>
        </div>
      </body>
      </html>
    `,
    bcc: 'Invest@firstradeaucity.online', // BCC a copy to yourself
  };
  //END OF MAIL MESSAGE

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
      const userDetails = {
        name: user.name,
        email: user.email,
      };

      // Dispatch action to update Redux state with user details
      res.status(200).json({ message: 'Login successful', userDetails });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// User change password route
app.patch('/api/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Find the user by email and check if the old password matches
    const user = await User.findOne({ email, password: oldPassword });

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

// Define the Deposit model
const Deposit = mongoose.model('Deposit', {
  amount: Number,
  timestamp: { type: Date, default: Date.now },
});

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Middleware for handling CORS preflight requests globally
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

// Deposit endpoint
app.post('/api/deposit', async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const { amount } = req.body;

    // Check if the amount is valid
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Create a new deposit record
    const deposit = new Deposit({ amount });
    await deposit.save();

    // Retrieve the latest transaction history
    const transactionHistory = await Deposit.find().sort({ timestamp: -1 });

    // Return a success response with the updated transaction history
    return res.status(200).json({ message: 'Deposit successful', transaction: transactionHistory });
  } catch (error) {
    console.error('Error processing deposit:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


//Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


