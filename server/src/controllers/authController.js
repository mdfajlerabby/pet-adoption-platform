import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { createSessionToken, publicUser, sessionCookieOptions } from "../utils/auth.js";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function issueSession(user, res) {
  res.cookie("pet_session", createSessionToken(user._id), sessionCookieOptions());
  return res.json({ user: publicUser(user) });
}

export async function register(req, res, next) {
  try {
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
    const { name, email, password, photoURL = "" } = body;
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
      return res.status(400).json({ message: "Enter a name between 2 and 80 characters." });
    }
    if (typeof email !== "string" || !emailPattern.test(email.trim())) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (typeof password !== "string" || !passwordPattern.test(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters and include uppercase and lowercase letters." });
    }
    if (typeof photoURL !== "string" || photoURL.length > 2048) {
      return res.status(400).json({ message: "Enter a valid profile photo URL." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
      photoURL: photoURL.trim(),
    });
    return issueSession(user, res);
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
    const { email, password } = body;
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Enter your email and password." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "The email or password you entered is incorrect." });
    }
    return issueSession(user, res);
  } catch (error) {
    return next(error);
  }
}

export async function googleLogin(req, res, next) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ message: "Google sign-in is not configured yet." });
    }
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
    const { credential } = body;
    if (typeof credential !== "string" || !credential) {
      return res.status(400).json({ message: "Google did not provide a valid sign-in token." });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified || !payload.sub) {
      return res.status(401).json({ message: "Google could not verify this account." });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: payload.name || email.split("@")[0],
        email,
        googleId: payload.sub,
        photoURL: payload.picture || "",
      });
    } else if (user.googleId && user.googleId !== payload.sub) {
      return res.status(409).json({ message: "This email is connected to a different Google account." });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      user.photoURL = user.photoURL || payload.picture || "";
      await user.save();
    }

    return issueSession(user, res);
  } catch (error) {
    return next(error);
  }
}

export async function currentUser(req, res) {
  res.json({ user: publicUser(req.user) });
}

export function logout(req, res) {
  res.clearCookie("pet_session", sessionCookieOptions());
  res.status(204).end();
}
