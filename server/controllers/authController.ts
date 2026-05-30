import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { isMongoConnected } from "../config/database";

const JWT_SECRET = process.env.JWT_SECRET || "whamo-designer-jwt-fallback";
const JWT_EXPIRES = "7d";

function mongoGuard(res: Response): boolean {
  if (!isMongoConnected()) {
    res.status(503).json({ message: "Database not connected. Please check server configuration." });
    return false;
  }
  return true;
}

export async function register(req: Request, res: Response) {
  if (!mongoGuard(res)) return;
  try {
    const { fullName, email, password } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);
    await User.create({ fullName: fullName.trim(), email: email.toLowerCase().trim(), password: hashed });

    return res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  if (!mongoGuard(res)) return;
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      token,
      user: { id: user._id, email: user.email, fullName: user.fullName },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getMe(req: Request, res: Response) {
  return res.json({ user: (req as any).user });
}
