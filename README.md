# BEProjectStax MERN

This folder contains the MERN version of the project:

- `backend/` for the Node.js + Express + MongoDB API
- `frontend/` for the React + Vite client

The MERN app is independent from the Streamlit app in the project root.

## What This Project Does

The project is an LLM evaluation platform for database-query generation.

It lets users:
- manage datasets
- define evaluators
- store API keys and model names
- create evaluation projects
- run and re-run evaluations using LLM providers

## Prerequisites

- Node.js 18+ recommended
- npm 9+ recommended
- MongoDB Atlas connection string or MongoDB server access

## Folder Structure

```text
MERN/
  backend/
  frontend/
  requirements.txt
  README.md
```

## Backend Setup

```bash
cd MERN/backend
npm install
cp .env.example .env
```

Update `MERN/backend/.env` with:

- `MONGO_URI`
- `MONGO_DB_NAME`
- `PORT`
- optional provider base URLs

Example:

```env
PORT=4000
MONGO_URI=mongodb+srv://your-username:your-url-encoded-password@your-cluster.mongodb.net/?appName=Cluster0
MONGO_DB_NAME=beprojectstax_mern_backend
CORS_ORIGIN=*
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
OPENAI_BASE_URL=https://api.openai.com/v1
ANTHROPIC_BASE_URL=https://api.anthropic.com/v1
```

Run backend:

```bash
cd MERN/backend
npm run dev
```

Backend will start on:

```text
http://localhost:4000
```

## Frontend Setup

```bash
cd MERN/frontend
npm install
cp .env.example .env
```

Update `MERN/frontend/.env` if needed:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Run frontend:

```bash
cd MERN/frontend
npm run dev
```

Frontend will usually start on:

```text
http://localhost:5173
```

## Running Full Project

Use two terminals.

Terminal 1:

```bash
cd /Users/yashbhoomkar/Desktop/BEProjectStax/MERN/backend
npm run dev
```

Terminal 2:

```bash
cd /Users/yashbhoomkar/Desktop/BEProjectStax/MERN/frontend
npm run dev
```

Then open the frontend URL shown by Vite in your browser.

## Main API Groups

- `/api/health`
- `/api/datasets`
- `/api/evaluators`
- `/api/projects`
- `/api/api-keys`
- `/api/model-manager`
- `/api/evaluation/run`
- `/api/evaluation/projects/:projectId/re-evaluate`

## Build Commands

Backend syntax check:

```bash
cd MERN/backend
node --check src/server.js
```

Frontend production build:

```bash
cd MERN/frontend
npm run build
```

## Notes

- API keys are currently stored in MongoDB plaintext for parity with the current product behavior.
- The backend seeds default datasets, evaluators, and projects.
- The frontend and backend are both separate npm projects.
