const jsonwebtoken = require("jsonwebtoken")

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const jwt = req.headers.authorization.split( " ")[1]
        if (!jwt) { res.status(401).json({ message: "не авторизован" }) }
        req.user = jsonwebtoken.verify(jwt, process.env.secretKey)
        next()
    } catch (e) {
        res.status(401).json({message: "не авторизован"})
    }
}