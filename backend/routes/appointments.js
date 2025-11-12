const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); 
const volunteerAuthMiddleware = require('../middleware/volunteerAuth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
// const emailService = require('../services/emailService'); // Commented out as you didn't create the file

// --- (User) CREATE A NEW APPOINTMENT ---
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { purpose, name, volunteer, date, contact, timeFrom, timeTo, location } = req.body;

    const user = await User.findById(req.user.id);
    const volunteerUser = await Volunteer.findOne({ name: volunteer });

    if (!user) return res.status(404).json({ msg: 'User not found.' });
    if (!volunteerUser) return res.status(404).json({ msg: 'Volunteer not found. Please check the name.' });
    
    const newAppointment = new Appointment({
      purpose, name, volunteer, date, contact, timeFrom, timeTo, location,
      user: req.user.id 
    });
    
    const appointment = await newAppointment.save();

    // --- (Optional) Send Email Confirmation ---
    // await emailService.sendAppointmentConfirmation(user.email, volunteerUser.email, volunteerUser.name, appointment);
    
    // --- SEND WEBSOCKET NOTIFICATION ---
    const io = req.app.get('io'); 
    const volunteerName = volunteerUser.name;
    
    io.to(volunteerName).emit('new_appointment_notification', {
        clientName: appointment.name,
        purpose: appointment.purpose,
        date: appointment.date,
        time: appointment.timeFrom
    });

    res.json(appointment);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- (User) GET ALL APPOINTMENTS FOR A USER ---
router.get('/', authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id }).sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- (Volunteer) GET ALL APPOINTMENTS FOR A VOLUNTEER ---
router.get('/volunteer', volunteerAuthMiddleware, async (req, res) => {
    try {
        const volunteerName = req.volunteer.name; 
        const appointments = await Appointment.find({ volunteer: volunteerName }).sort({ date: 1 });
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;