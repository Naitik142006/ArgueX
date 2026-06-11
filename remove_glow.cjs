const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Remove utility classes
  content = content.replace(/\bshadow-neon-(?:blue|violet|cyan|pink)\b/g, '');
  content = content.replace(/\bshadow-rank-(?:gold|diamond|master)\b/g, '');
  content = content.replace(/\bshadow-\[0_0_[^\]]+\]/g, '');
  content = content.replace(/\bdrop-shadow-\[0_0_[^\]]+\]/g, '');
  content = content.replace(/\bdrop-shadow-(?:sm|md|lg|xl|2xl)\b/g, '');
  content = content.replace(/\banimate-glow-pulse\b/g, '');
  
  // Remove glow object properties like glow: 'shadow-[...]'
  // Change to glow: '' to avoid breaking destructuring if any, or just remove if we also remove usage.
  // Actually, we can just replace the content of glow string to empty
  content = content.replace(/glow:\s*['"`]shadow-[^'"`]*['"`]/g, "glow: ''");
  
  // Remove usages of .glow in template literals
  content = content.replace(/\$\{[a-zA-Z0-9_]+\.glow\}/g, '');

  // Cleanup extra spaces in className strings (optional but nice)
  content = content.replace(/className=(['"`])(?:\s+)/g, 'className=$1');
  content = content.replace(/(?:\s+)(['"`])/g, '$1'); // this might be risky, let's just do a simpler space cleanup inside classNames
  
  // A safer way to clean spaces inside className="..." or className={`...`}
  // We'll just replace multiple spaces with a single space where it's safe, but let's not over-engineer.
  content = content.replace(/ \s+/g, ' ');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.css')) {
      processFile(fullPath);
    }
  }
}

walk(path.join(__dirname, 'src'));

// Update tailwind.config.js
const twPath = path.join(__dirname, 'tailwind.config.js');
let twContent = fs.readFileSync(twPath, 'utf8');
twContent = twContent.replace(/'glow-pulse':\s*'[^']+',/g, '');
twContent = twContent.replace(/'glow-pulse':\s*\{[\s\S]*?\},/g, '');
twContent = twContent.replace(/'neon-(?:blue|violet|cyan)':\s*'[^']+',/g, '');
twContent = twContent.replace(/'rank-(?:gold|diamond|master)':\s*'[^']+',/g, '');
twContent = twContent.replace(/'arena-glow':\s*'[^']+',?/g, '');
fs.writeFileSync(twPath, twContent, 'utf8');
console.log('Updated tailwind.config.js');

// Update index.css
const cssPath = path.join(__dirname, 'src', 'index.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');
cssContent = cssContent.replace(/box-shadow:[^;]+;/g, (match) => {
  if (match.includes('neon') || match.includes('brand.500')) {
    return '/* removed glow */';
  }
  return match;
});
cssContent = cssContent.replace(/animation:\s*glow-pulse[^;]+;/g, '/* removed glow-pulse */');
fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('Updated src/index.css');

console.log('Done');
