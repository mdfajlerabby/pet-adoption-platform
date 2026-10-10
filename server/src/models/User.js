import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: { type: String, select: false },
    googleId: { type: String, sparse: true, unique: true },
    photoURL: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", userSchema);
