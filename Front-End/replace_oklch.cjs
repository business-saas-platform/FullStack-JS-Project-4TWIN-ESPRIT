const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'styles', 'theme.css');
let css = fs.readFileSync(cssPath, 'utf8');

const replacements = {
  'oklch(0.145 0 0)': '#09090b',
  'oklch(1 0 0)': '#ffffff',
  'oklch(0.985 0 0)': '#fafafa',
  'oklch(0.95 0.0058 264.53)': '#f4f4f5',
  'oklch(0.708 0 0)': '#a1a1aa',
  'oklch(0.646 0.222 41.116)': '#ef4444', 
  'oklch(0.6 0.118 184.704)': '#0ea5e9',
  'oklch(0.398 0.07 227.392)': '#1d4ed8',
  'oklch(0.828 0.189 84.429)': '#f59e0b',
  'oklch(0.769 0.188 70.08)': '#fbbf24',
  'oklch(0.97 0 0)': '#f4f4f5',
  'oklch(0.205 0 0)': '#18181b',
  'oklch(0.922 0 0)': '#e4e4e7',
  'oklch(0.269 0 0)': '#27272a',
  'oklch(0.396 0.141 25.723)': '#991b1b',
  'oklch(0.637 0.237 25.331)': '#f87171',
  'oklch(0.439 0 0)': '#52525b',
  'oklch(0.488 0.243 264.376)': '#3b82f6',
  'oklch(0.696 0.17 162.48)': '#10b981',
  'oklch(0.627 0.265 303.9)': '#d946ef',
  'oklch(0.645 0.246 16.439)': '#f43f5e'
};

for (const [oklch, hex] of Object.entries(replacements)) {
  css = css.split(oklch).join(hex);
}

fs.writeFileSync(cssPath, css);
console.log('Replaced all oklch colors in theme.css with HEX equivalents.');
