import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ARCHIVE = '/Users/mfreixanet/Documents/_Desktop_Archive_20260507_160231/_Folders/enyarte.com';
const NEXTJS = '/Users/mfreixanet/Desktop/enyarte-nextjs-archived';

const { exhibitions } = await import(path.join(NEXTJS, 'data/exhibitions.ts'));
const { pressItems } = await import(path.join(NEXTJS, 'data/press.ts'));

const ABOUT_DIR = path.join(ROOT, 'src/assets/about');
const EXHIBITIONS_DIR = path.join(ROOT, 'src/assets/exhibitions');
const PRESS_DIR = path.join(ROOT, 'src/assets/press');
const PUBLIC_PRESS_DIR = path.join(ROOT, 'public/press/images');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function resolveArchivePath(url: string) {
  const rel = url.replace(/^\//, '');
  const candidates = [
    path.join(ARCHIVE, 'public', rel),
    path.join(ARCHIVE, rel),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function extOf(filePath: string) {
  return path.extname(filePath).toLowerCase();
}

function isRaster(filePath: string) {
  return IMAGE_EXT.has(extOf(filePath));
}

function copyRaster(url: string, destBase: string, destDir: string) {
  const src = resolveArchivePath(url);
  if (!src || !isRaster(src)) {
    throw new Error(`Missing image: ${url}`);
  }
  const dest = path.join(destDir, `${destBase}${extOf(src)}`);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  return path.basename(dest);
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    fs.unlinkSync(path.join(dir, file));
  }
}

emptyDir(ABOUT_DIR);
emptyDir(EXHIBITIONS_DIR);
emptyDir(PRESS_DIR);
if (fs.existsSync(PUBLIC_PRESS_DIR)) {
  for (const file of fs.readdirSync(PUBLIC_PRESS_DIR)) {
    fs.unlinkSync(path.join(PUBLIC_PRESS_DIR, file));
  }
}

const aboutFiles = {
  'enya-profile': '/ME/Enya Profile .jpg',
  'young-enya': '/ME/Young Enya.png',
  'grad-photo': '/ME/Grad photo.jpg',
};

const aboutCopied: Record<string, string> = {};
for (const [base, url] of Object.entries(aboutFiles)) {
  aboutCopied[base] = copyRaster(url, base, ABOUT_DIR);
  copyRaster(url, base, PUBLIC_PRESS_DIR);
}

const exhibitionCopied: Record<string, string> = {};
for (const ex of exhibitions) {
  exhibitionCopied[ex.id] = copyRaster(ex.coverImage, `${ex.id}-cover`, EXHIBITIONS_DIR);
}

const pressCopied: Record<string, string> = {};
for (const item of pressItems) {
  pressCopied[item.id] = copyRaster(item.coverImage, `${item.id}-cover`, PRESS_DIR);
}

console.log(JSON.stringify({ aboutCopied, exhibitionCopied, pressCopied }, null, 2));
