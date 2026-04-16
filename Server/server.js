const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// IMPORTANT: folder name must match your actual folder name: Client
app.use(express.static(path.join(__dirname, '..', 'Client')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Client', 'index.html'));
});

// ================= DB CONNECTION =================
const MONGO_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://marayasam9_db_user:pdDHJqw2Tm63AyOZ@cluster0.mmxluol.mongodb.net/propertyDB?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

// ================= MODELS =================
const User = mongoose.model('User', {
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' }
});

const Objection = mongoose.model('Objection', {
  userId: String,
  propertyId: String,
  reason: String,
  status: { type: String, default: 'Pending' }
});

const Appeal = mongoose.model('Appeal', {
  objectionId: String,
  reason: String
});

const Notification = mongoose.model('Notification', {
  userId: String,
  message: String
});

// ================= ROUTES =================

// REGISTER
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = new User({
      name,
      email,
      password,
      role: role || 'user'
    });

    await user.save();
    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send('Registration error');
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(400).send('Invalid credentials');
    }

    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send('Login error');
  }
});

// SUBMIT OBJECTION
app.post('/objections', async (req, res) => {
  try {
    const obj = new Objection(req.body);
    await obj.save();

    await Notification.create({
      userId: req.body.userId,
      message: '📩 Objection submitted'
    });

    res.send(obj);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error submitting objection');
  }
});

// GET USER OBJECTIONS
app.get('/objections/:userId', async (req, res) => {
  try {
    const data = await Objection.find({ userId: req.params.userId });
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching objections');
  }
});

// GET ALL OBJECTIONS
app.get('/all-objections', async (req, res) => {
  try {
    const data = await Objection.find();
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching all objections');
  }
});

// APPEALS
app.post('/appeals', async (req, res) => {
  try {
    const appeal = new Appeal(req.body);
    await appeal.save();
    res.send(appeal);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error submitting appeal');
  }
});

// NOTIFICATIONS
app.get('/notifications/:userId', async (req, res) => {
  try {
    const data = await Notification.find({ userId: req.params.userId });
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching notifications');
  }
});

// FILE UPLOAD
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  res.send({ message: '✅ File uploaded successfully' });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});