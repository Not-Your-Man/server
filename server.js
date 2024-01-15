const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Load environment variables from a .env file (optional)
// require('dotenv').config();

// Retrieve MongoDB password from environment variables
const mongoPassword = process.env.MONGO_PASSWORD;

// Specify the name of the MongoDB database
const dbName = "your_database_name"; // Replace with your actual database name

// Construct the MongoDB connection string
const mongoURI = `mongodb+srv://williamsmicheal237:${mongoPassword}@cluster0.wmuc96c.mongodb.net/${dbName}?retryWrites=true&w=majority`;

mongoose.connect(mongoURI, {
  useNewUrlParser: true, // Note: useNewUrlParser is no longer deprecated, so it's safe to include
  useUnifiedTopology: true,
  connectTimeoutMS: 30000,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
