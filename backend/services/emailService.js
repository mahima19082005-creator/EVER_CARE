const sgMail = require('@sendgrid/mail');

// --- IMPORTANT ---
// 1. PASTE YOUR SENDGRID API KEY HERE
// 2. VERIFY YOUR EMAIL ADDRESS IN SENDGRID
sgMail.setApiKey('YOUR_SENDGRID_API_KEY_GOES_HERE');
const SENDER_EMAIL = "your-verified-email@gmail.com";


/**
 * Sends a booking confirmation to both the user and the volunteer.
 */
async function sendAppointmentConfirmation(userEmail, volunteerEmail, volunteerName, appointment) {
    
    // Email for the User
    const userMessage = {
        to: userEmail,
        from: SENDER_EMAIL,
        subject: `Your EverCare Appointment with ${volunteerName} is Confirmed!`,
        html: `
            <h1>Appointment Confirmed!</h1>
            <p>Hi ${appointment.name},</p>
            <p>Your appointment for <strong>${appointment.purpose}</strong> with ${volunteerName} is confirmed.</p>
            <ul>
                <li><strong>Date:</strong> ${appointment.date}</li>
                <li><strong>Time:</strong> ${appointment.timeFrom} to ${appointment.timeTo}</li>
                <li><strong>Location:</strong> ${appointment.location}</li>
            </ul>
            <p>Thank you for using EverCare!</p>
        `,
    };

    // Email for the Volunteer
    const volunteerMessage = {
        to: volunteerEmail,
        from: SENDER_EMAIL,
        subject: `New EverCare Appointment Request: ${appointment.name}`,
        html: `
            <h1>New Appointment!</h1>
            <p>Hi ${volunteerName},</p>
            <p>You have a new appointment with <strong>${appointment.name}</strong>.</p>
            <ul>
                <li><strong>Purpose:</strong> ${appointment.purpose}</li>
                <li><strong>Date:</strong> ${appointment.date}</li>
                <li><strong>Time:</strong> ${appointment.timeFrom} to ${appointment.timeTo}</li>
                <li><strong>Location:</strong> ${appointment.location}</li>
                <li><strong>Client Contact:</strong> ${appointment.contact}</li>
            </ul>
            <p>Please be sure to arrive on time.</p>
        `,
    };

    // Send both emails
    try {
        await sgMail.send(userMessage);
        await sgMail.send(volunteerMessage);
        console.log("Confirmation emails sent successfully.");
    } catch (error) {
        console.error("Error sending confirmation emails:", error);
        if (error.response) {
            console.error(error.response.body)
        }
    }
}

// Make this function available to other files
module.exports = {
    sendAppointmentConfirmation
};