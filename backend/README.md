# Auth backend (FastAPI + SQLite)

A tiny login/signup API for the portfolio site. Stores users in a local
`users.db` SQLite file. Passwords are hashed (PBKDF2-HMAC-SHA256, salted) —
never stored in plaintext.

## Run

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API runs at http://localhost:8000 (interactive docs at /docs).

## Endpoints

- `POST /signup` — body `{ "name", "email", "password" }` → 201 user, or 409 if the email already exists.
- `POST /login` — body `{ "email", "password" }` → 200 user, 404 if the email isn't found, 401 if the password is wrong.

The frontend expects the API at `http://localhost:8000`. To change it, set
`NEXT_PUBLIC_API_URL` in the Next.js app's environment.
