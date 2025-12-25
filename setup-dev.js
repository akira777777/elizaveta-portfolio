#!/usr/bin/env node

/**
 * Enhanced Development Setup Script
 * Автоматическая настройка окружения разработки
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up enhanced development environment...');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Install dependencies if needed
try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.warn('⚠️ Some dependencies may have failed to install');
}

// Create necessary directories
const directories = ['reports', 'dist', 'temp', '.vscode'];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Create VS Code settings
const vscodeSettings = {
  'editor.formatOnSave': true,
  'editor.codeActionsOnSave': {
    'source.fixAll.eslint': true,
    'source.fixAll.stylelint': true
  },
  'eslint.validate': ['javascript', 'javascriptreact'],
  'css.validate': false,
  'scss.validate': false,
  'stylelint.validate': ['css', 'scss'],
  'emmet.includeLanguages': {
    javascript: 'jsx'
  }
};

fs.writeFileSync(
  '.vscode/settings.json',
  JSON.stringify(vscodeSettings, null, 2)
);
console.log('⚙️ VS Code settings configured');

// Create launch configuration for debugging
const launchConfig = {
  version: '0.2.0',
  configurations: [
    {
      name: 'Launch Chrome',
      request: 'launch',
      type: 'chrome',
      url: 'http://localhost:3000',
      webRoot: '${workspaceFolder}',
      sourceMaps: true
    }
  ]
};

fs.writeFileSync('.vscode/launch.json', JSON.stringify(launchConfig, null, 2));
console.log('🐛 Debug configuration created');

// Create development tasks
const tasks = {
  version: '2.0.0',
  tasks: [
    {
      label: 'Start Dev Server',
      type: 'shell',
      command: 'npm run dev',
      group: {
        kind: 'build',
        isDefault: true
      },
      isBackground: true,
      problemMatcher: []
    },
    {
      label: 'Lint and Format',
      type: 'shell',
      command: 'npm run precommit',
      group: 'build',
      problemMatcher: ['$eslint-stylish']
    },
    {
      label: 'Run Tests',
      type: 'shell',
      command: 'npm test',
      group: 'test',
      problemMatcher: []
    }
  ]
};

fs.writeFileSync('.vscode/tasks.json', JSON.stringify(tasks, null, 2));
console.log('📋 VS Code tasks configured');

// Create environment file template
const envTemplate = `# Environment Configuration
NODE_ENV=development
PORT=3000

# Analytics (optional)
GA_TRACKING_ID=

# Performance monitoring
PERFORMANCE_MONITORING=true
MEMORY_THRESHOLD=50

# Development flags
DEBUG_MODE=true
VERBOSE_LOGGING=false
`;

if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', envTemplate);
  console.log('🌍 Environment template created');
}

// Create .gitignore additions
const gitignoreAdditions = `
# Development
.env
.env.local
.env.development
.env.production

# Generated files
dist/
temp/
reports/
.cache/

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
`;

const gitignorePath = '.gitignore';
let gitignoreContent = '';

if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
}

if (!gitignoreContent.includes('# Development')) {
  fs.appendFileSync(gitignorePath, gitignoreAdditions);
  console.log('📝 Updated .gitignore');
}

// Create development documentation
const devDocs = `# Development Guide

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open http://localhost:3000

## Available Scripts

- \`npm run dev\` - Start development server with live reload
- \`npm run build\` - Build for production
- \`npm run lint\` - Lint JavaScript files
- \`npm run lint:css\` - Lint CSS files
- \`npm run format\` - Format all files with Prettier
- \`npm run test\` - Run Playwright tests
- \`npm run lighthouse\` - Run Lighthouse audit
- \`npm run precommit\` - Run all checks before commit

## Code Quality

This project uses:
- ESLint for JavaScript linting
- Stylelint for CSS linting
- Prettier for code formatting

All checks run automatically on save in VS Code.

## Performance Monitoring

The project includes built-in performance monitoring:
- Core Web Vitals tracking
- Memory usage monitoring
- Resource loading analysis
- Automatic reports in console and localStorage

## Testing

Tests are written with Playwright and can be run with:
\`\`\`bash
npm test
npm run test:ui  # Interactive mode
\`\`\`

## Debugging

Use VS Code's built-in debugger with the "Launch Chrome" configuration
to debug JavaScript in the browser with source maps.
`;

fs.writeFileSync('DEVELOPMENT.md', devDocs);
console.log('📚 Development documentation created');

// Validate setup
console.log('\n🔍 Validating setup...');

const validations = [
  { file: 'package.json', required: true },
  { file: '.eslintrc.js', required: true },
  { file: '.stylelintrc.js', required: true },
  { file: '.prettierrc', required: true },
  { file: 'modules/core.js', required: true },
  { file: 'modules/performance.js', required: true },
  { file: 'sw.js', required: true }
];

let allValid = true;

validations.forEach(({ file, required }) => {
  const exists = fs.existsSync(file);
  const status = exists ? '✅' : required ? '❌' : '⚠️';
  console.log(`${status} ${file}`);

  if (required && !exists) {
    allValid = false;
  }
});

if (allValid) {
  console.log('\n🎉 Setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Run "npm run dev" to start development server');
  console.log('2. Open http://localhost:3000');
  console.log('3. Start coding! 🚀');
} else {
  console.log('\n⚠️ Setup completed with warnings');
  console.log('Please check missing required files above');
}

// Performance tip
console.log(
  '\n💡 Pro tip: Use Ctrl+Shift+P in VS Code and search for "Tasks: Run Task" to quickly access development commands'
);
