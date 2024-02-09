const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const authenticateToken = (req, res, next) => {
    cookieParser()(req, res, () => {});
    const token = req.cookies.token;

    if(!token){
        res.status(401).send('Unauthorized: missing token');
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if(err){
            res.status(403).send('Unauthorized: invalid token');
            return;
        }

        req.user = user;
        next();
    });
};

module.exports = {authenticateToken};