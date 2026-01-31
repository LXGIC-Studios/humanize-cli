const { AI_VOCABULARY, PATTERNS } = require('./patterns.js');

/**
 * Calculate detection risk score (0-100%)
 * Higher = more likely to be flagged as AI
 */
function calculate(text) {
  const components = {
    vocabulary: calculateVocabularyScore(text),
    structure: calculateStructureScore(text),
    patterns: calculatePatternScore(text),
    naturalness: calculateNaturalnessScore(text),
    personality: calculatePersonalityScore(text),
  };
  
  // Weighted average
  const weights = {
    vocabulary: 0.25,
    structure: 0.20,
    patterns: 0.25,
    naturalness: 0.15,
    personality: 0.15,
  };
  
  let overall = 0;
  for (const [key, value] of Object.entries(components)) {
    overall += value * weights[key];
  }
  
  return {
    overall: Math.round(overall),
    components: Object.fromEntries(
      Object.entries(components).map(([k, v]) => [k, Math.round(v)])
    ),
    interpretation: getInterpretation(overall),
  };
}

function calculateVocabularyScore(text) {
  const lowerText = text.toLowerCase();
  const wordCount = text.split(/\s+/).length;
  
  let aiWordCount = 0;
  for (const word of Object.keys(AI_VOCABULARY)) {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lowerText.match(regex) || [];
    aiWordCount += matches.length;
  }
  
  // Score based on density of AI vocabulary
  const density = aiWordCount / wordCount;
  
  // 0 AI words = 0%, 5%+ density = 100%
  return Math.min(100, density * 2000);
}

function calculateStructureScore(text) {
  let score = 0;
  
  // Check sentence uniformity
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  if (sentences.length >= 3) {
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    // Low variance = AI-like
    if (stdDev < 3) score += 40;
    else if (stdDev < 5) score += 20;
  }
  
  // Check paragraph structure
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  if (paragraphs.length >= 3) {
    const first = paragraphs[0].toLowerCase();
    const last = paragraphs[paragraphs.length - 1].toLowerCase();
    
    // Perfect intro/conclusion structure
    if (/^(in this|this article|we will|let's explore|today we)/.test(first)) score += 15;
    if (/(in conclusion|to summarize|in summary|to wrap up)/.test(last)) score += 15;
  }
  
  // Check for overly balanced paragraph lengths
  if (paragraphs.length >= 3) {
    const pLengths = paragraphs.map(p => p.length);
    const pAvg = pLengths.reduce((a, b) => a + b, 0) / pLengths.length;
    const pVariance = pLengths.reduce((sum, len) => sum + Math.pow(len - pAvg, 2), 0) / pLengths.length;
    const pStdDev = Math.sqrt(pVariance);
    
    // All paragraphs similar length = suspicious
    if (pStdDev / pAvg < 0.2) score += 15;
  }
  
  return Math.min(100, score);
}

function calculatePatternScore(text) {
  let score = 0;
  
  for (const pattern of PATTERNS) {
    if (pattern.detect(text)) {
      switch (pattern.name) {
        case 'no_contractions':
          score += 25;
          break;
        case 'uniform_sentences':
          score += 20;
          break;
        case 'no_personal_pronouns':
          score += 15;
          break;
        case 'hedging_phrases':
          score += 10;
          break;
        case 'transition_overuse':
          score += 15;
          break;
        case 'no_opinions':
          score += 15;
          break;
        case 'semicolon_overuse':
          score += 10;
          break;
        case 'perfect_structure':
          score += 15;
          break;
        case 'list_heavy':
          score += 10;
          break;
      }
    }
  }
  
  return Math.min(100, score);
}

function calculateNaturalnessScore(text) {
  let score = 50; // Start neutral
  
  // Contractions = more natural
  const contractions = ['don\'t', 'can\'t', 'won\'t', 'isn\'t', 'aren\'t', 'i\'m', 
                        'i\'ve', 'you\'re', 'we\'re', 'it\'s', 'that\'s', 'there\'s'];
  const lowerText = text.toLowerCase();
  const contractionCount = contractions.filter(c => lowerText.includes(c)).length;
  score -= contractionCount * 5;
  
  // Sentence starters variety
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const starters = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase());
  const uniqueStarters = new Set(starters);
  const starterDiversity = uniqueStarters.size / starters.length;
  if (starterDiversity < 0.5) score += 20; // Same words starting sentences
  
  // Question marks = more conversational
  const questionCount = (text.match(/\?/g) || []).length;
  score -= questionCount * 3;
  
  // Exclamation points (in moderation) = more human
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 0 && exclamationCount < 4) score -= 5;
  
  // Short sentences (under 10 words) = more natural
  const shortSentences = sentences.filter(s => s.split(/\s+/).length < 10).length;
  const shortRatio = shortSentences / sentences.length;
  if (shortRatio > 0.2) score -= 15;
  
  // Fragments or single-word sentences = very human
  const fragments = sentences.filter(s => s.split(/\s+/).length < 4).length;
  if (fragments > 0) score -= fragments * 3;
  
  // Parenthetical asides = human
  const parentheticals = (text.match(/\([^)]+\)/g) || []).length;
  score -= parentheticals * 3;
  
  // Em dashes for mid-thought changes = human (in moderation)
  const emDashes = (text.match(/—/g) || []).length;
  if (emDashes > 0 && emDashes < 4) score -= 5;
  
  return Math.max(0, Math.min(100, score));
}

function calculatePersonalityScore(text) {
  let score = 50; // Start neutral
  const lowerText = text.toLowerCase();
  
  // Personal pronouns
  const personalPronouns = /\b(i|i'm|i've|i'll|we|we're|you|you're|my|our|your)\b/gi;
  const pronounCount = (text.match(personalPronouns) || []).length;
  const wordCount = text.split(/\s+/).length;
  const pronounDensity = pronounCount / wordCount;
  if (pronounDensity > 0.03) score -= 20;
  else if (pronounDensity < 0.01) score += 20;
  
  // Opinion markers
  const opinions = ['i think', 'i believe', 'honestly', 'personally', 'my take', 
                    'from my experience', 'here\'s the thing', 'truth is', 'look,',
                    'real talk', 'to be honest', 'tbh', 'imo', 'imho'];
  const opinionCount = opinions.filter(o => lowerText.includes(o)).length;
  score -= opinionCount * 10;
  
  // Emotional language
  const emotions = ['love', 'hate', 'amazing', 'terrible', 'awesome', 'awful',
                    'excited', 'frustrated', 'annoyed', 'thrilled', 'worried',
                    'honestly', 'seriously', 'literally'];
  const emotionCount = emotions.filter(e => lowerText.includes(e)).length;
  score -= emotionCount * 5;
  
  // Hedging = less personal
  const hedges = ['it seems', 'it appears', 'may be', 'might be', 'could be',
                  'generally speaking', 'it is believed', 'research suggests'];
  const hedgeCount = hedges.filter(h => lowerText.includes(h)).length;
  score += hedgeCount * 5;
  
  // Humor markers
  const humor = ['lol', 'lmao', 'haha', '😂', '🤣', 'funny thing is', 'plot twist'];
  const humorCount = humor.filter(h => lowerText.includes(h)).length;
  score -= humorCount * 10;
  
  // Casual language
  const casual = ['gonna', 'wanna', 'kinda', 'sorta', 'gotta', 'dunno', 'yeah', 'nope', 'yep', 'cool', 'stuff', 'things', 'basically'];
  const casualCount = casual.filter(c => lowerText.includes(c)).length;
  score -= casualCount * 5;
  
  return Math.max(0, Math.min(100, score));
}

function getInterpretation(score) {
  if (score > 80) return 'Very high risk - will likely be flagged by most AI detectors';
  if (score > 60) return 'High risk - likely to be flagged by sensitive detectors';
  if (score > 40) return 'Moderate risk - may trigger some detection tools';
  if (score > 20) return 'Low risk - unlikely to be flagged';
  return 'Very low risk - appears human-written';
}

module.exports = { calculate };
