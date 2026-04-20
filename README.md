<div align="center">

# 🛡️ PhishGuard AI
### AI-Powered Phishing Detection System

![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs)
![Express](https://img.shields.io/badge/Server-Express.js-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-F7B93E?style=for-the-badge&logo=jsonwebtokens)

![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)

> An AI-powered full-stack web application that detects phishing threats in **URLs, Emails, and Text** using a custom-built Machine Learning engine with NLP pattern analysis.

**NLP Detection • Heuristic Scoring • Real-time Analytics • Scan History • JWT Auth**

[Features](#-features) • [Quick Start](#-quick-start) • [How AI Works](#-how-the-ai-works) • [API Docs](#-api-endpoints) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 Overview

**PhishGuard AI** is a comprehensive phishing detection system designed to protect users from online threats. The system uses a custom-built AI engine that combines **NLP keyword analysis**, **URL heuristics**, and **weighted feature scoring** to classify threats — with no external ML API required.

### 🎯 Mission
Phishing attacks are one of the most common cyber threats today. PhishGuard AI gives users a simple, fast, and intelligent tool to verify suspicious URLs, emails, and messages before interacting with them.

---

## ✨ Features

- 🤖 **AI Detection Engine** — Custom NLP + Heuristic ML model, fully self-contained
- 🔗 **URL Scanner** — Detects typosquatting, suspicious TLDs, IP-based URLs, shortened links
- 📧 **Email Scanner** — Detects phishing phrases, brand impersonation, urgency language
- 📝 **Text Scanner** — Analyzes any suspicious message or content
- 📊 **Dashboard** — Real-time stats, charts, threat breakdown, and scan activity
- 📋 **Scan History** — Full paginated history with filters and delete options
- 🔐 **JWT Authentication** — Secure login and registration system
- 🔒 **Password Hashing** — bcrypt encryption for all stored passwords
- ⚡ **Rate Limiting** — Protection against API abuse (100 req / 15 min)
- 📈 **Risk Scoring** — 0–100 risk score with confidence percentage per scan

---

## 🏗️ System Architecture

```
📦 PhishGuard AI System
│
├── 🖥️  Frontend (React 18)
│   ├── 🔐 Auth        - Login & Register pages
│   ├── 📊 Dashboard   - Stats, charts, quick actions
│   ├── 🔍 Scanner     - URL / Email / Text detection UI
│   └── 📋 History     - Paginated scan history with filters
│
├── ⚡ Backend (Express.js)
│   ├── 🔐 Auth Routes     - Register, Login, Get Me
│   ├── 🔍 Scan Routes     - Run detection, Get result
│   ├── 📋 History Routes  - CRUD for scan history
│   └── 📊 Stats Routes    - Dashboard analytics
│
├── 🤖 AI / ML Engine (Custom)
│   ├── 🔗 URL Feature Extractor
│   ├── 📧 Email Feature Extractor
│   ├── 📝 Text Feature Extractor
│   ├── ⚖️  Weighted Scoring Engine
│   └── 🏷️  Verdict Classifier
│
└── 🗄️  Database (MongoDB)
    ├── 👤 Users Collection
    └── 📁 Scans Collection
```

---

## 🚦 Threat Classification

| Verdict | Risk Score | Description | Color |
|---------|-----------|-------------|-------|
| ✅ Safe | 0 – 29 | No threats detected, content appears legitimate | Green |
| ⚠️ Suspicious | 30 – 59 | Some red flags found, proceed with caution | Amber |
| 🚨 Phishing | 60 – 100 | High threat detected, do NOT interact | Red |

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Download |
|------------|---------|----------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| MongoDB | Latest | [mongodb.com](https://www.mongodb.com/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### ⚡ Setup — Backend

```bash
# 1. Clone the repository
git clone https://github.com/JatindeepSingh/AI-Phishing-Detector.git
cd AI-Phishing-Detector

# 2. Go to backend
cd backend
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your values

# 4. Start backend server
npm run dev
```
✅ Backend runs at `http://localhost:5000`

### ⚡ Setup — Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```
✅ Frontend runs at `http://localhost:3000`

### 🔧 Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/phishing_detector
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

---

## 🤖 How the AI Works

The detection engine extracts features from input and uses a **weighted scoring system** to calculate a risk score from 0–100.

### URL Features Analyzed

| Feature | Risk Points |
|---------|------------|
| No HTTPS encryption | +15 |
| Raw IP address in URL | +30 |
| @ symbol in URL | +25 |
| Mimics real brand (typosquatting) | +35 |
| Suspicious TLD (.ru, .tk, .xyz) | +25 |
| Shortened URL (bit.ly etc.) | +20 |
| Excessive subdomains | +15 each |
| Phishing keywords in URL | +10 |
| Malformed / invalid URL | +40 |

### Email Features Analyzed

| Feature | Risk Points |
|---------|------------|
| Phishing keywords detected | +8 each |
| Generic greeting (Dear Customer) | +15 |
| Brand impersonation | +20 |
| Urgency language | +10 each |
| Suspicious links inside email | +20 each |
| Excessive exclamation marks | +10 |
| Excessive capital letters | +10 |

### Scoring Flow

```
Input (URL / Email / Text)
        ↓
Feature Extraction
        ↓
Weighted Scoring  →  Risk Score (0–100)
        ↓
Verdict Classification
        ↓
  0–29  →  ✅ SAFE
 30–59  →  ⚠️  SUSPICIOUS
 60–100 →  🚨 PHISHING
        ↓
Confidence % + Flags List
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB | NoSQL database |
| Mongoose | MongoDB ODM / schemas |
| JWT | Secure authentication tokens |
| bcryptjs | Password hashing |
| dotenv | Environment variable management |
| express-rate-limit | API rate limiting |
| nodemon | Auto server restart (dev) |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI component framework |
| React Router v6 | Client-side routing |
| CSS Modules | Scoped component styling |
| Axios | HTTP requests to backend |
| Recharts | Dashboard charts & graphs |
| Context API | Global auth state management |

---

## 📁 Project Structure

```
AI-Phishing-Detector/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── ml/
│   │   └── detector.js          # 🤖 AI detection engine
│   ├── models/
│   │   ├── User.js              # User MongoDB schema
│   │   └── Scan.js              # Scan result MongoDB schema
│   ├── routes/
│   │   ├── auth.js              # Register / Login / Me
│   │   ├── scan.js              # Run AI scan
│   │   ├── history.js           # Scan history CRUD
│   │   └── stats.js             # Dashboard statistics
│   ├── .env                     # Environment variables (not in repo)
│   ├── package.json
│   └── server.js                # Express entry point
│
└── frontend/
    ├── public/
    │   └── index.html           # HTML shell
    └── src/
        ├── components/
        │   ├── Layout.js        # Sidebar + navigation shell
        │   └── Layout.module.css
        ├── context/
        │   └── AuthContext.js   # Global auth state (React Context)
        ├── pages/
        │   ├── Login.js         # Login page
        │   ├── Register.js      # Register page
        │   ├── Dashboard.js     # Stats + charts
        │   ├── Scanner.js       # Main AI scan interface
        │   ├── History.js       # Paginated scan history
        │   └── *.module.css     # Page-level styles
        ├── App.js               # Routes + private/public guards
        ├── index.js             # React entry point
        └── index.css            # Global styles + CSS variables
```

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | `/api/auth/register` | Create new account | ❌ |
| POST | `/api/auth/login` | Login and get token | ❌ |
| GET | `/api/auth/me` | Get current user info | ✅ |

### Scan
| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | `/api/scan` | Run AI phishing detection | ✅ |
| GET | `/api/scan/:id` | Get single scan result | ✅ |

### History
| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| GET | `/api/history` | Get paginated scan history | ✅ |
| DELETE | `/api/history/:id` | Delete one scan | ✅ |
| DELETE | `/api/history` | Clear all history | ✅ |

### Stats
| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| GET | `/api/stats` | Get dashboard statistics | ✅ |

---

## 🧪 Test Inputs

### 🚨 Phishing URL
```
http://paypal-secure-login.ru/verify?account=suspended
```

### 🚨 Phishing Email
```
Dear Customer, Your account has been suspended due to unusual 
activity. Click here immediately to verify your account or it 
will be permanently closed. Act now — limited time!
```

### ⚠️ Suspicious Text
```
Congratulations! You have won $1,000,000 lottery prize.
Wire transfer required. Act now, limited time offer!
```

### ✅ Safe URL
```
https://github.com/login
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## ⚠️ Disclaimer

PhishGuard AI is a **decision support tool**. It is designed to assist users in identifying potential phishing threats but should not be the sole basis for security decisions. Always exercise caution and use additional security measures.

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Developer

**Jatindeep Singh**

<div align="center">

🌟 **Star this repo if it helped you!**

Made with ❤️ for a Safer Internet

</div>
