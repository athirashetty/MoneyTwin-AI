# MoneyTwin-AI
AI-powered personal financial digital twin and what-if financial simulator.

## 🚀 Project Overview
MoneyTwin AI helps users understand their financial health and simulate future decisions (loans, career changes, investments, major purchases) using a personal financial digital twin before committing real capital.

## 🛠️ Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, Recharts, Lucide React, Axios
- **Backend:** Python 3.10+, FastAPI, Pydantic v2, Uvicorn
- **AI / ML:** Google Gemini API, Scikit-learn, Pandas, NumPy
- **Database:** PostgreSQL (SQLite default for local hackathon development)

## 📁 Project Directory Structure
```
MoneyTwin-AI/
├── frontend/             # React + Vite + Tailwind CSS dashboard
│   ├── src/
│   │   ├── components/   # UI & Visualization components
│   │   ├── pages/        # Dashboard, Simulator, Advisor pages
│   │   ├── App.jsx       # Main application layout & live API test
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/              # Python FastAPI REST API
│   ├── app/
│   │   ├── api/v1/       # Versioned API routes & endpoints
│   │   ├── core/         # Settings & environment configuration
│   │   └── main.py       # FastAPI application entry point
│   ├── venv/             # Python virtual environment
│   ├── requirements.txt
│   └── .env.example
├── .gitignore
└── README.md
```

## ⚡ Quick Start Guide

### 1. Start the FastAPI Backend
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Windows CMD:
.\venv\Scripts\activate.bat

# Run the FastAPI server
uvicorn app.main:app --reload --port 8000
```
- Interactive API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### 2. Start the React Frontend
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start Vite development server
npm run dev
```
- Frontend UI: `http://localhost:5173`
