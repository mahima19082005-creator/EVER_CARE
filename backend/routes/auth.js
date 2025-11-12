const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const volunteerAuthMiddleware = require('../middleware/volunteerAuth'); // <-- Make sure this is required

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret_key'; 

// --- USER ROUTES ---
router.post('/register', async (req, res) => {
  try {
    const { name, age, email, contact, emergency_contact, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, age, email, contact, emergency_contact, password: hashedPassword });
    await user.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) { console.error(err.message); res.status(500).send('Server error'); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    
    jwt.sign({ user: { id: user.id, name: user.name } }, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token: token, userName: user.name });
    });
  } catch (err) { console.error(err.message); res.status(500).send('Server error'); }
});

// --- VOLUNTEER ROUTES ---
router.post('/volunteer/register', async (req, res) => {
    try {
        const { name, email, contact, password } = req.body;
        let volunteer = await Volunteer.findOne({ email });
        if (volunteer) {
            return res.status(400).json({ msg: 'Volunteer already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        volunteer = new Volunteer({ name, email, contact, password: hashedPassword });
        await volunteer.save();
        res.status(201).json({ msg: 'Volunteer registered successfully' });
    } catch (err) { console.error("Volunteer Registration Error:", err.message); res.status(500).send('Server error'); }
});

router.post('/volunteer/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const volunteer = await Volunteer.findOne({ email });
        if (!volunteer) return res.status(400).json({ msg: 'Invalid volunteer credentials' });
        const isMatch = await bcrypt.compare(password, volunteer.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid volunteer credentials' });

        const payload = { volunteer: { id: volunteer.id, name: volunteer.name } };
        jwt.sign( payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token: token, volunteerName: volunteer.name });
        });
    } catch (err) { console.error(err.message); res.status(500).send('Server error'); }
});

// --- NEW: GET VOLUNTEER PROFILE DETAILS ---
router.get('/volunteer/profile', volunteerAuthMiddleware, async (req, res) => {
  try {
    // We get the volunteer's ID from the token (via the middleware)
    const volunteer = await Volunteer.findById(req.volunteer.id).select('-password');
    if (!volunteer) {
      return res.status(404).json({ msg: 'Volunteer not found' });
    }
    // Send back the volunteer's details
    res.json(volunteer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;