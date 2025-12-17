import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    // Check for token in Authorization header first, then in query parameter
    let token = req.headers.authorization?.split(' ')[1] || req.query.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default auth;
