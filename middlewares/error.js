class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  let errorMessage = err.message || "Internal Server Error";
  let errorStatusCode = err.statusCode || 500;

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400); // Remplacer par let ou pas de déclaration
    errorMessage = err.message;
    errorStatusCode = err.statusCode;
  }
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again!`;
    err = new ErrorHandler(message, 400); // Remplacer par let ou pas de déclaration
    errorMessage = err.message;
    errorStatusCode = err.statusCode;
  }
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is expired, Try again!`;
    err = new ErrorHandler(message, 400); // Remplacer par let ou pas de déclaration
    errorMessage = err.message;
    errorStatusCode = err.statusCode;
  }
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}`;
    err = new ErrorHandler(message, 400); // Remplacer par let ou pas de déclaration
    errorMessage = err.message;
    errorStatusCode = err.statusCode;
  }
  
  // Utiliser directement l'erreur originale si non modifiée
  errorMessage = err.errors
    ? Object.values(err.errors)
        .map((error) => error.message)
        .join(" ")
    : err.message;

  return res.status(errorStatusCode).json({
    success: false,
    message: errorMessage,
  });
};

export default ErrorHandler;