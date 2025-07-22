// Dans backend/utils/jwtToken.js
import jwt from "jsonwebtoken";

export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();
  
  let cookieName;
  if (user.role === 'Admin' || user.role === 'Receptionist') {
    cookieName = 'adminToken';
  } else {
    cookieName = 'patientToken';
  }

  res
    .status(statusCode)
    .cookie(cookieName, token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'Lax', 
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};