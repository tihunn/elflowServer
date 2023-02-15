const Router = require("express")
const flowerController = require("../controller/flowerController");
const router = new Router()
const roleMiddleware = require("../middleware/checkRoleMiddleware")

router.get("/", flowerController.get)
router.get("/:id", flowerController.get)
router.post("/", roleMiddleware("admin"), flowerController.create)
router.delete("/:id", roleMiddleware("admin"), flowerController.delete)
router.put("/", roleMiddleware("admin"), flowerController.update)



module.exports = router