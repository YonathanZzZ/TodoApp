const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return null;
        }

        return user;
    });
}

const authenticateToken = (req, res, next) => {
    cookieParser()(req, res, () => {
    });
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json('Unauthorized: missing token');
    } else {
        const user = verifyToken(token);
        if (!user) {
            res.status(403).json('Forbidden: invalid token');
        } else {
            req.body.email = user.email;
            next();
        }
    }
};

module.exports = {authenticateToken, verifyToken};