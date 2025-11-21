const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign({
    id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
  }, process.env.JWT_SECRET, { expiresIn: '2h' });
}

// Attach JWT in HttpOnly cookie
function sendToken(res, user) {
  const token = generateToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,          // REQUIRED on Vercel + Render
    sameSite: "none",      // REQUIRED for cross-domain cookies
    maxAge: 2 * 60 * 60 * 1000,
    path: "/"
  });

  return token;
}

module.exports = { generateToken, sendToken };
