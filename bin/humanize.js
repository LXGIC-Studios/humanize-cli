#!/usr/bin/env node

const { analyzeText, scoreText, suggestImprovements, transformText, showHelp, showVersion, showConfig, watchDirectory } = require('../src/index.js');
const fs = require('fs');

const args = process.argv.slice(2);
const command = args[0];

// Handle flags
if (args.includes('--help') || args.includes('-h') || !command) {
  showHelp();
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  showVersion();
  process.exit(0);
}

// Get text input (from args, stdin, or file)
async function getInput() {
  // Check for file input first
  const fileFlag = args.indexOf('--file');
  const fFlag = args.indexOf('-f');
  const fileIndex = fileFlag !== -1 ? fileFlag : fFlag;
  
  if (fileIndex !== -1 && args[fileIndex + 1]) {
    const filePath = args[fileIndex + 1];
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  
  // Get text from remaining args (skip flags and their values)
  const skipNext = new Set();
  const textArgs = [];
  for (let i = 1; i < args.length; i++) {
    if (skipNext.has(i)) continue;
    if (args[i] === '-f' || args[i] === '--file' || 
        args[i] === '-t' || args[i] === '--threshold' ||
        args[i] === '-o' || args[i] === '--output') {
      skipNext.add(i + 1);
      continue;
    }
    if (args[i].startsWith('-')) continue;
    textArgs.push(args[i]);
  }
  
  // Use args as text if provided
  if (textArgs.length > 0) {
    return textArgs.join(' ');
  }
  
  // Check for piped input (only if no text args)
  if (!process.stdin.isTTY) {
    return new Promise((resolve) => {
      let data = '';
      process.stdin.on('data', chunk => data += chunk);
      process.stdin.on('end', () => resolve(data.trim()));
    });
  }
  
  return null;
}

// Parse options
const options = {
  json: args.includes('--json') || args.includes('-j'),
  verbose: args.includes('--verbose') || args.includes('-V'),
  quiet: args.includes('--quiet') || args.includes('-q'),
  api: args.includes('--api') || args.includes('-a'),
};

// Get threshold for watch
function getThreshold() {
  const tIdx = args.indexOf('--threshold');
  const shortIdx = args.indexOf('-t');
  const idx = tIdx !== -1 ? tIdx : shortIdx;
  if (idx !== -1 && args[idx + 1]) {
    return parseInt(args[idx + 1], 10);
  }
  return 70;
}

// Get directory for watch
function getDirectory() {
  for (let i = 1; i < args.length; i++) {
    if (!args[i].startsWith('-') && fs.existsSync(args[i]) && fs.statSync(args[i]).isDirectory()) {
      return args[i];
    }
  }
  return null;
}

async function main() {
  switch (command) {
    case 'analyze':
    case 'a': {
      const text = await getInput();
      if (!text) {
        console.error('Error: No input provided. Use --file, pipe text, or provide text as arguments.');
        process.exit(1);
      }
      analyzeText(text, options);
      break;
    }
      
    case 'score':
    case 's': {
      const text = await getInput();
      if (!text) {
        console.error('Error: No input provided.');
        process.exit(1);
      }
      scoreText(text, options);
      break;
    }
      
    case 'suggest':
    case 'sg': {
      const text = await getInput();
      if (!text) {
        console.error('Error: No input provided.');
        process.exit(1);
      }
      suggestImprovements(text, options);
      break;
    }
      
    case 'transform':
    case 't':
    case 'fix': {
      const text = await getInput();
      if (!text) {
        console.error('Error: No input provided.');
        process.exit(1);
      }
      transformText(text, options);
      break;
    }
    
    case 'watch':
    case 'w': {
      const dir = getDirectory();
      if (!dir) {
        console.error('Error: Please provide a directory to watch.');
        process.exit(1);
      }
      const threshold = getThreshold();
      watchDirectory(dir, threshold, options);
      break;
    }
    
    case 'config':
    case 'c':
      showConfig();
      break;
      
    case 'help':
      showHelp();
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "humanize --help" for usage.');
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
