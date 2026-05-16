const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const tokenPart = token.split(' ')[1];
    if (!tokenPart) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const decoded = jwt.verify(tokenPart, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};
