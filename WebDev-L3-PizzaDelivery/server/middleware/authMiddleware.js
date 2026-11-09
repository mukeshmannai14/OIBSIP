
const adminAuth = require("../config/firebaseAdmin");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const idToken = authHeader.split(" ")[1];

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken.email_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

module.exports = { protect };
