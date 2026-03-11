# RankPilot AI - SEO Intelligence 🌱

Welcome to RankPilot AI! This is your intelligent, unified dashboard for SEO and Keyword Research. It is built to help you instantly analyze any URL and generate high-intent semantic keywords to power your content strategy.

## ✨ Features

- **Beautiful Olive Garden Aesthetic:** A stunning, light UI designed with custom Tailwind colors (Parchment, Sand, Sage, Olivewood, Bark).
- **SEO Audit:** Enter a website URL to instantly analyze its on-page SEO performance and get AI-driven recommendations.
- **Keyword Research:** Discover high-intent semantic keywords for any topic to rank higher.
- **History & Reports:** A fully integrated dashboard logging your past audits and keyword searches, complete with SEO score trend charts.
- **Authentication:** Create an account and keep your history safe.

## 🚀 Getting Started

Follow these simple steps to get the project running locally on your machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and MongoDB installed.

### 1. Setting up the Backend
First, open your terminal and navigate to the backend directory:
```bash
cd backend
npm install
```

**Important:** You will need to create a `.env` file in the `backend` folder. Add your secrets like so:
```env
MONGO_URI=mongodb://127.0.0.1:27017/rankpilot
JWT_SECRET=your_super_secret_jwt_key
OPENAI_API_KEY=your_openai_api_key_here
```

Then, start the backend server:
```bash
node server.js
```
*The server will start running on port 5000.*

### 2. Setting up the Frontend
Open a new terminal window/tab and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Start the React development server:
```bash
npm start
```

The application will launch in your default browser at `http://localhost:3000`.

## 🛠️ Built With
- **Frontend:** React, Tailwind CSS, Framer Motion, Recharts, Lucide React
- **Backend:** Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT)

---

Enjoy using RankPilot AI! If you run into any issues, just double-check that both your backend server and frontend development server are running at the same time. Happy Ranking! 🚀
