#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SKIP_PATTERNS = ['node_modules', '.git', 'build', 'coverage', 'instrumented', 'public', '.react-router'];
const stats = { filesProcessed: 0, filesModified: 0, replacements: 0 };

function processFile(filePath) {
  stats.filesProcessed++;
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let changed = false;

  // Rule 1: @remix-run/react -> react-router or react-router/dom
  const reactImportRegex = /import\s+(type\s+)?{([^}]+)}\s+from\s+["']@remix-run\/react["']/g;
  modified = modified.replace(reactImportRegex, (match, typeKeyword, imports) => {
    const domSpecific = /\b(Link|NavLink|Form|useFetcher|useNavigate|useSearchParams)\b/;
    const target = domSpecific.test(imports) ? 'react-router/dom' : 'react-router';
    changed = true;
    stats.replacements++;
    return `import ${typeKeyword || ''}{${imports}} from "${target}"`;
  });

  // Rule 2: Keep Session/SessionData/Cookie from @remix-run/node, move others to react-router
  const nodeTypeRegex = /import\s+type\s+{([^}]+)}\s+from\s+["']@remix-run\/node["']/g;
  modified = modified.replace(nodeTypeRegex, (match, imports) => {
    const serverTypes = /\b(Session|SessionData|Cookie|AppLoadContext|UploadHandler|createCookie)\b/;
    if (serverTypes.test(imports)) {
      return match; // Keep as-is
    }
    changed = true;
    stats.replacements++;
    return `import type {${imports}} from "react-router"`;
  });

  const nodeValueRegex = /import\s+{([^}]+)}\s+from\s+["']@remix-run\/node["']/g;
  modified = modified.replace(nodeValueRegex, (match, imports) => {
    const serverAPIs = /\b(unstable_createMemoryUploadHandler|unstable_parseMultipartFormData|createCookie|createCookieSessionStorage|createSession)\b/;
    if (serverAPIs.test(imports)) {
      return match; // Keep as-is
    }
    changed = true;
    stats.replacements++;
    return `import {${imports}} from "react-router"`;
  });

  if (changed) {
    stats.filesModified++;
    if (process.argv.includes('--apply')) {
      fs.writeFileSync(filePath, modified, 'utf8');
      console.log(`✓ ${filePath}`);
    } else {
      console.log(`Would modify: ${filePath}`);
    }
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (SKIP_PATTERNS.some(p => entry.name.includes(p))) continue;
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      processFile(fullPath);
    }
  }
}

console.log('🚀 Migrating imports from Remix v2 to React Router v7\n');
if (!process.argv.includes('--apply')) {
  console.log('DRY RUN - use --apply to make changes\n');
}

processDirectory(path.join(process.cwd(), 'app'));

console.log(`\n📊 Summary: ${stats.filesProcessed} processed, ${stats.filesModified} modified, ${stats.replacements} replacements`);
if (!process.argv.includes('--apply') && stats.filesModified > 0) {
  console.log('Run with --apply to apply changes');
}
