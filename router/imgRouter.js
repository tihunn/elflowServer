const Router = require("express")
const router = new Router()
const roleMiddleware = require("../middleware/checkRoleMiddleware");
const imgController = require("../controller/imgController");


router.post("/img", roleMiddleware("admin"), imgController.addImg)
router.delete("/img", roleMiddleware("admin"), imgController.delImg)


module.exports = router