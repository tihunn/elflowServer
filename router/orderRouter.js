const Router = require("express")
const router = new Router()
const orderRouter = require("../controller/orderController")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/checkRoleMiddleware");


router.post("/:id", authMiddleware, orderRouter.add)
router.get("/", authMiddleware, orderRouter.get)
router.delete("/:id", authMiddleware, orderRouter.del)
router.delete("/", authMiddleware, orderRouter.delAll)
router.post("/", authMiddleware, orderRouter.assemble)
router.get("/history", authMiddleware, orderRouter.history)
router.get("/all", authMiddleware, roleMiddleware("admin"), orderRouter.getAll)

module.exports = router