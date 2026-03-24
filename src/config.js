// ── Reel Insight Pro — Configuration ──────────────────────────────────
// Switch BACKEND_URL between local dev and production (HF Spaces).

const config = {
  // For local development:
  // BACKEND_URL: 'http://localhost:8000',

  // For production (Hugging Face Spaces):
  BACKEND_URL: 'https://rathodfahim23-insta-analytics.hf.space',

  // Endpoints
  ANALYZE_ENDPOINT: '/api/analyze',
  HEALTH_ENDPOINT: '/health',
};

export default config;
