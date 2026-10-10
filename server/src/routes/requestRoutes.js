import { Router } from "express";
import {
  cancelRequest,
  createRequest,
  listMyRequests,
  listPetRequests,
  updateRequestStatus,
} from "../controllers/requestController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/mine", listMyRequests);
router.get("/pet/:petId", listPetRequests);
router.post("/", createRequest);
router.patch("/:id", updateRequestStatus);
router.delete("/:id", cancelRequest);

export default router;
