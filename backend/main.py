"""
Reel Insight Pro — Backend API
FastAPI service that proxies Instagram data requests through Apify API.
Deploy on Hugging Face Spaces.
"""

import os
import re
from datetime import datetime
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(
    title="Reel Insight Pro API",
    version="1.0.0",
    description="Backend API for Instagram Reel/Post analytics",
)

# ── CORS ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production to your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Config ───────────────────────────────────────────────────────────
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN", "")
APIFY_ACTOR_ID = "apify~instagram-scraper"
APIFY_RUN_URL = f"https://api.apify.com/v2/acts/{APIFY_ACTOR_ID}/run-sync-get-dataset-items"


# ── Models ───────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    url: str


class AnalyticsResponse(BaseModel):
    username: str
    fullName: Optional[str] = None
    bio: Optional[str] = None
    profilePicUrl: Optional[str] = None
    profileUrl: Optional[str] = None
    totalPlays: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    reach: int = 0
    engagementRate: float = 0.0
    engagementDelta: str = ""
    likesChange: str = ""
    commentsChange: str = ""
    sharesChange: str = "Stable"
    reachChange: str = ""
    caption: str = ""
    hashtags: str = ""
    postDate: str = ""
    sentimentScore: int = 75
    sentimentLabel: str = "Positive"
    musicTitle: str = ""
    musicUses: str = ""
    tags: list[str] = []
    isTrending: bool = False


# ── Helpers ──────────────────────────────────────────────────────────
INSTAGRAM_URL_PATTERN = re.compile(
    r"https?://(www\.)?instagram\.com/(reel|p|reels)/[\w-]+", re.IGNORECASE
)


def validate_instagram_url(url: str) -> bool:
    return bool(INSTAGRAM_URL_PATTERN.match(url))


def extract_hashtags(caption: str) -> list[str]:
    return re.findall(r"#\w+", caption or "")


def format_date(timestamp: str) -> str:
    try:
        dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        return dt.strftime("%b %d, %Y")
    except Exception:
        return timestamp or "—"


def compute_engagement(likes: int, comments: int, views: int) -> float:
    if views == 0:
        return 0.0
    return round(((likes + comments) / views) * 100, 1)


# ── Routes ───────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "api_configured": bool(APIFY_API_TOKEN),
    }


@app.post("/api/analyze", response_model=AnalyticsResponse)
async def analyze(request: AnalyzeRequest):
    url = request.url.strip()

    if not validate_instagram_url(url):
        raise HTTPException(status_code=400, detail="Invalid Instagram URL")

    if not APIFY_API_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="Apify API token not configured. Set APIFY_API_TOKEN env var.",
        )

    # Call Apify Instagram Scraper
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                APIFY_RUN_URL,
                params={"token": APIFY_API_TOKEN},
                json={
                    "directUrls": [url],
                    "resultsType": "posts",
                    "resultsLimit": 1,
                    "addParentData": True,
                },
            )
            response.raise_for_status()
            items = response.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Apify API error: {e.response.status_code}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to reach Apify: {str(e)}",
        )

    if not items:
        raise HTTPException(status_code=404, detail="No data found for this URL")

    post = items[0]

    # Extract data
    likes = post.get("likesCount", 0) or 0
    comments_count = post.get("commentsCount", 0) or 0
    views = post.get("videoPlayCount", 0) or post.get("videoViewCount", 0) or 0
    caption = post.get("caption", "") or ""
    hashtags = extract_hashtags(caption)
    owner = post.get("ownerUsername", "") or ""

    engagement = compute_engagement(likes, comments_count, views)

    return AnalyticsResponse(
        username=f"@{owner}" if owner else "@unknown",
        fullName=post.get("ownerFullName", ""),
        bio=post.get("ownerBio", "Creator"),
        profilePicUrl=post.get("profilePicUrl", ""),
        profileUrl=f"https://instagram.com/{owner}" if owner else "",
        totalPlays=views,
        likes=likes,
        comments=comments_count,
        shares=0,
        reach=int(views * 1.2),
        engagementRate=engagement,
        engagementDelta="",
        likesChange="",
        commentsChange="",
        sharesChange="Stable",
        reachChange="",
        caption=caption,
        hashtags=" ".join(hashtags),
        postDate=format_date(post.get("timestamp", "")),
        sentimentScore=75,
        sentimentLabel="Positive",
        musicTitle=post.get("musicInfo", {}).get("music_title", "")
        if isinstance(post.get("musicInfo"), dict)
        else "",
        musicUses="",
        tags=hashtags[:6],
        isTrending=views > 100_000,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=7860)
