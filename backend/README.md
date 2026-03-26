# MERN Backend

Independent Node.js + Express + MongoDB backend for the BEProjectStax pivot. This codebase does not import or depend on the Streamlit project.

## Features

- REST APIs for datasets, evaluators, API keys, model manager, evaluation projects, and evaluation execution
- Separate Mongo namespace via `MONGO_DB_NAME`
- Batch evaluation in chunks of 20 rows per evaluator
- Provider adapters for Gemini, Claude, and OpenAI

## Setup

```bash
cd MERN/backend
npm install
cp .env.example .env
npm run dev
```

## API Groups

- `GET /api/health`
- `GET|POST /api/datasets`
- `GET|POST /api/evaluators`
- `GET|POST /api/projects`
- `GET|POST /api/api-keys`
- `GET|POST /api/model-manager`
- `POST /api/evaluation/run`
- `POST /api/evaluation/projects/:projectId/re-evaluate`

## Notes

- API keys are stored in MongoDB plaintext for parity with the existing product behavior.
- The backend seeds default datasets, evaluators, and projects if they do not already exist in the MERN database.
