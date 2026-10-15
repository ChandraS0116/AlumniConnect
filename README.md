# Alumni Connect AI

A modern, fullstack alumni networking platform connecting students, alumni, and mentors through meaningful professional relationships, video lessons, and mentorship matching.

---

## Overview

**Alumni Connect AI** bridges the gap between current students and alumni by providing a centralized, database-backed platform for networking, mentorship, career guidance, and community engagement.

Built with a **Node.js/Express + Native SQLite** backend and a **React + TypeScript + Vite + Tailwind CSS** frontend.

---

## Features

### 🎓 Student Portal
* Explore alumni profiles filtered by industry, department, and graduation year
* Connect directly with alumni through 1-on-1 mentorship requests
* Publish student profiles with skills, bio, LinkedIn, and GitHub links
* Ask questions and get guidance on the live Doubt Board

### 🌟 Alumni Network
* Search graduates across top companies (Google, Microsoft, Goldman Sachs, Stripe, etc.)
* Add new alumni profiles to the network
* Receive mentorship requests from juniors and students

### 🎥 Mentorship Hub & Video Lessons
* Watch real, embedded mentor video lessons directly in-app
* Upload new video lessons with any public YouTube link
* Automatic thumbnail extraction and view tracking
* Filter video sessions by topic (Engineering, Finance, AI/ML, Career, Design)

### 🤖 AI Engine
* **Semantic Mentor Matcher**: Recommends the highest-relevance alumni mentors based on skill overlaps and target career goals
* **Contextual Career Guidance**: Generates personalized preparation roadmaps for FAANG interviews, investment banking, and AI research

### 🛡️ Admin Operations Console
* Real-time metrics computed directly from the SQLite database
* Live pending approval queue with one-click approval/rejection
* System health status and weekly engagement analytics

---

## Tech Stack

### Backend
* **Runtime**: Node.js (v20+)
* **Server**: Express.js, CORS, Dotenv
* **Database**: Native SQLite (`node:sqlite` in WAL mode)
* **API**: RESTful endpoints with JSON serialization

### Frontend
* **Framework**: React 18, TypeScript, Vite
* **Styling**: Tailwind CSS, shadcn/ui design tokens
* **Icons**: Lucide React
* **Notifications**: Sonner

### Testing & Tooling
* **Unit Testing**: Vitest, React Testing Library
* **Type Checking**: TypeScript 5.8
* **Linting**: ESLint 9

---

## Project Structure

```text
AlumniConnect/
├── server/                    # Backend API
│   ├── db.ts                  # SQLite database schema & auto-seed
│   ├── index.ts               # Express server entrypoint (Port 5000)
│   └── routes/                # REST API endpoints
│       ├── admin.ts           # Admin stats & approvals
│       ├── ai.ts              # AI matchmaking & career advice
│       ├── alumni.ts          # Alumni directory & connect
│       ├── doubts.ts          # Doubt board & replies
│       ├── students.ts        # Student profiles
│       └── videos.ts          # Mentor video lessons
├── src/                       # Frontend Application
│   ├── components/            # UI & Dashboard components
│   │   ├── dashboard/         # AlumniCard, VideoCard, StatCard
│   │   ├── layout/            # Navbar, Footer, AppLayout
│   │   └── ui/                # Base design components
│   ├── data/                  # Types & seed dataset
│   ├── lib/                   # API client & YouTube helper
│   ├── pages/                 # Route pages (Index, Alumni, Mentors, Students, Admin)
│   └── test/                  # Vitest unit test suite
├── index.html                 # App entrypoint
├── package.json               # Fullstack dependencies & scripts
├── tailwind.config.ts         # Academic theme configuration
└── vite.config.ts             # Vite bundler & API proxy configuration
```

---

## Getting Started

### 1. Setup & Installation
```bash
npm install --legacy-peer-deps
```

### 3. Start fullstack development (Frontend + Backend)
```bash
npm run dev
```
* **Frontend**: `http://localhost:8080`
* **Backend API**: `http://localhost:5000`
* **Health Check**: `http://localhost:5000/api/health`

### 4. Running individually (optional)
```bash
# Start backend server only
npm run server

# Start frontend client only
npm run dev:client
```

### 5. Running tests & builds
```bash
# Run unit test suite
npm test

# Build for production
npm run build

# Run linter
npm run lint
```

---

## Author

**Sri Chandra Pappu**  
[LinkedIn Profile](https://www.linkedin.com/in/chandrapappu1609)  
*Alumni Connect AI — Connecting Students, Alumni, and Mentors.*