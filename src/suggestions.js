const { AI_VOCABULARY, PATTERNS } = require('./patterns.js');
const { calculate } = require('./scoring.js');

/**
 * Generate improvement suggestions for text
 */
function generate(text) {
  const results = {
    priority: [],
    recommended: [],
    optional: [],
    quickWins: [],
  };
  
  const lowerText = text.toLowerCase();
  const wordCount = text.split(/\s+/).length;
  
  // Check for AI vocabulary (priority fixes)
  for (const [word, alternatives] of Object.entries(AI_VOCABULARY)) {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(text)) {
      results.priority.push({
        issue: `AI vocabulary detected: "${word}"`,
        fix: `Replace with: ${alternatives.slice(0, 3).join(', ')}`,
        example: findAndReplace(text, word, alternatives[0]),
      });
      results.quickWins.push({ find: word, replace: alternatives[0] });
    }
  }
  
  // Check for missing contractions
  const noContractionPairs = [
    { formal: 'do not', contraction: "don't" },
    { formal: 'does not', contraction: "doesn't" },
    { formal: 'did not', contraction: "didn't" },
    { formal: 'cannot', contraction: "can't" },
    { formal: 'will not', contraction: "won't" },
    { formal: 'would not', contraction: "wouldn't" },
    { formal: 'could not', contraction: "couldn't" },
    { formal: 'should not', contraction: "shouldn't" },
    { formal: 'is not', contraction: "isn't" },
    { formal: 'are not', contraction: "aren't" },
    { formal: 'was not', contraction: "wasn't" },
    { formal: 'were not', contraction: "weren't" },
    { formal: 'have not', contraction: "haven't" },
    { formal: 'has not', contraction: "hasn't" },
    { formal: 'had not', contraction: "hadn't" },
    { formal: 'I am', contraction: "I'm" },
    { formal: 'I have', contraction: "I've" },
    { formal: 'I will', contraction: "I'll" },
    { formal: 'I would', contraction: "I'd" },
    { formal: 'you are', contraction: "you're" },
    { formal: 'you have', contraction: "you've" },
    { formal: 'we are', contraction: "we're" },
    { formal: 'we have', contraction: "we've" },
    { formal: 'they are', contraction: "they're" },
    { formal: 'it is', contraction: "it's" },
    { formal: 'that is', contraction: "that's" },
    { formal: 'there is', contraction: "there's" },
    { formal: 'what is', contraction: "what's" },
    { formal: 'let us', contraction: "let's" },
  ];
  
  for (const pair of noContractionPairs) {
    const regex = new RegExp(`\\b${pair.formal}\\b`, 'gi');
    if (regex.test(text)) {
      results.recommended.push({
        issue: `Formal phrase: "${pair.formal}"`,
        fix: `Use contraction: "${pair.contraction}"`,
      });
      results.quickWins.push({ find: pair.formal, replace: pair.contraction });
    }
  }
  
  // Check patterns and suggest fixes
  for (const pattern of PATTERNS) {
    if (pattern.detect(text)) {
      switch (pattern.name) {
        case 'uniform_sentences':
          results.priority.push({
            issue: 'Sentence lengths are too uniform',
            fix: 'Vary sentence length. Mix short punchy sentences with longer explanatory ones.',
            example: {
              before: 'The software provides excellent features. Users can access many tools. The interface is very intuitive.',
              after: 'The software is packed with features. Seriously. Users get access to tons of tools, and the interface? Dead simple.',
            },
          });
          break;
          
        case 'no_personal_pronouns':
          results.recommended.push({
            issue: 'Missing personal voice',
            fix: 'Add "I", "we", "you" to create connection. Share opinions and perspective.',
          });
          break;
          
        case 'no_opinions':
          results.priority.push({
            issue: 'No opinions or personal perspective',
            fix: 'Add phrases like "I think", "honestly", "here\'s the thing" to inject personality.',
            example: {
              before: 'This approach has several benefits.',
              after: 'Here\'s the thing - this approach actually works. I\'ve tried others. This one sticks.',
            },
          });
          break;
          
        case 'hedging_phrases':
          results.recommended.push({
            issue: 'Too much hedging and qualifiers',
            fix: 'Be more direct. Replace "it seems that" with confident statements.',
          });
          break;
          
        case 'transition_overuse':
          results.recommended.push({
            issue: 'Overuse of formal transitions',
            fix: 'Replace "furthermore" with "also" or "plus". Cut "moreover" entirely.',
          });
          break;
          
        case 'perfect_structure':
          results.recommended.push({
            issue: 'Overly perfect structure',
            fix: 'Break the mold. Start with a story. End with a question. Skip the formal intro.',
          });
          break;
          
        case 'semicolon_overuse':
          results.optional.push({
            suggestion: 'Consider replacing semicolons with periods or "and"',
          });
          break;
          
        case 'no_contractions':
          results.priority.push({
            issue: 'No contractions found - text sounds robotic',
            fix: 'Use contractions! "Do not" → "don\'t", "cannot" → "can\'t"',
            example: {
              before: 'You do not need to worry. It is not complicated.',
              after: 'You don\'t need to worry. It\'s not complicated.',
            },
          });
          break;
      }
    }
  }
  
  // General improvements
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  
  // Check for question engagement
  const hasQuestions = text.includes('?');
  if (!hasQuestions && wordCount > 100) {
    results.optional.push({
      suggestion: 'Add a rhetorical question to engage readers',
    });
  }
  
  // Check for varied sentence starters
  const starters = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase());
  const uniqueRatio = new Set(starters).size / starters.length;
  if (uniqueRatio < 0.6 && sentences.length > 5) {
    results.optional.push({
      suggestion: 'Vary your sentence starters - many begin with the same word',
    });
  }
  
  // Limit quickWins to avoid overwhelming
  results.quickWins = results.quickWins.slice(0, 10);
  
  return results;
}

function findAndReplace(text, word, replacement) {
  const regex = new RegExp(`\\b${word}\\b`, 'i');
  const match = text.match(regex);
  if (!match) return null;
  
  // Find the sentence containing the word
  const sentences = text.split(/(?<=[.!?])\s+/);
  const sentence = sentences.find(s => regex.test(s));
  if (!sentence) return null;
  
  return {
    before: sentence.slice(0, 60) + (sentence.length > 60 ? '...' : ''),
    after: sentence.replace(regex, replacement).slice(0, 60) + (sentence.length > 60 ? '...' : ''),
  };
}

/**
 * Apply automatic transformations to humanize text
 */
function transform(text) {
  let result = text;
  const changes = [];
  
  // Replace AI vocabulary (sort by length, longest first to avoid partial matches)
  const sortedVocab = Object.entries(AI_VOCABULARY)
    .sort((a, b) => b[0].length - a[0].length);
    
  for (const [word, alternatives] of sortedVocab) {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(result)) {
      const replacement = alternatives[0];
      result = result.replace(regex, replacement);
      changes.push(`"${word}" → "${replacement}"`);
    }
  }
  
  // Add contractions
  const contractionMap = {
    'do not': "don't",
    'does not': "doesn't",
    'did not': "didn't",
    'cannot': "can't",
    'can not': "can't",
    'will not': "won't",
    'would not': "wouldn't",
    'could not': "couldn't",
    'should not': "shouldn't",
    'is not': "isn't",
    'are not': "aren't",
    'was not': "wasn't",
    'were not': "weren't",
    'have not': "haven't",
    'has not': "hasn't",
    'had not': "hadn't",
    'it is': "it's",
    'that is': "that's",
    'there is': "there's",
    'what is': "what's",
    'let us': "let's",
  };
  
  for (const [formal, contraction] of Object.entries(contractionMap)) {
    const regex = new RegExp(`\\b${formal}\\b`, 'gi');
    if (regex.test(result)) {
      result = result.replace(regex, contraction);
      changes.push(`"${formal}" → "${contraction}"`);
    }
  }
  
  // Remove filler phrases
  const fillers = [
    { find: /\bIt is important to note that\b/gi, replace: '' },
    { find: /\bIt is worth noting that\b/gi, replace: '' },
    { find: /\bIn order to\b/gi, replace: 'To' },
    { find: /\bDue to the fact that\b/gi, replace: 'Because' },
    { find: /\bIn the event that\b/gi, replace: 'If' },
    { find: /\bFor the purpose of\b/gi, replace: 'To' },
    { find: /\bAt this point in time\b/gi, replace: 'Now' },
    { find: /\bPrior to\b/gi, replace: 'Before' },
    { find: /\bSubsequent to\b/gi, replace: 'After' },
  ];
  
  for (const filler of fillers) {
    if (filler.find.test(result)) {
      const before = result;
      result = result.replace(filler.find, filler.replace);
      if (result !== before) {
        changes.push(`Removed filler phrase`);
      }
    }
  }
  
  // Clean up double spaces
  result = result.replace(/\s{2,}/g, ' ').trim();
  
  // Clean up sentence start after removed fillers
  result = result.replace(/\.\s+,/g, '.');
  result = result.replace(/\s+\./g, '.');
  
  return {
    text: result,
    changes,
    originalLength: text.length,
    newLength: result.length,
  };
}

module.exports = { generate, transform };
