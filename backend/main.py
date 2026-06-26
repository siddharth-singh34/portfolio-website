"""
Minimal auth backend for the portfolio site.

FastAPI + SQLite. Passwords are never stored in plaintext — they're hashed
with PBKDF2-HMAC-SHA256 using a per-user random salt.

Run:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
"""

import hashlib
import hmac
import os
import secrets
import sqlite3
from contextlib import closing

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")
PBKDF2_ROUNDS = 200_000


def init_db() -> None:
    with closing(sqlite3.connect(DB_PATH)) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                name          TEXT NOT NULL,
                email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
                salt          TEXT NOT NULL,
                password_hash TEXT NOT NULL
            )
            """
        )
        conn.commit()


def hash_password(password: str, salt_hex: str) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), PBKDF2_ROUNDS
    ).hex()


app = FastAPI(title="Portfolio Auth")

# Allow the Next.js dev server (any localhost port) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


class SignupIn(BaseModel):
    name: str
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    name: str
    email: str


@app.post("/signup", response_model=UserOut)
def signup(data: SignupIn):
    name = data.name.strip()
    email = data.email.strip().lower()

    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Enter a valid email")
    if len(data.password) < 6:
        raise HTTPException(
            status_code=400, detail="Password must be at least 6 characters"
        )

    salt = secrets.token_hex(16)
    password_hash = hash_password(data.password, salt)

    with closing(sqlite3.connect(DB_PATH)) as conn:
        exists = conn.execute(
            "SELECT 1 FROM users WHERE email = ?", (email,)
        ).fetchone()
        if exists:
            raise HTTPException(status_code=409, detail="Account already exists")
        conn.execute(
            "INSERT INTO users (name, email, salt, password_hash) VALUES (?, ?, ?, ?)",
            (name, email, salt, password_hash),
        )
        conn.commit()

    return UserOut(name=name, email=email)


@app.post("/login", response_model=UserOut)
def login(data: LoginIn):
    email = data.email.strip().lower()

    with closing(sqlite3.connect(DB_PATH)) as conn:
        row = conn.execute(
            "SELECT name, salt, password_hash FROM users WHERE email = ?", (email,)
        ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Account does not exist")

    name, salt, stored_hash = row
    computed = hash_password(data.password, salt)
    if not hmac.compare_digest(computed, stored_hash):
        raise HTTPException(status_code=401, detail="Wrong password")

    return UserOut(name=name, email=email)


@app.get("/health")
def health():
    return {"status": "ok"}
