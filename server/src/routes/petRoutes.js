import { Router } from "express";
import {
  createPet,
  deletePet,
  getPet,
  listMyPets,
  listPets,
  updatePet,
} from "../controllers/petController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", listPets);
router.get("/mine", requireAuth, listMyPets);
router.get("/:id", requireAuth, getPet);
router.post("/", requireAuth, createPet);
router.patch("/:id", requireAuth, updatePet);
router.delete("/:id", requireAuth, deletePet);

export default router;
