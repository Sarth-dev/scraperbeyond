# Full-Stack Article Processing System

This project is a full-stack web application that demonstrates an end-to-end content pipeline — from ingesting articles, processing them using an LLM-powered workflow, and displaying both original and updated content on a modern frontend.

The system is intentionally designed to be simple, modular, and explainable, with a strong focus on real-world constraints, trade-offs, and clean data flow between services.

---

## 🚀 Overview

The application consists of three main parts:

1. **Backend (Laravel API)**  
   - Stores articles in a database  
   - Exposes REST APIs to create, read, update, and delete articles  

2. **Node.js Worker (LLM Pipeline)**  
   - Fetches the latest article from the backend  
   - Finds related articles via Google Search  
   - Scrapes their content  
   - Uses an LLM to improve and reformat the original article  
   - Publishes the updated article back to the backend  

3. **Frontend (React + Vite)**  
   - Fetches articles from the backend API  
   - Displays both original and updated versions  
   - Responsive and minimal UI  

---

## 🧱 Tech Stack

### Backend
- Laravel 11
- PHP 8.2
- SQLite (for simplicity)
- REST APIs

### Worker
- Node.js (ES Modules)
- Axios
- Cheerio (HTML parsing)
- OpenAI API
- Serper.dev (Google Search API)

### Frontend
- React
- Vite
- Axios
- CSS (lightweight, no UI framework)

### Deployment
- Backend: Render (Dockerized)
- Frontend: Vercel

---

## 📂 Repository Structure

```

/
├── backend/        # Laravel backend (API + scraper command)
├── nodeworker/     # Node.js LLM worker script
├── frontend/       # React frontend (Vite)
└── README.md

```

---

## 🔁 System Flow (High Level)

```

Article Source / API / Script
↓
Laravel Backend
↓
Node.js Worker
(Search → Scrape → LLM Rewrite)
↓
Laravel Backend
↓
React UI

````

---

## ⚙️ Backend Setup (Local)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
````

The backend will be available at:

```
http://127.0.0.1:8000
```

---

## 🧠 Node.js Worker Setup

```bash
cd nodeworker
npm install
```

Create a `.env` file:

```env
BACKEND_API_URL=http://127.0.0.1:8000
OPENAI_API_KEY=your_openai_key
SERPER_API_KEY=your_serper_key
```

Run the worker:

```bash
node index.js
```

The worker:

* Fetches an article from the backend
* Enhances it using LLM + reference articles
* Publishes the updated version back via API

The script is defensive and gracefully handles empty datasets (common on free-tier deployments).

---

## 🎨 Frontend Setup (Local)

```bash
cd frontend
npm install
npm run dev
```

Create `.env`:

```env
VITE_API_BASE=http://127.0.0.1:8000
```

Open:

```
http://localhost:5173
```

---

## 🌍 Live Deployment

### Backend (Render)

* Dockerized Laravel application
* SQLite database (ephemeral storage)
* Environment variables injected via Render dashboard

### Frontend (Vercel)

* Built using Vite
* Environment variable configured at build time

**Live Frontend URL:**
👉 *[Frontend](https://scraperarticles.vercel.app)*

**Live Backend API:**
👉 *[Backend](https://scraperbeyond.onrender.com)*

---

## 📌 Data Creation

Articles can be created in multiple ways:

* Via the Node.js worker (automated pipeline)
* Via API tools like curl / Postman

Example using curl:

```bash
curl -X POST https://your-backend-url/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Article",
    "content": "This is a sample article body.",
    "is_updated": false
  }'
```

The frontend automatically reflects new articles without any additional configuration.

---

## ⚖️ Design Decisions & Trade-offs

* **SQLite** was chosen for fast setup and zero configuration.
  In production, this would be replaced with a managed database.

* **Free-tier hosting** means:

  * No background jobs or cron
  * Ephemeral storage
  * Scraper and worker are designed to run locally

* **Google Search** is handled via Serper API instead of scraping HTML directly, avoiding captchas and instability.

* **Node.js worker** is sequential and single-file by design to prioritize clarity over optimization.

These decisions were intentional and documented to reflect real-world engineering constraints.

---

## 🧪 Error Handling & Edge Cases

* Empty database states are handled gracefully
* Node worker exits safely when no articles are found
* Frontend shows clear empty-state messaging
* Defensive scraping logic avoids runtime crashes

---

## 🔮 Future Improvements

* Add authentication for article creation
* Replace SQLite with PostgreSQL
* Add background job processing
* Improve frontend article detail pages
* Add caching and observability

---

## ✅ Final Notes

This project focuses on **end-to-end ownership**, clean interfaces, and practical decision-making under constraints.
Every part of the system is decoupled, explainable, and easy to extend.

---
