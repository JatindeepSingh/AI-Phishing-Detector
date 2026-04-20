/**
 * AI Phishing Detection Engine
 * Uses rule-based ML with NLP features + heuristic scoring
 * This is a built-in model that doesn't require external APIs
 */

// ─── PHISHING INDICATORS DATABASE ────────────────────────────────────────────

const PHISHING_KEYWORDS = [
  'verify your account', 'confirm your identity', 'update your information',
  'your account has been suspended', 'unusual activity', 'click here immediately',
  'act now', 'limited time', 'urgent action required', 'your account will be closed',
  'verify now', 'login to confirm', 'security alert', 'account compromised',
  'reset your password immediately', 'validate your account', 'you have won',
  'congratulations you', 'claim your prize', 'wire transfer', 'nigerian prince',
  'inheritance', 'lottery winner', 'free gift', 'risk free', '100% free',
  'guaranteed', 'no obligation', 'apply now', 'you are selected', 'dear customer',
  'dear user', 'dear account holder', 'dear valued member'
];

const SUSPICIOUS_URL_PATTERNS = [
  /paypal.*login/i, /bank.*secure/i, /secure.*login/i, /account.*verify/i,
  /signin.*update/i, /\.ru\//i, /\.tk\//i, /\.xyz\//i, /bit\.ly/i,
  /tinyurl/i, /goo\.gl/i, /ow\.ly/i, /t\.co/i,
  /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP address URLs
  /[a-z0-9]{30,}/, // Very long random subdomains
];

const LEGITIMATE_DOMAINS = [
  'google.com', 'gmail.com', 'microsoft.com', 'apple.com', 'amazon.com',
  'facebook.com', 'twitter.com', 'linkedin.com', 'github.com', 'stackoverflow.com',
  'youtube.com', 'instagram.com', 'wikipedia.org', 'reddit.com', 'paypal.com',
  'ebay.com', 'netflix.com', 'spotify.com', 'dropbox.com', 'adobe.com'
];

const SUSPICIOUS_TLDs = ['.ru', '.tk', '.xyz', '.pw', '.cc', '.top', '.work', '.click', '.gq', '.ml', '.ga', '.cf'];

const HOMOGLYPH_CHARS = {
  'a': ['@', '4', 'α'], 'e': ['3', 'є'], 'i': ['1', 'l', '|'],
  'o': ['0', 'ο', 'ø'], 's': ['5', '$'], 'g': ['9'], 'l': ['1', '|']
};

// ─── FEATURE EXTRACTION ───────────────────────────────────────────────────────

function extractURLFeatures(url) {
  const features = {
    length: url.length,
    hasHTTPS: url.startsWith('https://'),
    hasHTTP: url.startsWith('http://'),
    dotCount: (url.match(/\./g) || []).length,
    hyphenCount: (url.match(/-/g) || []).length,
    hasIPAddress: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url),
    hasAtSymbol: url.includes('@'),
    hasDoubleSlash: url.split('//').length > 2,
    subdomainCount: 0,
    isShortenedURL: false,
    suspiciousKeywordsInURL: 0,
    tldSuspicious: false,
    domainLength: 0,
    hasNumbers: /\d/.test(url),
    specialCharCount: (url.match(/[^a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]/g) || []).length,
    homoglyphSuspicion: false
  };

  try {
    const urlObj = new URL(url.startsWith('http') ? url : 'http://' + url);
    const hostname = urlObj.hostname;
    features.domainLength = hostname.length;
    features.subdomainCount = hostname.split('.').length - 2;

    // Check TLD
    SUSPICIOUS_TLDs.forEach(tld => {
      if (hostname.endsWith(tld)) features.tldSuspicious = true;
    });

    // Check shortened URLs
    const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 't.co', 'is.gd', 'buff.ly'];
    features.isShortenedURL = shorteners.some(s => hostname.includes(s));

    // Phishing keywords in URL
    PHISHING_KEYWORDS.forEach(kw => {
      if (url.toLowerCase().includes(kw.toLowerCase())) features.suspiciousKeywordsInURL++;
    });

    // Suspicious URL patterns
    features.matchesSuspiciousPattern = SUSPICIOUS_URL_PATTERNS.filter(p => p.test(url)).length;

    // Check if domain mimics legitimate domain (typosquatting)
    features.isMimickingLegitDomain = false;
    LEGITIMATE_DOMAINS.forEach(legit => {
      const legitBase = legit.split('.')[0];
      if (hostname.includes(legitBase) && !hostname.endsWith(legit)) {
        features.isMimickingLegitDomain = true;
      }
    });

  } catch (e) {
    features.invalidURL = true;
  }

  return features;
}

function extractEmailFeatures(emailContent) {
  const lower = emailContent.toLowerCase();
  const features = {
    length: emailContent.length,
    phishingKeywordCount: 0,
    urgencyScore: 0,
    hasLinks: (emailContent.match(/https?:\/\//g) || []).length,
    hasSuspiciousLinks: 0,
    grammarScore: 0,
    impersonationAttempt: false,
    hasMismatchedLinks: false,
    hasGenericGreeting: false,
    capsLockRatio: (emailContent.match(/[A-Z]/g) || []).length / emailContent.length,
    exclamationCount: (emailContent.match(/!/g) || []).length,
    hasHTMLContent: emailContent.includes('<html') || emailContent.includes('<a href'),
  };

  // Count phishing keywords
  PHISHING_KEYWORDS.forEach(kw => {
    if (lower.includes(kw.toLowerCase())) {
      features.phishingKeywordCount++;
      // Extra weight for urgency keywords
      if (['urgent', 'immediately', 'now', 'act now', 'limited time'].some(u => kw.includes(u))) {
        features.urgencyScore++;
      }
    }
  });

  // Generic greetings
  const genericGreetings = ['dear customer', 'dear user', 'dear account holder', 'dear valued', 'hello user', 'to whom it may concern'];
  features.hasGenericGreeting = genericGreetings.some(g => lower.includes(g));

  // Impersonation check
  const brands = ['paypal', 'amazon', 'apple', 'microsoft', 'google', 'netflix', 'bank', 'irs', 'fedex', 'ups', 'dhl'];
  features.impersonationAttempt = brands.some(b => lower.includes(b));

  // Extract URLs from email and check them
  const urlRegex = /https?:\/\/[^\s<>"]+/g;
  const urls = emailContent.match(urlRegex) || [];
  urls.forEach(url => {
    const urlFeatures = extractURLFeatures(url);
    if (urlFeatures.tldSuspicious || urlFeatures.hasIPAddress || urlFeatures.isMimickingLegitDomain) {
      features.hasSuspiciousLinks++;
    }
  });

  return features;
}

function extractTextFeatures(text) {
  const lower = text.toLowerCase();
  return {
    length: text.length,
    phishingKeywordCount: PHISHING_KEYWORDS.filter(kw => lower.includes(kw.toLowerCase())).length,
    urgencyWords: ['urgent', 'immediately', 'now', 'expire', 'suspend', 'blocked', 'frozen'].filter(w => lower.includes(w)).length,
    moneyMentions: (text.match(/\$[\d,]+|\d+ dollars?|bitcoin|crypto|wire transfer/gi) || []).length,
    hasURLs: (text.match(/https?:\/\//g) || []).length,
    exclamationCount: (text.match(/!/g) || []).length,
    capsRatio: (text.match(/[A-Z]/g) || []).length / text.length
  };
}

// ─── SCORING ENGINE ───────────────────────────────────────────────────────────

function scoreURL(features) {
  let score = 0;
  const flags = [];

  if (!features.hasHTTPS) { score += 15; flags.push('No HTTPS encryption'); }
  if (features.hasIPAddress) { score += 30; flags.push('Uses raw IP address instead of domain name'); }
  if (features.hasAtSymbol) { score += 25; flags.push('URL contains @ symbol (credential harvesting)'); }
  if (features.hasDoubleSlash) { score += 20; flags.push('URL has double slash redirect'); }
  if (features.isShortenedURL) { score += 20; flags.push('Shortened URL (destination hidden)'); }
  if (features.tldSuspicious) { score += 25; flags.push('Suspicious top-level domain'); }
  if (features.subdomainCount > 2) { score += 15 * (features.subdomainCount - 2); flags.push(`Excessive subdomains (${features.subdomainCount})`); }
  if (features.hyphenCount > 3) { score += 10; flags.push('Excessive hyphens in domain'); }
  if (features.length > 75) { score += 10; flags.push('Unusually long URL'); }
  if (features.isMimickingLegitDomain) { score += 35; flags.push('URL mimics a legitimate brand (typosquatting)'); }
  if (features.matchesSuspiciousPattern > 0) { score += 20 * features.matchesSuspiciousPattern; flags.push('URL matches known phishing patterns'); }
  if (features.suspiciousKeywordsInURL > 0) { score += 10; flags.push('Phishing keywords found in URL'); }
  if (features.invalidURL) { score += 40; flags.push('Invalid or malformed URL'); }
  if (features.domainLength > 30) { score += 10; flags.push('Unusually long domain name'); }
  if (features.specialCharCount > 5) { score += 10; flags.push('Suspicious special characters in URL'); }

  return { score: Math.min(score, 100), flags };
}

function scoreEmail(features) {
  let score = 0;
  const flags = [];

  if (features.phishingKeywordCount > 0) {
    score += Math.min(features.phishingKeywordCount * 8, 40);
    flags.push(`${features.phishingKeywordCount} phishing phrase(s) detected`);
  }
  if (features.urgencyScore > 0) { score += features.urgencyScore * 10; flags.push('Creates false sense of urgency'); }
  if (features.hasGenericGreeting) { score += 15; flags.push('Generic greeting (not personalized)'); }
  if (features.impersonationAttempt) { score += 20; flags.push('Possible brand/organization impersonation'); }
  if (features.hasSuspiciousLinks > 0) { score += features.hasSuspiciousLinks * 20; flags.push(`${features.hasSuspiciousLinks} suspicious link(s) found`); }
  if (features.exclamationCount > 3) { score += 10; flags.push('Excessive use of exclamation marks'); }
  if (features.capsLockRatio > 0.3) { score += 10; flags.push('Excessive use of capital letters'); }
  if (features.hasLinks > 3) { score += 10; flags.push('Multiple links (potential link flooding)'); }

  return { score: Math.min(score, 100), flags };
}

function scoreText(features) {
  let score = 0;
  const flags = [];

  if (features.phishingKeywordCount > 0) {
    score += Math.min(features.phishingKeywordCount * 8, 40);
    flags.push(`${features.phishingKeywordCount} phishing keyword(s) detected`);
  }
  if (features.urgencyWords > 0) { score += features.urgencyWords * 10; flags.push('Urgency language detected'); }
  if (features.moneyMentions > 0) { score += features.moneyMentions * 10; flags.push('Financial manipulation language'); }
  if (features.exclamationCount > 3) { score += 5; flags.push('Excessive exclamation marks'); }
  if (features.capsRatio > 0.3) { score += 10; flags.push('Excessive capitalization'); }
  if (features.hasURLs > 2) { score += 10; flags.push('Multiple URLs present'); }

  return { score: Math.min(score, 100), flags };
}

// ─── VERDICT ENGINE ───────────────────────────────────────────────────────────

function getVerdict(riskScore) {
  if (riskScore >= 60) return 'phishing';
  if (riskScore >= 30) return 'suspicious';
  return 'safe';
}

function getConfidence(riskScore, flagCount) {
  // Confidence increases with clear signals
  const base = Math.abs(riskScore - 50) * 1.5;
  const flagBonus = Math.min(flagCount * 5, 20);
  return Math.min(Math.round(base + flagBonus + 40), 99);
}

// ─── MAIN DETECTION FUNCTION ──────────────────────────────────────────────────

function detectPhishing(inputType, content) {
  let features, scoreResult;

  switch (inputType) {
    case 'url':
      features = extractURLFeatures(content);
      scoreResult = scoreURL(features);
      break;
    case 'email':
      features = extractEmailFeatures(content);
      scoreResult = scoreEmail(features);
      break;
    case 'text':
      features = extractTextFeatures(content);
      scoreResult = scoreText(features);
      break;
    default:
      throw new Error('Invalid input type');
  }

  const riskScore = scoreResult.score;
  const verdict = getVerdict(riskScore);
  const confidence = getConfidence(riskScore, scoreResult.flags.length);

  return {
    verdict,
    confidence,
    riskScore,
    flags: scoreResult.flags,
    details: {
      inputType,
      featuresAnalyzed: Object.keys(features).length,
      analysisMethod: 'ML Heuristic + NLP Pattern Analysis',
      modelVersion: '2.1.0'
    }
  };
}

module.exports = { detectPhishing };