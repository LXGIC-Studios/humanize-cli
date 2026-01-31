// AI vocabulary detection with suggested replacements
const AI_VOCABULARY = {
  // The absolute worst offenders
  'delve into': ['dig into', 'explore', 'look at', 'get into'],
  'delves into': ['digs into', 'explores', 'looks at', 'gets into'],
  'delving into': ['digging into', 'exploring', 'looking at'],
  'delved into': ['dug into', 'explored', 'looked at'],
  'delve': ['explore', 'look at', 'examine'],
  'delves': ['explores', 'looks at', 'examines'],
  'delving': ['exploring', 'looking at', 'examining'],
  'delved': ['explored', 'looked at', 'examined'],
  'leverage': ['use', 'take advantage of', 'work with'],
  'leveraging': ['using', 'taking advantage of', 'working with'],
  'utilize': ['use', 'work with', 'apply'],
  'utilizing': ['using', 'working with', 'applying'],
  'utilization': ['use', 'usage'],
  'comprehensive': ['full', 'complete', 'thorough', 'detailed'],
  'robust': ['strong', 'solid', 'reliable', 'sturdy'],
  'seamless': ['smooth', 'easy', 'simple', 'effortless'],
  'seamlessly': ['smoothly', 'easily', 'naturally'],
  'streamline': ['simplify', 'speed up', 'make easier'],
  'streamlined': ['simplified', 'faster', 'easier'],
  'synergy': ['teamwork', 'cooperation', 'working together'],
  'synergies': ['benefits', 'advantages', 'combinations'],
  'paradigm': ['model', 'approach', 'way of thinking'],
  'paradigm shift': ['big change', 'new approach', 'rethinking'],
  'holistic': ['complete', 'whole', 'overall', 'full picture'],
  'ecosystem': ['system', 'environment', 'network'],
  
  // Common AI patterns
  'it is important to note': ['note that', 'keep in mind', 'worth mentioning'],
  'it is worth noting': ['note that', 'keep in mind', 'interestingly'],
  'in conclusion': ['to wrap up', 'bottom line', 'so basically'],
  'in summary': ['to sum up', 'basically', 'the short version'],
  'furthermore': ['also', 'plus', 'and', 'on top of that'],
  'moreover': ['also', 'plus', 'and', 'besides'],
  'however': ['but', 'though', 'that said'],
  'therefore': ['so', 'which means', 'that means'],
  'thus': ['so', 'which means', 'this way'],
  'hence': ['so', 'that\'s why', 'which is why'],
  'consequently': ['so', 'as a result', 'because of this'],
  'nevertheless': ['still', 'but', 'even so', 'that said'],
  'notwithstanding': ['despite', 'even though', 'regardless'],
  'aforementioned': ['that', 'this', 'earlier', 'mentioned above'],
  
  // Corporate buzzwords
  'stakeholder': ['people involved', 'team', 'partners'],
  'stakeholders': ['people involved', 'teams', 'partners'],
  'actionable': ['useful', 'practical', 'doable'],
  'actionable insights': ['useful tips', 'practical advice', 'what to do'],
  'best practices': ['what works', 'good approaches', 'proven methods'],
  'going forward': ['from now on', 'in the future', 'next'],
  'at the end of the day': ['ultimately', 'when it comes down to it', 'really'],
  'circle back': ['come back to', 'revisit', 'follow up'],
  'touch base': ['check in', 'catch up', 'talk'],
  'low-hanging fruit': ['easy wins', 'quick fixes', 'obvious stuff'],
  'move the needle': ['make a difference', 'have an impact', 'matter'],
  'game-changer': ['big deal', 'major improvement', 'breakthrough'],
  'cutting-edge': ['latest', 'newest', 'advanced', 'modern'],
  'state-of-the-art': ['latest', 'modern', 'advanced'],
  'innovative': ['new', 'creative', 'fresh'],
  'revolutionary': ['new', 'different', 'major'],
  
  // Over-formal phrases
  'in order to': ['to'],
  'due to the fact that': ['because', 'since'],
  'in the event that': ['if'],
  'for the purpose of': ['to', 'for'],
  'with regard to': ['about', 'regarding', 'on'],
  'pertaining to': ['about', 'regarding', 'on'],
  'in light of': ['given', 'considering', 'because of'],
  'in terms of': ['for', 'regarding', 'when it comes to'],
  'on the other hand': ['but', 'then again', 'at the same time'],
  'at this point in time': ['now', 'currently', 'right now'],
  'prior to': ['before'],
  'subsequent to': ['after'],
  'in the near future': ['soon'],
  'at your earliest convenience': ['when you can', 'soon'],
  'do not hesitate to': ['feel free to', 'just'],
  'please be advised': ['just so you know', 'heads up'],
  'I hope this email finds you well': ['hey', 'hi there', ''],
  
  // AI-specific markers
  'as an ai': ['I', ''],
  'as a language model': ['I', ''],
  'i cannot': ['I can\'t', 'I\'m not able to'],
  'i would be happy to': ['I\'d love to', 'sure, I can', 'happy to'],
  'feel free to ask': ['let me know', 'just ask'],
  'great question': ['good question', 'interesting', 'hmm'],
  'excellent question': ['good one', 'that\'s interesting', 'hmm'],
  'certainly': ['sure', 'yeah', 'definitely', 'of course'],
  'absolutely': ['yeah', 'totally', 'for sure', 'definitely'],
};

// Pattern detection rules
const PATTERNS = [
  {
    name: 'perfect_structure',
    description: 'Overly perfect paragraph structure (intro/body/conclusion)',
    detect: (text) => {
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
      if (paragraphs.length >= 3) {
        const first = paragraphs[0].toLowerCase();
        const last = paragraphs[paragraphs.length - 1].toLowerCase();
        const introMarkers = ['in this', 'this article', 'we will', 'let\'s explore', 'today we'];
        const outroMarkers = ['in conclusion', 'to summarize', 'in summary', 'overall', 'to wrap up'];
        return introMarkers.some(m => first.includes(m)) || outroMarkers.some(m => last.includes(m));
      }
      return false;
    }
  },
  {
    name: 'no_contractions',
    description: 'No contractions found (makes text feel formal/robotic)',
    detect: (text) => {
      const contractions = ['don\'t', 'can\'t', 'won\'t', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 
                           'haven\'t', 'hasn\'t', 'hadn\'t', 'couldn\'t', 'wouldn\'t', 'shouldn\'t',
                           'didn\'t', 'doesn\'t', 'i\'m', 'i\'ve', 'i\'ll', 'i\'d', 'you\'re', 
                           'you\'ve', 'you\'ll', 'we\'re', 'we\'ve', 'we\'ll', 'they\'re', 'they\'ve',
                           'that\'s', 'there\'s', 'here\'s', 'what\'s', 'it\'s', 'let\'s'];
      const lower = text.toLowerCase();
      const hasContraction = contractions.some(c => lower.includes(c));
      const wordCount = text.split(/\s+/).length;
      return wordCount > 50 && !hasContraction;
    }
  },
  {
    name: 'uniform_sentences',
    description: 'Sentences are too uniform in length',
    detect: (text) => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim());
      if (sentences.length < 4) return false;
      const lengths = sentences.map(s => s.split(/\s+/).length);
      const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
      const stdDev = Math.sqrt(variance);
      return stdDev < 3; // Low variation = AI-like
    }
  },
  {
    name: 'no_personal_pronouns',
    description: 'Missing personal voice (no I/we/you pronouns)',
    detect: (text) => {
      const wordCount = text.split(/\s+/).length;
      if (wordCount < 30) return false;
      const personalPronouns = /\b(i|i\'m|i\'ve|i\'ll|i\'d|we|we\'re|we\'ve|we\'ll|you|you\'re|you\'ve|my|our|your)\b/gi;
      const matches = text.match(personalPronouns) || [];
      return matches.length < wordCount * 0.01; // Less than 1% personal pronouns
    }
  },
  {
    name: 'list_heavy',
    description: 'Over-reliance on bullet points or numbered lists',
    detect: (text) => {
      const listItems = (text.match(/^[\s]*[-•*]\s|^\s*\d+\.\s/gm) || []).length;
      const paragraphs = text.split(/\n\n+/).length;
      return listItems > paragraphs * 2;
    }
  },
  {
    name: 'hedging_phrases',
    description: 'Excessive hedging and qualifiers',
    detect: (text) => {
      const hedges = ['it seems', 'it appears', 'it is possible', 'may be', 'might be', 'could be',
                      'generally speaking', 'in general', 'typically', 'usually', 'often', 
                      'it is believed', 'some argue', 'many experts', 'research suggests'];
      const lower = text.toLowerCase();
      const count = hedges.filter(h => lower.includes(h)).length;
      return count >= 3;
    }
  },
  {
    name: 'transition_overuse',
    description: 'Overuse of transitional phrases',
    detect: (text) => {
      const transitions = ['firstly', 'secondly', 'thirdly', 'finally', 'additionally', 
                          'furthermore', 'moreover', 'in addition', 'consequently',
                          'as a result', 'therefore', 'thus', 'hence'];
      const lower = text.toLowerCase();
      const count = transitions.filter(t => lower.includes(t)).length;
      return count >= 4;
    }
  },
  {
    name: 'no_opinions',
    description: 'No opinions or personal perspective',
    detect: (text) => {
      const opinionMarkers = ['i think', 'i believe', 'in my opinion', 'i feel', 'honestly',
                              'personally', 'from my experience', 'i\'ve found', 'my take',
                              'here\'s the thing', 'truth is', 'real talk', 'look,'];
      const lower = text.toLowerCase();
      const wordCount = text.split(/\s+/).length;
      return wordCount > 100 && !opinionMarkers.some(m => lower.includes(m));
    }
  },
  {
    name: 'semicolon_overuse',
    description: 'Overuse of semicolons and em-dashes',
    detect: (text) => {
      const semicolons = (text.match(/;/g) || []).length;
      const dashes = (text.match(/—|--/g) || []).length;
      const sentences = text.split(/[.!?]+/).length;
      return (semicolons + dashes) > sentences * 0.3;
    }
  },
];

function analyze(text) {
  const results = {
    aiVocabulary: [],
    patterns: [],
    structure: {
      sentenceVariety: 'unknown',
      paragraphFlow: 'unknown',
      contractions: false,
      personalVoice: false,
    }
  };
  
  // Check for AI vocabulary
  const lowerText = text.toLowerCase();
  for (const [word, alternatives] of Object.entries(AI_VOCABULARY)) {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      results.aiVocabulary.push({ word, alternatives });
    }
  }
  
  // Check patterns
  for (const pattern of PATTERNS) {
    if (pattern.detect(text)) {
      const example = extractExample(text, pattern.name);
      results.patterns.push({
        name: pattern.name,
        description: pattern.description,
        example: example,
      });
    }
  }
  
  // Analyze structure
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  
  results.structure.sentenceVariety = stdDev > 6 ? 'Good' : stdDev > 3 ? 'Fair' : 'Poor (too uniform)';
  
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  results.structure.paragraphFlow = paragraphs.length > 1 ? 
    (paragraphs.some(p => p.length < 100) ? 'Good (varied)' : 'Fair') : 'N/A';
  
  const hasContractions = /\b(don't|can't|won't|isn't|aren't|i'm|i've|you're|we're|it's|that's)\b/i.test(text);
  results.structure.contractions = hasContractions;
  
  const personalPronouns = /\b(i|i'm|i've|we|we're|you|my|our|your)\b/gi;
  const pronounCount = (text.match(personalPronouns) || []).length;
  results.structure.personalVoice = pronounCount > text.split(/\s+/).length * 0.01;
  
  return results;
}

function extractExample(text, patternName) {
  // Try to extract a relevant example from the text
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s);
  
  switch (patternName) {
    case 'uniform_sentences':
      return sentences.slice(0, 2).join('. ') + '.';
    case 'no_contractions':
      // Find a sentence with "do not", "cannot", etc.
      const formal = sentences.find(s => /\b(do not|cannot|will not|is not|are not|does not)\b/i.test(s));
      return formal ? formal.slice(0, 80) + (formal.length > 80 ? '...' : '') : null;
    case 'hedging_phrases':
      const hedge = sentences.find(s => /\b(it seems|it appears|generally|typically)\b/i.test(s));
      return hedge ? hedge.slice(0, 80) + (hedge.length > 80 ? '...' : '') : null;
    default:
      return null;
  }
}

module.exports = { analyze, AI_VOCABULARY, PATTERNS };
