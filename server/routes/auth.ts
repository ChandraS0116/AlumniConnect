import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "au_alumni_connect_super_secret_jwt_key_2026";

// POST /api/auth/register
router.post("/register", (req, res) => {
  try {
    const { name, email, password, role, batch, major } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }

    const id = `u_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const assignedRole = role === "alumni" || role === "admin" ? role : "student";
    const avatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`;

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, avatar, batch, major)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name.trim(), cleanEmail, passwordHash, assignedRole, avatar, Number(batch) || 2025, major || "Engineering");

    // If registered as student or alumni, also auto-create directory entry
    if (assignedRole === "student") {
      db.prepare(`
        INSERT INTO students (id, name, avatar, year, major, linkedin, github, bio, skills, looking_for)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(`s_${Date.now()}`, name.trim(), avatar, "Final Year", major || "Computer Science", "", "", "AU student looking to connect with mentors.", JSON.stringify(["Engineering"]), "Mentorship");
    }

    const token = jwt.sign({ id, email: cleanEmail, role: assignedRole, name }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: { id, name, email: cleanEmail, role: assignedRole, avatar },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail) as any;

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        batch: user.batch,
        major: user.major,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare("SELECT id, name, email, role, avatar, batch, major FROM users WHERE id = ?").get(decoded.id) as any;

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
});

// GET /api/auth/demo-users
router.get("/demo-users", (_req, res) => {
  res.json({
    success: true,
    demoAccounts: [
      { role: "admin", email: "admin@andhrauniv.edu.in", password: "admin123", label: "AU Admin Dean" },
      { role: "alumni", email: "venkata@andhrauniv.edu.in", password: "alumni123", label: "Venkata (Google SWE)" },
      { role: "student", email: "arjun@andhrauniv.edu.in", password: "student123", label: "Arjun (Final Year)" },
    ],
  });
});

export default router;
