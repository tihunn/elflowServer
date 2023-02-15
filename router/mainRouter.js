const Router = require("express")
const router = new Router()
const authRouter = require("./authRouter")
const flowerRouter = require("./flowerRouter")
const orderRouter = require("./orderRouter")
const catalogRouter = require("./catalogRouter")
const imgRouter = require("./imgRouter")

router.use("/auth", authRouter)
router.use("/order", orderRouter)
router.use("/catalog", catalogRouter)
router.use("/flower", imgRouter)
router.use("/flower", flowerRouter)


module.exports = router