import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDatabase } from "./config/database.js";
import Pet from "./models/Pet.js";
import User from "./models/User.js";

const examples = [
  {
    seedKey: "milo",
    name: "Milo",
    species: "Dog",
    breed: "Golden retriever mix",
    age: "2 years",
    gender: "Male",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=85",
    healthStatus: "Healthy, friendly, and recently checked by a vet",
    vaccinationStatus: "Up to date",
    location: "Portland, OR",
    adoptionFee: 175,
    description: "Milo is an easygoing, people-loving companion who is happiest on a sunny walk followed by a quiet afternoon nearby. He knows his basic cues, is gentle with visitors, and would love a family ready for everyday adventures.",
  },
  {
    seedKey: "luna",
    name: "Luna",
    species: "Cat",
    breed: "Domestic shorthair",
    age: "1 year",
    gender: "Female",
    imageUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=85",
    healthStatus: "Healthy, spayed, and ready to settle in",
    vaccinationStatus: "Up to date",
    location: "Austin, TX",
    adoptionFee: 95,
    description: "Luna is a thoughtful little observer who warms up with a soft voice and a favorite sunny spot. Once she feels at home, she will happily keep you company while you read, work, or take a well-earned break.",
  },
  {
    seedKey: "pip",
    name: "Pip",
    species: "Bird",
    breed: "Green-cheek conure",
    age: "8 months",
    gender: "Unknown",
    imageUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1200&q=85",
    healthStatus: "Bright, curious, and in good health",
    vaccinationStatus: "Unknown",
    location: "Denver, CO",
    adoptionFee: 120,
    description: "Pip brings a curious little spark to every room and loves enrichment, gentle company, and a predictable routine. An adopter with bird experience and time for daily interaction would make a wonderful match.",
  },
  {
    seedKey: "peanut",
    name: "Peanut",
    species: "Rabbit",
    breed: "Mini lop",
    age: "1 year",
    gender: "Male",
    imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=1200&q=85",
    healthStatus: "Healthy and litter-box trained",
    vaccinationStatus: "Up to date",
    location: "Seattle, WA",
    adoptionFee: 70,
    description: "Peanut is a calm, gentle rabbit with a fondness for leafy greens and a roomy, rabbit-safe place to explore. He enjoys quiet company and will blossom with an adopter who can let him approach at his own pace.",
  },
  {
    seedKey: "daisy",
    name: "Daisy",
    species: "Dog",
    breed: "Beagle mix",
    age: "3 years",
    gender: "Female",
    imageUrl: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=1200&q=85",
    healthStatus: "Healthy, spayed, and active",
    vaccinationStatus: "Up to date",
    location: "Chicago, IL",
    adoptionFee: 150,
    description: "Daisy is a cheerful neighborhood explorer with a soft spot for sniffy walks and a cozy place to nap. She loves kind people, learns quickly with positive encouragement, and would enjoy a home that makes time for fresh-air outings.",
  },
  {
    seedKey: "olive",
    name: "Olive",
    species: "Cat",
    breed: "Tabby",
    age: "4 months",
    gender: "Female",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=85",
    healthStatus: "Healthy, playful, and recently examined",
    vaccinationStatus: "Partially vaccinated",
    location: "Brooklyn, NY",
    adoptionFee: 110,
    description: "Olive is a playful kitten who turns ordinary afternoons into a tiny adventure. She is still learning about the world, so a patient home ready to continue her vet visits, play often, and offer a safe indoor space is ideal.",
  },
];

async function seed() {
  if (!process.env.SEED_OWNER_EMAIL || !process.env.SEED_OWNER_PASSWORD) {
    throw new Error("Set SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD before loading example pets.");
  }
  await connectDatabase();

  const email = process.env.SEED_OWNER_EMAIL.trim().toLowerCase();
  let owner = await User.findOne({ email });
  if (!owner) {
    if (process.env.SEED_OWNER_PASSWORD.length < 12) {
      throw new Error("SEED_OWNER_PASSWORD must be at least 12 characters.");
    }
    owner = await User.create({
      name: process.env.SEED_OWNER_NAME || "Pawfect Home Shelter",
      email,
      password: await bcrypt.hash(process.env.SEED_OWNER_PASSWORD, 12),
    });
  }

  for (const example of examples) {
    const { seedKey, ...pet } = example;
    await Pet.findOneAndUpdate(
      { seedKey },
      { $set: { ...pet, seedKey, ownerId: owner._id, status: "available" } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
  }

  console.info(`Loaded ${examples.length} example pets for ${email}.`);
}

seed()
  .catch((error) => {
    console.error("Could not load example pets:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
