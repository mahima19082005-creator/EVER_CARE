const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from the request header
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ msg: 'Malformed token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret_key');

    // --- THIS IS THE KEY CHANGE ---
    // Check for a 'volunteer' payload, NOT a 'user' payload
    if (!decoded.volunteer) {
        return res.status(401).json({ msg: 'Invalid token for this (volunteer) route.' });
    }
    
    // Add the volunteer payload to the request
    req.volunteer = decoded.volunteer; 
    
    next(); // Move to the next step

  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};