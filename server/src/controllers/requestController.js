import AdoptionRequest from "../models/AdoptionRequest.js";
import Pet from "../models/Pet.js";

export async function createRequest(req, res, next) {
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const { petId, pickupDate, message } = body;
  if (typeof petId !== "string" || !/^[a-f\d]{24}$/i.test(petId)) {
    return res.status(400).json({ message: "Choose a valid pet listing." });
  }
  const date = new Date(pickupDate);
  if (!pickupDate || Number.isNaN(date.getTime()) || date < new Date(new Date().setHours(0, 0, 0, 0))) {
    return res.status(400).json({ message: "Choose a pickup date that is today or later." });
  }
  if (typeof message !== "string" || message.trim().length < 10 || message.trim().length > 1000) {
    return res.status(400).json({ message: "Tell the owner a little about your home (10–1,000 characters)." });
  }

  try {
    const pet = await Pet.findOne({ _id: petId, status: "available" });
    if (!pet) {
      return res.status(404).json({ message: "This pet is no longer available." });
    }
    if (pet.ownerId.equals(req.user._id)) {
      return res.status(403).json({ message: "You can't request to adopt your own listing." });
    }
    const request = await AdoptionRequest.create({
      petId: pet._id,
      adopterId: req.user._id,
      pickupDate: date,
      message: message.trim(),
    });
    res.status(201).json({ request });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already sent a request for this pet." });
    }
    next(error);
  }
}

export async function listMyRequests(req, res, next) {
  try {
    const requests = await AdoptionRequest.find({ adopterId: req.user._id })
      .populate("petId")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ requests });
  } catch (error) {
    next(error);
  }
}

export async function listPetRequests(req, res, next) {
  try {
    const pet = await Pet.findOne({ _id: req.params.petId, ownerId: req.user._id });
    if (!pet) {
      return res.status(404).json({ message: "This listing was not found or you don't have permission to view its requests." });
    }
    const requests = await AdoptionRequest.find({ petId: pet._id })
      .populate("adopterId", "name email photoURL")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ requests });
  } catch (error) {
    next(error);
  }
}

export async function updateRequestStatus(req, res, next) {
  const status = req.body && typeof req.body === "object" ? req.body.status : null;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Choose approve or reject for this request." });
  }
  try {
    const request = await AdoptionRequest.findById(req.params.id).populate("petId");
    if (!request || !request.petId.ownerId.equals(req.user._id)) {
      return res.status(404).json({ message: "This request was not found or you don't have permission to manage it." });
    }
    if (request.status !== "pending") {
      return res.status(409).json({ message: "This request has already been reviewed." });
    }

    if (status === "rejected") {
      const rejected = await AdoptionRequest.findOneAndUpdate(
        { _id: request._id, status: "pending" },
        { $set: { status: "rejected" } },
        { new: true },
      );
      if (!rejected) {
        return res.status(409).json({ message: "This request has already been reviewed." });
      }
      return res.json({ request: rejected });
    }

    const pet = await Pet.findOneAndUpdate(
      { _id: request.petId._id, ownerId: req.user._id, status: "available" },
      { $set: { status: "adopted" } },
      { new: true },
    );
    if (!pet) {
      return res.status(409).json({ message: "Another request has already been approved for this pet." });
    }

    const selected = await AdoptionRequest.findOneAndUpdate(
      { _id: request._id, status: "pending" },
      { $set: { status: "approved" } },
      { new: true },
    );
    if (!selected) {
      await Pet.updateOne({ _id: pet._id, status: "adopted" }, { $set: { status: "available" } });
      return res.status(409).json({ message: "This request has already been reviewed." });
    }

    await AdoptionRequest.updateMany(
      { petId: pet._id, _id: { $ne: selected._id }, status: "pending" },
      { $set: { status: "rejected" } },
    );
    return res.json({ request: selected, pet });
  } catch (error) {
    return next(error);
  }
}

export async function cancelRequest(req, res, next) {
  try {
    const request = await AdoptionRequest.findOneAndDelete({
      _id: req.params.id,
      adopterId: req.user._id,
      status: "pending",
    });
    if (!request) {
      return res.status(404).json({ message: "This pending request was not found or can't be cancelled." });
    }
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
