const patterns = require('./patterns.js');
const scoring = require('./scoring.js');
const suggestions = require('./suggestions.js');
const pkg = require('../package.json');

// Color codes for terminal output
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function analyzeText(text, options = {}) {
  const results = patterns.analyze(text);
  
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return results;
  }
  
  console.log(`\n${c.bold}${c.cyan}═══ TEXT ANALYSIS ═══${c.reset}\n`);
  
  // Word count and basic stats
  const wordCount = text.split(/\s+/).filter(w => w).length;
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim()).length;
  console.log(`${c.dim}Words: ${wordCount} | Sentences: ${sentenceCount} | Avg words/sentence: ${(wordCount / sentenceCount).toFixed(1)}${c.reset}\n`);
  
  // AI vocabulary detected
  if (results.aiVocabulary.length > 0) {
    console.log(`${c.red}${c.bold}⚠ AI Vocabulary Detected (${results.aiVocabulary.length})${c.reset}`);
    results.aiVocabulary.forEach(v => {
      console.log(`  ${c.red}•${c.reset} "${v.word}" → ${c.green}try: ${v.alternatives.join(', ')}${c.reset}`);
    });
    console.log();
  }
  
  // Pattern issues
  if (results.patterns.length > 0) {
    console.log(`${c.yellow}${c.bold}⚠ Pattern Issues (${results.patterns.length})${c.reset}`);
    results.patterns.forEach(p => {
      console.log(`  ${c.yellow}•${c.reset} ${p.description}`);
      if (p.example) console.log(`    ${c.dim}Example: "${p.example}"${c.reset}`);
    });
    console.log();
  }
  
  // Structure analysis
  console.log(`${c.blue}${c.bold}Structure Analysis${c.reset}`);
  console.log(`  ${c.dim}Sentence variety:${c.reset} ${results.structure.sentenceVariety}`);
  console.log(`  ${c.dim}Paragraph flow:${c.reset} ${results.structure.paragraphFlow}`);
  console.log(`  ${c.dim}Contractions:${c.reset} ${results.structure.contractions ? `${c.green}✓ Found` : `${c.red}✗ Missing`}${c.reset}`);
  console.log(`  ${c.dim}Personal voice:${c.reset} ${results.structure.personalVoice ? `${c.green}✓ Present` : `${c.yellow}⚠ Weak`}${c.reset}`);
  console.log();
  
  return results;
}

function scoreText(text, options = {}) {
  const score = scoring.calculate(text);
  
  if (options.json) {
    console.log(JSON.stringify(score, null, 2));
    return score;
  }
  
  console.log(`\n${c.bold}${c.cyan}═══ DETECTION RISK SCORE ═══${c.reset}\n`);
  
  // Main score with color based on risk
  const riskColor = score.overall > 70 ? c.red : score.overall > 40 ? c.yellow : c.green;
  const riskLabel = score.overall > 70 ? 'HIGH RISK' : score.overall > 40 ? 'MODERATE RISK' : 'LOW RISK';
  
  console.log(`${c.bold}Overall Risk: ${riskColor}${score.overall}%${c.reset} ${c.dim}(${riskLabel})${c.reset}`);
  console.log();
  
  // Component scores
  console.log(`${c.bold}Component Breakdown:${c.reset}`);
  Object.entries(score.components).forEach(([key, value]) => {
    const bar = '█'.repeat(Math.floor(value / 10)) + '░'.repeat(10 - Math.floor(value / 10));
    const barColor = value > 70 ? c.red : value > 40 ? c.yellow : c.green;
    console.log(`  ${key.padEnd(20)} ${barColor}${bar}${c.reset} ${value}%`);
  });
  console.log();
  
  // Interpretation
  console.log(`${c.dim}Interpretation:${c.reset}`);
  if (score.overall > 70) {
    console.log(`  ${c.red}This text is likely to be flagged by AI detectors.${c.reset}`);
    console.log(`  ${c.dim}Run "humanize suggest" for improvement recommendations.${c.reset}`);
  } else if (score.overall > 40) {
    console.log(`  ${c.yellow}This text may trigger some AI detectors.${c.reset}`);
    console.log(`  ${c.dim}Consider making some adjustments to reduce risk.${c.reset}`);
  } else {
    console.log(`  ${c.green}This text appears human-like and should pass most detectors.${c.reset}`);
  }
  console.log();
  
  return score;
}

function suggestImprovements(text, options = {}) {
  const sug = suggestions.generate(text);
  
  if (options.json) {
    console.log(JSON.stringify(sug, null, 2));
    return sug;
  }
  
  console.log(`\n${c.bold}${c.cyan}═══ IMPROVEMENT SUGGESTIONS ═══${c.reset}\n`);
  
  // Priority fixes
  if (sug.priority.length > 0) {
    console.log(`${c.red}${c.bold}🔴 Priority Fixes${c.reset}`);
    sug.priority.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.issue}`);
      console.log(`     ${c.green}→ ${s.fix}${c.reset}`);
      if (s.example) {
        console.log(`     ${c.dim}Before: "${s.example.before}"${c.reset}`);
        console.log(`     ${c.green}After:  "${s.example.after}"${c.reset}`);
      }
      console.log();
    });
  }
  
  // Recommended improvements
  if (sug.recommended.length > 0) {
    console.log(`${c.yellow}${c.bold}🟡 Recommended Improvements${c.reset}`);
    sug.recommended.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.issue}`);
      console.log(`     ${c.green}→ ${s.fix}${c.reset}`);
    });
    console.log();
  }
  
  // Optional polish
  if (sug.optional.length > 0) {
    console.log(`${c.green}${c.bold}🟢 Optional Polish${c.reset}`);
    sug.optional.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.suggestion}`);
    });
    console.log();
  }
  
  // Quick wins summary
  if (sug.quickWins.length > 0) {
    console.log(`${c.magenta}${c.bold}⚡ Quick Wins (copy-paste fixes)${c.reset}`);
    sug.quickWins.forEach(w => {
      console.log(`  "${w.find}" → "${w.replace}"`);
    });
    console.log();
  }
  
  return sug;
}

function transformText(text, options = {}) {
  const result = suggestions.transform(text);
  
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return result;
  }
  
  console.log(`\n${c.bold}${c.cyan}═══ TRANSFORMED TEXT ═══${c.reset}\n`);
  console.log(result.text);
  console.log();
  
  if (result.changes.length > 0 && options.verbose) {
    console.log(`${c.dim}Changes made (${result.changes.length}):${c.reset}`);
    result.changes.forEach(ch => {
      console.log(`  ${c.dim}• ${ch}${c.reset}`);
    });
    console.log();
  }
  
  // Show before/after score
  const beforeScore = scoring.calculate(text).overall;
  const afterScore = scoring.calculate(result.text).overall;
  const improvement = beforeScore - afterScore;
  
  console.log(`${c.dim}Risk score: ${beforeScore}% → ${afterScore}%${c.reset} ${improvement > 0 ? c.green + `(↓${improvement}% improvement)` : ''}${c.reset}`);
  console.log();
  
  return result;
}

function showHelp() {
  console.log(`
${c.bold}${c.cyan}humanize${c.reset} - Analyze and humanize AI-generated text

${c.bold}USAGE${c.reset}
  humanize <command> [text] [options]
  cat file.txt | humanize <command>
  humanize <command> --file input.txt

${c.bold}COMMANDS${c.reset}
  analyze, a     Detect AI markers and patterns in text
  score, s       Calculate detection risk score (0-100%)
  suggest, sg    Get actionable improvement suggestions
  transform, t   Apply automatic humanization fixes
  watch, w       Watch directory for changes and analyze
  config, c      Show configuration and API status
  help           Show this help message

${c.bold}OPTIONS${c.reset}
  -f, --file       Read input from file
  -j, --json       Output results as JSON
  -V, --verbose    Show detailed output
  -q, --quiet      Minimal output
  -a, --api        Include API checks (GPTZero/Originality.ai)
  -t, --threshold  Alert threshold for watch mode (default: 70)
  -h, --help       Show help
  -v, --version    Show version

${c.bold}EXAMPLES${c.reset}
  ${c.dim}# Analyze text directly${c.reset}
  humanize analyze "This comprehensive solution leverages cutting-edge technology."

  ${c.dim}# Score a file${c.reset}
  humanize score --file article.txt

  ${c.dim}# Pipe from clipboard (macOS)${c.reset}
  pbpaste | humanize suggest

  ${c.dim}# Transform and copy result${c.reset}
  humanize transform --file draft.txt | pbcopy

  ${c.dim}# Watch directory for high-risk content${c.reset}
  humanize watch ./content --threshold 60

  ${c.dim}# Check with API integrations${c.reset}
  humanize analyze --api --file article.txt

${c.bold}WHAT IT DETECTS${c.reset}
  • AI vocabulary (delve, leverage, comprehensive, seamless...)
  • Unnatural patterns (perfect structure, no contractions)
  • Low sentence variety and uniform rhythm
  • Missing personal voice and opinions
  • Over-formal or corporate tone

${c.bold}API INTEGRATION${c.reset}
  Set environment variables to enable API checks:
  ${c.dim}export GPTZERO_API_KEY="your-key"${c.reset}
  ${c.dim}export ORIGINALITY_API_KEY="your-key"${c.reset}

${c.dim}Built by LXGIC Studios | https://github.com/lxgicstudios/humanize-cli${c.reset}
`);
}

function showVersion() {
  console.log(`humanize v${pkg.version}`);
}

function showConfig() {
  const { APIAnalyzer } = require('./api.js');
  const api = new APIAnalyzer();
  
  console.log(`\n${c.bold}${c.cyan}═══ HUMANIZE CONFIGURATION ═══${c.reset}\n`);
  
  console.log(`${c.bold}API Integration:${c.reset}`);
  console.log(`  GPTZero API:       ${process.env.GPTZERO_API_KEY ? c.green + '✓ Configured' : c.dim + '✗ Not configured'}${c.reset}`);
  console.log(`  Originality.ai:    ${process.env.ORIGINALITY_API_KEY ? c.green + '✓ Configured' : c.dim + '✗ Not configured'}${c.reset}`);
  console.log();
  
  console.log(`${c.bold}Detection Settings:${c.reset}`);
  console.log(`  AI Vocabulary:     90+ words and phrases`);
  console.log(`  Pattern Detectors: 9 structural patterns`);
  console.log(`  Scoring:           5-component weighted average`);
  console.log();
  
  console.log(`${c.bold}Supported Input:${c.reset}`);
  console.log(`  File types:        .txt, .md, .js, .ts, .py, .html, .css, .json`);
  console.log(`  Stdin:             Pipe text directly`);
  console.log(`  Arguments:         Pass text as CLI args`);
  console.log();
  
  if (!api.hasApiKeys()) {
    console.log(`${c.yellow}💡 To enable API-based detection:${c.reset}`);
    console.log(`${c.dim}   export GPTZERO_API_KEY="your-key-here"${c.reset}`);
    console.log(`${c.dim}   export ORIGINALITY_API_KEY="your-key-here"${c.reset}`);
    console.log();
  }
}

function watchDirectory(dir, threshold = 70, options = {}) {
  const fs = require('fs');
  const path = require('path');
  
  console.log(`\n${c.bold}${c.cyan}═══ WATCH MODE ═══${c.reset}\n`);
  console.log(`${c.dim}Directory:${c.reset} ${dir}`);
  console.log(`${c.dim}Threshold:${c.reset} ${threshold}%`);
  console.log(`${c.dim}Press Ctrl+C to stop${c.reset}\n`);
  
  const supportedExtensions = ['.txt', '.md', '.js', '.ts', '.py', '.html', '.css'];
  let fileCount = 0;
  
  function analyzeFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (!supportedExtensions.includes(ext)) return;
    
    try {
      const text = fs.readFileSync(filePath, 'utf-8');
      if (text.trim().length < 50) return; // Skip tiny files
      
      const score = scoring.calculate(text);
      fileCount++;
      
      const relPath = path.relative(dir, filePath);
      
      if (score.overall >= threshold) {
        console.log(`${c.red}⚠ HIGH RISK${c.reset} ${relPath} ${c.red}${score.overall}%${c.reset}`);
        
        // Show quick issues
        const analysis = patterns.analyze(text);
        if (analysis.aiVocabulary.length > 0) {
          console.log(`  ${c.dim}AI words: ${analysis.aiVocabulary.slice(0, 3).map(v => v.word).join(', ')}${c.reset}`);
        }
        console.log();
      } else if (!options.quiet) {
        console.log(`${c.green}✓${c.reset} ${relPath} ${c.green}${score.overall}%${c.reset}`);
      }
    } catch (err) {
      if (!options.quiet) {
        console.log(`${c.red}✗${c.reset} ${path.relative(dir, filePath)} ${c.dim}(${err.message})${c.reset}`);
      }
    }
  }
  
  function walkDir(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walkDir(fullPath);
        }
      } else {
        analyzeFile(fullPath);
      }
    }
  }
  
  // Initial scan
  console.log(`${c.dim}Scanning...${c.reset}\n`);
  walkDir(dir);
  console.log(`\n${c.dim}Initial scan complete. Analyzed ${fileCount} files.${c.reset}`);
  
  // Watch for changes
  console.log(`${c.dim}Watching for changes...${c.reset}\n`);
  
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    const fullPath = path.join(dir, filename);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      analyzeFile(fullPath);
    }
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log(`\n\n${c.green}Watch session ended. Analyzed ${fileCount} files.${c.reset}`);
    process.exit(0);
  });
}

module.exports = {
  analyzeText,
  scoreText,
  suggestImprovements,
  transformText,
  showHelp,
  showVersion,
  showConfig,
  watchDirectory,
};
