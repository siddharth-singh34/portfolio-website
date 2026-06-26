"""
Backend for the portfolio site: single-owner auth + public blog storage.

FastAPI + SQLite.

- Anyone can READ published blogs (so visitors see them).
- Only YOU can create/edit/delete blogs or log in. There is no public sign-up.

Your credentials come from environment variables, so they live as a private
secret on your host (e.g. Render) — never in the code or the repo:

    ADMIN_EMAIL     - your login email
    ADMIN_PASSWORD  - your login password
    ADMIN_NAME      - the name shown after you log in (optional)
    DATABASE_PATH   - where the SQLite file lives (optional)

Run locally:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

NOTE on hosting: on a free host with no persistent disk (e.g. Render free),
the SQLite file is wiped when the server restarts. For blogs that persist
forever, point DATABASE_PATH at a persistent disk, or switch to a hosted
SQLite (Turso) / Postgres later.
"""

import datetime
import hashlib
import hmac
import json
import os
import sqlite3
from contextlib import closing

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict

# ---- Owner account (from environment; local-dev defaults shown) -------------
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "siddharth.singh341710@gmail.com").strip().lower()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme")
ADMIN_NAME = os.environ.get("ADMIN_NAME", "Siddharth Singh")

# A stable bearer token derived from your password (secret, but not the
# password itself). The frontend gets this on login and sends it back when
# writing blogs. No extra env var needed.
ADMIN_TOKEN = hashlib.sha256(f"portfolio-token:{ADMIN_PASSWORD}".encode()).hexdigest()

DB_PATH = os.environ.get(
    "DATABASE_PATH", os.path.join(os.path.dirname(__file__), "blogs.db")
)


def init_db() -> None:
    with closing(sqlite3.connect(DB_PATH)) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS blogs (
                id     TEXT PRIMARY KEY,
                slug   TEXT,
                status TEXT,
                date   TEXT,
                hidden INTEGER DEFAULT 0,
                data   TEXT NOT NULL
            )
            """
        )
        conn.commit()


app = FastAPI(title="Portfolio Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# ---- Models -----------------------------------------------------------------
class LoginIn(BaseModel):
    email: str
    password: str


class LoginOut(BaseModel):
    name: str
    email: str
    token: str


class BlogIn(BaseModel):
    # Accept the full post object from the frontend, including the nested
    # `blocks` array and any other fields, without validating each one.
    model_config = ConfigDict(extra="allow")

    id: str
    title: str = ""
    slug: str = ""
    status: str = "draft"
    date: str = ""
    hidden: bool = False


# ---- Auth helpers -----------------------------------------------------------
def require_admin(authorization: str) -> None:
    expected = f"Bearer {ADMIN_TOKEN}"
    if not authorization or not hmac.compare_digest(authorization, expected):
        raise HTTPException(status_code=401, detail="Not authorized")


def is_admin(authorization: str) -> bool:
    return bool(authorization) and hmac.compare_digest(
        authorization, f"Bearer {ADMIN_TOKEN}"
    )


def is_public(row: sqlite3.Row, today: str) -> bool:
    return (
        row["status"] == "published"
        and not row["hidden"]
        and (not row["date"] or row["date"] <= today)
    )


# ---- Auth -------------------------------------------------------------------
@app.post("/login", response_model=LoginOut)
def login(data: LoginIn):
    email = data.email.strip().lower()
    email_ok = hmac.compare_digest(email, ADMIN_EMAIL)
    password_ok = hmac.compare_digest(data.password, ADMIN_PASSWORD)
    if not email_ok:
        raise HTTPException(status_code=404, detail="Account does not exist")
    if not password_ok:
        raise HTTPException(status_code=401, detail="Wrong password")
    return LoginOut(name=ADMIN_NAME, email=ADMIN_EMAIL, token=ADMIN_TOKEN)


@app.post("/signup")
def signup():
    # Public sign-up is intentionally disabled — this is a single-owner site.
    raise HTTPException(status_code=403, detail="Sign-ups are disabled")


# ---- Blogs ------------------------------------------------------------------
@app.get("/blogs")
def list_public_blogs():
    """All published, visible, non-future blogs — for the public Blogs page."""
    today = datetime.date.today().isoformat()
    with closing(sqlite3.connect(DB_PATH)) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM blogs").fetchall()
    posts = [json.loads(r["data"]) for r in rows if is_public(r, today)]
    posts.sort(key=lambda p: p.get("date", ""), reverse=True)
    return posts


@app.get("/admin/blogs")
def list_all_blogs(authorization: str = Header(default="")):
    """Every blog including drafts/hidden — owner only (for the profile page)."""
    require_admin(authorization)
    with closing(sqlite3.connect(DB_PATH)) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM blogs").fetchall()
    posts = [json.loads(r["data"]) for r in rows]
    posts.sort(key=lambda p: p.get("date", ""), reverse=True)
    return posts


@app.get("/blog")
def get_blog(id: str, authorization: str = Header(default="")):
    """A single blog by id. Public can only fetch published/visible posts."""
    today = datetime.date.today().isoformat()
    with closing(sqlite3.connect(DB_PATH)) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT * FROM blogs WHERE id = ?", (id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    if not is_admin(authorization) and not is_public(row, today):
        raise HTTPException(status_code=404, detail="Blog not found")
    return json.loads(row["data"])


@app.post("/blogs")
def upsert_blog(blog: BlogIn, authorization: str = Header(default="")):
    """Create or update a blog — owner only."""
    require_admin(authorization)
    post = blog.model_dump()
    with closing(sqlite3.connect(DB_PATH)) as conn:
        conn.execute(
            """
            INSERT INTO blogs (id, slug, status, date, hidden, data)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                slug=excluded.slug,
                status=excluded.status,
                date=excluded.date,
                hidden=excluded.hidden,
                data=excluded.data
            """,
            (
                post["id"],
                post.get("slug", ""),
                post.get("status", "draft"),
                post.get("date", ""),
                1 if post.get("hidden") else 0,
                json.dumps(post),
            ),
        )
        conn.commit()
    return post


@app.delete("/blogs")
def delete_blog(id: str, authorization: str = Header(default="")):
    """Delete a blog by id — owner only."""
    require_admin(authorization)
    with closing(sqlite3.connect(DB_PATH)) as conn:
        conn.execute("DELETE FROM blogs WHERE id = ?", (id,))
        conn.commit()
    return {"deleted": id}


@app.get("/health")
def health():
    return {"status": "ok"}
