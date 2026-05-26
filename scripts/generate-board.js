const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const imagesDir = path.join(rootDir, 'images');
const readmePath = path.join(rootDir, 'README.md');
const postsPath = path.join(rootDir, 'posts.json');

const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

// SVG building functions
function createHeader() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="45" viewBox="0 0 800 45" fill="none">
  <defs>
    <style>
      .header-text {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
        font-weight: 700;
        fill: #8b949e;
        letter-spacing: 1.5px;
      }
    </style>
  </defs>
  
  <!-- Header Background with top-rounded corners -->
  <path d="M 0 8 A 8 8 0 0 1 8 0 L 792 0 A 8 8 0 0 1 800 8 L 800 45 L 0 45 Z" fill="#161b22" />
  
  <!-- Header Bottom Border -->
  <line x1="0" y1="44.5" x2="800" y2="44.5" stroke="#30363d" stroke-width="1"/>
  
  <!-- Columns Headers -->
  <text x="40" y="27" class="header-text">🏷️ CATEGORY</text>
  <text x="170" y="27" class="header-text">✍️ RECENT TECHNICAL POSTS</text>
  <text x="710" y="27" class="header-text" text-anchor="middle">📅 DATE</text>
</svg>`;
}

function createRow(post, index, isLast) {
  const bgColors = ["#0d1117", "#161b22"];
  const bgColor = bgColors[index % 2];
  
  const categoryStr = post.category.toUpperCase().substring(0, 12);
  const color = post.color || "#2563eb";

  const pathD = isLast 
    ? `M 0 0 L 800 0 L 800 72 A 8 8 0 0 1 792 80 L 8 80 A 8 8 0 0 1 0 72 Z`
    : `M 0 0 L 800 0 L 800 80 L 0 80 Z`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="80" viewBox="0 0 800 80" fill="none">
  <defs>
    <style>
      .title {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14.5px;
        font-weight: 700;
        fill: #f0f6fc;
        transition: fill 0.2s ease;
      }
      .description {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        fill: #8b949e;
      }
      .date {
        font-family: 'Courier New', Courier, monospace;
        font-size: 13px;
        font-weight: bold;
        fill: #8b949e;
      }
      .badge-text {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 10px;
        font-weight: 800;
        fill: #ffffff;
        letter-spacing: 1px;
      }
      .row-bg {
        fill: ${bgColor};
        transition: fill 0.2s ease;
      }
      .container:hover .row-bg {
        fill: #1c2128;
      }
      .container:hover .title {
        fill: #58a6ff;
      }
    </style>
  </defs>

  <g class="container" cursor="pointer">
    <path class="row-bg" d="${pathD}" />
    
    ${!isLast ? `<line x1="0" y1="79.5" x2="800" y2="79.5" stroke="#21262d" stroke-width="1"/>` : ''}
    
    <rect x="30" y="22" width="110" height="36" rx="8" fill="${color}" />
    <text x="85" y="44" class="badge-text" text-anchor="middle">${categoryStr}</text>
    
    <text x="170" y="37" class="title">${post.title}</text>
    <text x="170" y="58" class="description">${post.subtitle}</text>
    
    <text x="710" y="46" class="date" text-anchor="middle">${post.date}</text>
  </g>
</svg>`;
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// Clean old row SVGs
const existingFiles = fs.readdirSync(imagesDir);
existingFiles.forEach(file => {
  if (file.startsWith('board-row-') && file.endsWith('.svg')) {
    fs.unlinkSync(path.join(imagesDir, file));
  }
});

// Generate Header
fs.writeFileSync(path.join(imagesDir, 'board-header.svg'), createHeader());

// Generate Rows
const readmeLinks = [];
posts.forEach((post, i) => {
  const isLast = i === posts.length - 1;
  const fileName = `board-row-${i}.svg`;
  fs.writeFileSync(path.join(imagesDir, fileName), createRow(post, i, isLast));
  
  readmeLinks.push(`<a href="${post.url}"><img src="./images/${fileName}" width="100%" alt="${post.title}" /></a>`);
});

// Update README
const readmeContent = fs.readFileSync(readmePath, 'utf8');
const startTag = '\n<!-- blog starts -->\n';
const endTag = '\n<!-- blog ends -->\n';

const startIndex = readmeContent.indexOf(startTag);
const endIndex = readmeContent.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
  const before = readmeContent.substring(0, startIndex + startTag.length);
  const after = readmeContent.substring(endIndex);
  
  const newContent = `
<div align="center">
  <img src="./images/board-header.svg" width="100%" alt="Board Header" /><br/>
  ${readmeLinks.join('<br/>\n  ')}
</div>
`;
  
  fs.writeFileSync(readmePath, before + newContent + after);
  console.log('README.md successfully updated!');
} else {
  console.log('Could not find blog tags in README.md');
}
