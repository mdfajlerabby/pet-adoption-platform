import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    seedKey: { type: String, unique: true, sparse: true, select: false },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    species: {
      type: String,
      required: true,
      enum: ["Dog", "Cat", "Bird", "Rabbit", "Other"],
    },
    breed: { type: String, required: true, trim: true, maxlength: 80 },
    age: { type: String, required: true, trim: true, maxlength: 40 },
    gender: { type: String, required: true, enum: ["Male", "Female", "Unknown"] },
    imageUrl: { type: String, required: true, trim: true },
    healthStatus: { type: String, required: true, trim: true, maxlength: 240 },
    vaccinationStatus: {
      type: String,
      required: true,
      enum: ["Up to date", "Partially vaccinated", "Not vaccinated", "Unknown"],
    },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    adoptionFee: { type: Number, required: true, min: 0, max: 100000 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["available", "adopted"],
      default: "available",
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Pet || mongoose.model("Pet", petSchema);
