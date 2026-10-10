import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

const port = Number(process.env.PORT) || 5000;

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  await connectDatabase();
  app.listen(port, () => {
    console.info(`Adoption API listening on port ${port}.`);
  });
}

start().catch((error) => {
  console.error("Could not start the adoption API:", error.message);
  process.exitCode = 1;
});
