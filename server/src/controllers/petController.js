import AdoptionRequest from "../models/AdoptionRequest.js";
import Pet from "../models/Pet.js";

const species = ["Dog", "Cat", "Bird", "Rabbit", "Other"];
const genders = ["Male", "Female", "Unknown"];
const vaccinationStatuses = ["Up to date", "Partially vaccinated", "Not vaccinated", "Unknown"];
const sortableFields = ["createdAt", "name", "adoptionFee", "age"];
const imagePattern = /^https?:\/\/\S+$/i;

function validatePet(body = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Enter the pet's listing details.";
  }
  const fields = [
    ["name", typeof body.name === "string" && body.name.trim().length > 0 && body.name.trim().length <= 80, "Enter a pet name."],
    ["species", species.includes(body.species), "Choose a valid species."],
    ["breed", typeof body.breed === "string" && body.breed.trim().length > 0, "Enter a breed."],
    ["age", typeof body.age === "string" && body.age.trim().length > 0, "Enter the pet's age."],
    ["gender", genders.includes(body.gender), "Choose a valid gender."],
    ["imageUrl", typeof body.imageUrl === "string" && imagePattern.test(body.imageUrl), "Enter a valid image URL."],
    ["healthStatus", typeof body.healthStatus === "string" && body.healthStatus.trim().length > 0, "Enter health information."],
    ["vaccinationStatus", vaccinationStatuses.includes(body.vaccinationStatus), "Choose a vaccination status."],
    ["location", typeof body.location === "string" && body.location.trim().length > 0, "Enter a location."],
    ["adoptionFee", Number.isFinite(Number(body.adoptionFee)) && Number(body.adoptionFee) >= 0, "Enter a valid adoption fee."],
    ["description", typeof body.description === "string" && body.description.trim().length >= 20 && body.description.trim().length <= 3000, "Description must be between 20 and 3,000 characters."],
  ];
  return fields.find(([, valid]) => !valid)?.[2] || null;
}

function petData(body) {
  return {
    name: body.name.trim(),
    species: body.species,
    breed: body.breed.trim(),
    age: body.age.trim(),
    gender: body.gender,
    imageUrl: body.imageUrl.trim(),
    healthStatus: body.healthStatus.trim(),
    vaccinationStatus: body.vaccinationStatus,
    location: body.location.trim(),
    adoptionFee: Number(body.adoptionFee),
    description: body.description.trim(),
  };
}

export async function listPets(req, res, next) {
  try {
    const filter = { status: "available" };
    const query = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 80) : "";
    if (query) {
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: safeQuery, $options: "i" };
    }

    if (typeof req.query.species === "string" && req.query.species) {
      const requestedSpecies = req.query.species.split(",");
      if (requestedSpecies.some((item) => !species.includes(item))) {
        return res.status(400).json({ message: "Choose a valid species filter." });
      }
      filter.species = { $in: requestedSpecies };
    }

    const sortKey = sortableFields.includes(req.query.sort) ? req.query.sort : "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, Number.parseInt(req.query.limit, 10) || 24));
    const [pets, total] = await Promise.all([
      Pet.find(filter)
        .populate("ownerId", "name photoURL")
        .sort({ [sortKey]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Pet.countDocuments(filter),
    ]);
    res.json({ pets, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
}

export async function getPet(req, res, next) {
  try {
    const pet = await Pet.findById(req.params.id).populate("ownerId", "name photoURL").lean();
    if (!pet) {
      return res.status(404).json({ message: "We couldn't find that pet." });
    }
    return res.json({ pet });
  } catch (error) {
    return next(error);
  }
}

export async function createPet(req, res, next) {
  const message = validatePet(req.body);
  if (message) {
    return res.status(400).json({ message });
  }
  try {
    const pet = await Pet.create({ ...petData(req.body), ownerId: req.user._id });
    res.status(201).json({ pet });
  } catch (error) {
    next(error);
  }
}

export async function listMyPets(req, res, next) {
  try {
    const pets = await Pet.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ pets });
  } catch (error) {
    next(error);
  }
}

export async function updatePet(req, res, next) {
  const message = validatePet(req.body);
  if (message) {
    return res.status(400).json({ message });
  }
  try {
    const pet = await Pet.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      { $set: petData(req.body) },
      { new: true, runValidators: true },
    );
    if (!pet) {
      return res.status(404).json({ message: "This listing was not found or you don't have permission to edit it." });
    }
    return res.json({ pet });
  } catch (error) {
    return next(error);
  }
}

export async function deletePet(req, res, next) {
  try {
    const pet = await Pet.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!pet) {
      return res.status(404).json({ message: "This listing was not found or you don't have permission to remove it." });
    }
    await AdoptionRequest.deleteMany({ petId: pet._id });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
