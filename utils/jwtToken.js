export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();
  // Determine the cookie name based on the user's role
  const cookieName = user.role === 'Admin' ? 'adminToken' : 'patientToken';

  res
    .status(statusCode)
    .cookie(cookieName, token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};

// ... (votre code existant) ...

export const cookieOptions = { // <<< AJOUTEZ CET OBJET D'OPTIONS
  expires: new Date(
    Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};

  res
    .status(statusCode)
    .cookie(cookieName, token, cookieOptions) // Utilisez l'objet cookieOptions ici
    .json({
      success: true,
      message,
      user,
      token,
    });
