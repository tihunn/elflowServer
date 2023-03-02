const Router = require("express")
const router = new Router()
const authController = require("../controller/authController")
const authMiddleware = require("../middleware/authMiddleware")


router.post("/reg", authController.registration)
router.post("/login", authController.login)
router.get("/check", authMiddleware, authController.check)
router.get("/create_admin", authController.create_admin)


module.exports = router