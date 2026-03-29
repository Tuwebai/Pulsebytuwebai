import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rulesPath = path.join(root, 'scripts', 'copy-accent-rules.json');
const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

const includeRoots = [
  path.join(root, 'src', 'features'),
  path.join(root, 'src', 'core'),
  path.join(root, 'src', 'components'),
  path.join(root, 'src', 'pages'),
  path.join(root, 'public')
];

const exts = new Set(['.tsx', '.ts', '.json']);
const warnings = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (!exts.has(path.extname(entry.name))) return [];
    return [fullPath];
  });
}

function shouldCheckLiteral(value) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') || trimmed.startsWith('@/') || trimmed.startsWith('./')) return false;
  if (trimmed.includes('://')) return false;
  if (trimmed.includes('${')) return false;
  if (/[{}\[\]=]/.test(trimmed)) return false;
  if (/(^|[\s/])(bg-|text-|flex|grid|peer-|group-|data-|hover:|focus:|rounded|border|shadow|menu-|shell-)/.test(trimmed)) {
    return false;
  }

  const hasLetters = /[A-Za-z]/.test(trimmed);
  if (!hasLetters) return false;

  const hasWhitespace = /\s/.test(trimmed);
  if (hasWhitespace) return true;

  return /^[A-ZÁÉÍÓÚÑÜ]/.test(trimmed);
}

function inspectText(text, file) {
  const lines = text.split(/\r?\n/);
  const literalRegex = /(["'`])((?:\\.|(?!\1).)*)\1/g;
  const jsxTextRegex = />\s*([^<>{][^<>{]*?)\s*</g;

  lines.forEach((line, index) => {
    const literals = [];
    for (const match of line.matchAll(literalRegex)) literals.push(match[2]);
    for (const match of line.matchAll(jsxTextRegex)) literals.push(match[1]);

    literals.forEach((literal) => {
      if (!shouldCheckLiteral(literal)) return;
      const normalized = literal.toLowerCase();
      Object.entries(rules).forEach(([plain, accented]) => {
        const regex = new RegExp(`\\b${plain}\\b`, 'i');
        if (!regex.test(normalized)) return;
        warnings.push({
          file: path.relative(root, file),
          line: index + 1,
          plain,
          accented,
          sample: literal.trim()
        });
      });
    });
  });
}

const files = includeRoots.flatMap(walk);
files.forEach((file) => inspectText(fs.readFileSync(file, 'utf8'), file));

if (!warnings.length) {
  console.log('lint:copy OK - no se detectaron textos visibles sin acentos de la lista curada.');
  process.exit(0);
}

console.log('lint:copy warnings');
warnings.forEach(({ file, line, plain, accented, sample }) => {
  console.log(`- ${file}:${line} -> "${plain}" debería ser "${accented}" | ${sample}`);
});

console.log(`Total warnings: ${warnings.length}`);
process.exit(0);
