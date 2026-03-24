# 📊 Reel Insight Pro

**Instagram Reel Analytics, Reimagined** — A powerful web application for analyzing Instagram Reel and Post performance with depth-first insights for creators who care about impact, not just views.

![Reel Insight Pro](https://img.shields.io/badge/Version-2.4-purple?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Frontend](https://img.shields.io/badge/Frontend-Vite-646CFF?style=flat-square)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)

## ✨ Features

- **Real-Time Data** — Get live engagement metrics directly from Instagram
- **AI Sentiment Analysis** — Understand audience reactions with sentiment scoring
- **Engagement Analytics** — Track likes, comments, shares, and reach with visual dashboards
- **Trending Detection** — Automatically identify viral content (100k+ views)
- **Music Insights** — See trending audio used in reels
- **Hashtag Extraction** — Automatic hashtag parsing from captions
- **Beautiful Dark UI** — Premium SaaS-style interface with purple-pink gradient accents

## 🏗️ Architecture

```
viral_vision/
├── index.html              # Main entry point
├── src/
│   ├── main.js             # Application logic & API integration
│   ├── config.js           # Backend URL configuration
│   ├── style.css           # Design system (dark theme)
│   └── assets/             # Static assets
├── backend/
│   ├── main.py             # FastAPI server
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Container configuration
│   ├── .env.example        # Environment template
│   └── .env                # API keys (not committed)
└── Insta_Analytics/        # Alternative deployment (HF Spaces)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- [Apify](https://apify.com/) API token (for Instagram data)

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your APIFY_API_TOKEN

# Start server
uvicorn main:app --reload --port 8000
```

### Configuration

Update `src/config.js` to point to your backend:

```javascript
const config = {
  // For local development:
  BACKEND_URL: 'http://localhost:8000',
  
  // For production (Hugging Face Spaces):
  // BACKEND_URL: 'https://your-space.hf.space',
  
  ANALYZE_ENDPOINT: '/api/analyze',
  HEALTH_ENDPOINT: '/health',
};
```

## 📡 API Endpoints

| Method | Endpoint       | Description                          |
|--------|----------------|--------------------------------------|
| GET    | `/health`      | Health check & API status            |
| POST   | `/api/analyze` | Analyze Instagram Reel/Post URL      |

### Analyze Request

```json
POST /api/analyze
{
  "url": "https://www.instagram.com/reel/ABC123..."
}
```

### Response

```json
{
  "username": "@creator",
  "fullName": "Creator Name",
  "bio": "Creator bio",
  "profilePicUrl": "https://...",
  "profileUrl": "https://instagram.com/creator",
  "totalPlays": 1240580,
  "likes": 45000,
  "comments": 1200,
  "shares": 340,
  "reach": 1500000,
  "engagementRate": 7.2,
  "caption": "Post caption...",
  "hashtags": "#tag1 #tag2",
  "postDate": "Oct 12, 2023",
  "sentimentScore": 85,
  "sentimentLabel": "Positive",
  "musicTitle": "Trending Song",
  "tags": ["#tag1", "#tag2"],
  "isTrending": true
}
```

## 🐳 Docker Deployment

```bash
cd backend

# Build image
docker build -t reel-insight-api .

# Run container
docker run -p 7860:7860 -e APIFY_API_TOKEN=your_token reel-insight-api
```

## ☁️ Production Deployment

### Frontend (Vercel/Netlify)

1. Connect your repository
2. Build command: `npm run build`
3. Output directory: `dist`

### Backend (Hugging Face Spaces)

1. Create a new Space with Docker SDK
2. Upload the `backend/` or `Insta_Analytics/` folder
3. Add `APIFY_API_TOKEN` as a secret
4. The API will be available at `https://your-space.hf.space`

## 🛠️ Tech Stack

### Frontend
- **Vite** — Fast build tool and dev server
- **Vanilla JS** — No framework dependencies
- **CSS Custom Properties** — Design tokens for theming
- **Inter Font** — Modern, clean typography

### Backend
- **FastAPI** — High-performance Python API framework
- **httpx** — Async HTTP client for Apify requests
- **Pydantic** — Data validation and serialization
- **Uvicorn** — ASGI server

### External Services
- **Apify** — Instagram data scraping via `instagram-scraper` actor

## 🎨 Design System

The UI uses a premium dark theme with:

| Token | Value |
|-------|-------|
| `--bg-primary` | `#0a0e1a` |
| `--accent-purple` | `#a855f7` |
| `--accent-pink` | `#ec4899` |
| `--gradient-accent` | `linear-gradient(135deg, purple, pink)` |

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `APIFY_API_TOKEN` | Your Apify API token | ✅ Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  <strong>Reel Insight Pro</strong> — Premium Creator Tooling
</p>
