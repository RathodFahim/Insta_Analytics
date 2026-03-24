// ══════════════════════════════════════════════════════════════════════
// Reel Insight Pro — Main Application Logic
// ══════════════════════════════════════════════════════════════════════

import config from './config.js';

// ── DOM refs ────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const urlInput      = $('url-input');
const analyzeBtn    = $('analyze-btn');
const heroSection   = $('hero-section');
const loadingSection= $('loading-section');
const emptyState    = $('empty-state');
const dashboard     = $('dashboard');
const errorMsg      = $('error-msg');
const errorText     = $('error-text');

// ── Utilities ───────────────────────────────────────────────────────

/** Format large numbers: 1240580 → "1,240,580" */
function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toLocaleString();
}

/** Format raw number with commas: 1240580 → "1,240,580" */
function formatFull(n) {
  return n.toLocaleString('en-US');
}

/** Animated count-up for metric elements */
function animateCountUp(element, target, duration = 1600, formatter = formatFull) {
  const start = performance.now();
  const initial = 0;

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(initial + (target - initial) * eased);
    element.textContent = formatter(current);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/** Validate Instagram URL */
function isValidInstagramUrl(url) {
  const patterns = [
    /instagram\.com\/reel\//i,
    /instagram\.com\/p\//i,
    /instagram\.com\/reels\//i,
  ];
  try {
    new URL(url);
    return patterns.some(p => p.test(url));
  } catch {
    return false;
  }
}

/** Show error */
function showError(msg) {
  errorText.textContent = msg;
  errorMsg.style.display = 'flex';
  setTimeout(() => { errorMsg.style.display = 'none'; }, 5000);
}

function clearError() {
  errorMsg.style.display = 'none';
}

/** Toggle sections */
function showSection(section) {
  [heroSection, loadingSection, emptyState, dashboard].forEach(s => {
    if (s) s.style.display = 'none';
  });
  // Always show hero (navbar visible)
  heroSection.style.display = '';
  if (section === 'loading')   loadingSection.style.display = '';
  if (section === 'empty')     emptyState.style.display = '';
  if (section === 'dashboard') dashboard.style.display = '';
}

// ── Mock data (for demo / dev without backend) ──────────────────────
const MOCK_DATA = {
  username: '@alex_vison_',
  fullName: 'Alex Vison',
  bio: 'Tech Lifestyle Influencer',
  profilePicUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex&backgroundColor=1e2a45',
  profileUrl: 'https://instagram.com/alex_vison_',
  totalPlays: 1_240_580,
  likes: 45_000,
  comments: 1_200,
  shares: 340,
  reach: 1_500_000,
  engagementRate: 7.2,
  engagementDelta: '+1.2% from last 7 days',
  likesChange: '+4.2%',
  commentsChange: '+12.8%',
  sharesChange: 'Stable',
  reachChange: '+25.1%',
  caption: 'Just wrapped up the first flight of the new cinematic drone! The dynamic range on this sensor is absolutely insane. 🎬✨\n\nTesting out some new flight maneuvers and the response time is smoother than ever. Can\'t wait to show you guys the full reel coming tomorrow. What should I film next? Let me know in the comments! ⚡',
  hashtags: '#techreview #cinematic #filmmaking #dronephotography #creativelife #4k',
  postDate: 'Oct 12, 2023',
  sentimentScore: 85,
  sentimentLabel: 'Positive',
  musicTitle: 'Midnight City (Remix)',
  musicUses: 'Used in 12.4k Reels',
  tags: ['#techreview', '#filmmaking', '#4kcontent', '#creators', '#cinematic'],
  isTrending: true,
};

// ── Render Dashboard ────────────────────────────────────────────────
function renderDashboard(data) {
  // Profile
  $('profile-avatar').src = data.profilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`;
  $('profile-username').textContent = data.username;
  $('profile-bio').textContent = data.bio || data.fullName || 'Creator';
  $('profile-link').href = data.profileUrl || '#';

  // Total Plays
  animateCountUp($('total-plays'), data.totalPlays);
  $('trending-badge').style.display = data.isTrending ? 'inline-flex' : 'none';

  // Engagement
  const engEl = $('engagement-rate');
  animateCountUp(engEl, data.engagementRate * 10, 1200, (v) => (v / 10).toFixed(1) + '%');
  setTimeout(() => {
    $('engagement-bar').style.width = Math.min(data.engagementRate * 10, 100) + '%';
  }, 200);
  $('engagement-delta').textContent = data.engagementDelta || '';

  // Stats
  animateCountUp($('stat-likes'), data.likes, 1400, formatNumber);
  animateCountUp($('stat-comments'), data.comments, 1400, formatNumber);
  animateCountUp($('stat-shares'), data.shares, 1400, formatNumber);
  animateCountUp($('stat-reach'), data.reach, 1400, formatNumber);

  $('likes-change').textContent = data.likesChange || '+0%';
  $('comments-change').textContent = data.commentsChange || '+0%';
  $('shares-change').textContent = data.sharesChange || 'Stable';
  $('reach-change').textContent = data.reachChange || '+0%';

  // Set change badge classes
  setChangeClass('likes-change', data.likesChange);
  setChangeClass('comments-change', data.commentsChange);
  setChangeClass('shares-change', data.sharesChange);
  setChangeClass('reach-change', data.reachChange);

  // Caption
  const captionParagraphs = (data.caption || '').split('\n').filter(Boolean);
  $('caption-text').innerHTML = captionParagraphs.map(p => `<p style="margin-bottom:12px">${escapeHtml(p)}</p>`).join('');
  $('caption-hashtags').textContent = data.hashtags || '';

  // Meta
  $('post-date').textContent = data.postDate || '—';
  $('sentiment-icon').textContent = data.sentimentScore >= 70 ? '😊' : data.sentimentScore >= 40 ? '😐' : '😞';
  $('sentiment-text').textContent = `${data.sentimentLabel} ${data.sentimentScore}%`;
  $('sentiment-text').className = data.sentimentScore >= 70 ? 'sentiment-positive' : '';

  // Music
  $('music-title').textContent = data.musicTitle || '—';
  $('music-uses').textContent = data.musicUses || '—';

  // Tags
  const tagsList = $('tags-list');
  tagsList.innerHTML = '';
  (data.tags || []).forEach(tag => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = tag;
    tagsList.appendChild(span);
  });

  showSection('dashboard');
}

function setChangeClass(id, value) {
  const el = $(id);
  if (!el) return;
  el.classList.remove('positive', 'neutral', 'negative');
  if (!value || value === 'Stable') el.classList.add('neutral');
  else if (value.startsWith('+')) el.classList.add('positive');
  else if (value.startsWith('-')) el.classList.add('negative');
  else el.classList.add('neutral');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── API Call ─────────────────────────────────────────────────────────
async function analyzeUrl(url) {
  clearError();
  showSection('loading');
  analyzeBtn.disabled = true;

  try {
    const response = await fetch(`${config.BACKEND_URL}${config.ANALYZE_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Server error (${response.status})`);
    }

    const data = await response.json();
    renderDashboard(data);
  } catch (err) {
    console.error('Analyze error:', err);

    // If backend is unreachable, use mock data for demo
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      console.log('Backend unreachable — loading demo data');
      await simulateDelay(2000);
      renderDashboard(MOCK_DATA);
    } else {
      showSection('empty');
      showError(err.message || 'Failed to analyze. Please try again.');
    }
  } finally {
    analyzeBtn.disabled = false;
  }
}

function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Event Listeners ─────────────────────────────────────────────────
analyzeBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (!url) {
    showError('Please paste an Instagram Reel or Post URL.');
    return;
  }
  if (!isValidInstagramUrl(url)) {
    showError('Invalid URL. Please enter a valid Instagram Reel or Post link.');
    return;
  }
  analyzeUrl(url);
});

urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    analyzeBtn.click();
  }
});

// Clear error when user types
urlInput.addEventListener('input', clearError);

// ── Init ────────────────────────────────────────────────────────────
showSection('empty');
console.log('Reel Insight Pro initialized');
