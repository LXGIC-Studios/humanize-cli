#!/usr/bin/env node

const { analyzeText, scoreText, suggestImprovements, transformText, showHelp, showVersion } = require('../src/index.js');
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
  const flagIndex = args.findIndex(a => a.startsWith('-'));
  const textArgs = flagIndex > 1 ? args.slice(1, flagIndex) : args.slice(1);
  
  // Check for file input
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
  
  // Check for piped input
  if (!process.stdin.isTTY) {
    return new Promise((resolve) => {
      let data = '';
      process.stdin.on('data', chunk => data += chunk);
      process.stdin.on('end', () => resolve(data.trim()));
    });
  }
  
  // Use remaining args as text
  if (textArgs.length > 0) {
    return textArgs.join(' ');
  }
  
  console.error('Error: No input provided. Use --file, pipe text, or provide text as arguments.');
  process.exit(1);
}

// Parse options
const options = {
  json: args.includes('--json') || args.includes('-j'),
  verbose: args.includes('--verbose') || args.includes('-V'),
  quiet: args.includes('--quiet') || args.includes('-q'),
};

async function main() {
  const text = await getInput();
  
  switch (command) {
    case 'analyze':
    case 'a':
      analyzeText(text, options);
      break;
      
    case 'score':
    case 's':
      scoreText(text, options);
      break;
      
    case 'suggest':
    case 'sg':
      suggestImprovements(text, options);
      break;
      
    case 'transform':
    case 't':
      transformText(text, options);
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
