# MERN Frontend

Working React frontend for the BEProjectStax MERN pivot. This frontend is independent from the Streamlit app and connects to the Express backend in `../backend`.

## Setup

```bash
cd MERN/frontend
npm install
cp .env.example .env
npm run dev
```

## Requirements

- Backend running on `http://localhost:4000` by default
- `VITE_API_BASE_URL` can be changed in `.env` if needed
