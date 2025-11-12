const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  // This links the appointment to a specific user
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  purpose: { type: String, required: true },
  name: { type: String, required: true }, // Name of the patient
  volunteer: { type: String, required: true },
  date: { type: String, required: true },
  contact: { type: String, required: true },
  timeFrom: { type: String, required: true },
  timeTo: { type: String, required: true },
  location: { type: String, required: true }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);