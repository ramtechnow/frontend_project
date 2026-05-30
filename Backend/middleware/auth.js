const jwt = require('jsonwebtoken');

// Middleware to fetch user from token
exports.fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  } else {
    try {
      const data = jwt.verify(token, process.env.JWT_SECRET || 'secret_ecom');
      req.user = data.user;
      next();
    } catch (error) {
      res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
  }
};

// Middleware to fetch user and verify admin status
exports.fetchAdmin = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  } else {
    try {
      const data = jwt.verify(token, process.env.JWT_SECRET || 'secret_ecom');
      if (data.user && data.user.isAdmin) {
        req.user = data.user;
        next();
      } else {
        res.status(403).send({ errors: "Access denied. Admin privileges required." });
      }
    } catch (error) {
      res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
  }
};
