const jwt = require('jsonwebtoken');
const User = require('../models/userModel')

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const data = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findOne({
            _id: data._id,
            "tokens.token": token
        })
        if (!user)
            throw new Error('user not authrized');

        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
}

module.exports = auth