import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ARCHIVE = '/Users/mfreixanet/Documents/_Desktop_Archive_20260507_160231/_Folders/enyarte.com';
const NEXTJS = '/Users/mfreixanet/Desktop/enyarte-nextjs-archived';

const { artworks } = await import(path.join(NEXTJS, 'data/artworks.ts'));

const WORKS_DIR = path.join(ROOT, 'src/content/works');
const ASSETS_DIR = path.join(ROOT, 'src/assets/works');

const SKIP_SLUGS = new Set(['los-vasos-sagrados-oceans-apart']);

const PRESERVE_STORY_ES: Record<string, string> = {
  'the-reunion': 'Un reencuentro a escala monumental: figuras que emergen del azul profundo como quien vuelve a verse tras años de agua entre medias. Pintura sobre la memoria compartida y la espera.',
  'mi-amigo-fiel': 'Compañero silencioso de la infancia cubana, reimaginado como objeto-totem. La madera lleva el peso del afecto y la distancia. Un homenaje a lo que permanece cuando el cuerpo cruza el océano.',
  'what-we-brought-to-the-table': 'Una mesa íntima donde el agua y la memoria comparten el mismo plato. La obra habla del exilio cotidiano: lo que se trae, lo que se deja y lo que aún alimenta el vínculo entre Cuba y el mar.',
  'medias-res': 'A mitad de camino, a mitad de historia. Capas de papel y pigmento evocan un archivo personal interrumpido por la partida. La obra habla del presente suspendido entre dos orillas.',
  'los-vasos-sagrados': 'Los vasos sagrados son vasos rotos con retratos de familiares separados por océanos. En la religión de mi familia guardamos un pedestal de vasos llenos de agua por cada persona fallecida; el espíritu se alimenta de esa energía y los rellenamos cada mes. Recreé ese homenaje con personas vivas lejanas entre sí, usando vasos rotos para la conexión fracturada y llenándolos de agua.',
};

const SERIES_BY_ID: Record<string, string> = {
  'series-water-gave-me': 'espana',
  'series-oceans-apart': 'miami',
  'series-los-vasos-sagrados': 'cuba',
  'series-la-caridad': 'cuba',
  'series-covid': 'miami',
  'series-no-one-cares': 'sf',
  'series-glimpse': 'sf',
  'series-piezas-perdidas': 'cuba',
  'series-homeless': 'sf',
  'series-living-memories': 'cuba',
  'series-travelers': 'none',
};

const SERIES_BY_SLUG: Record<string, string> = {
  'the-travelers-from-miami': 'miami',
  'the-travelers-from-la-habana': 'cuba',
  'the-travelers-from-san-francisco': 'sf',
  'the-travelers-from-roma': 'roma',
  'the-travelers-home-comes-with-me': 'espana',
  'the-travelers-home-comes-with-me-object': 'espana',
};

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const MP4_FALLBACK: Record<string, string> = {
  'im-moving-gif': "/photos/2024 TRAVELERS SERIES/I'm moving.png",
};

type Artwork = (typeof artworks)[number];

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

function isRasterImage(filePath: string) {
  return IMAGE_EXT.has(extOf(filePath));
}

function inchesToCm(n: number) {
  return Math.round(n * 2.54 * 100) / 100;
}

function feetToCm(n: number) {
  return Math.round(n * 30.48 * 100) / 100;
}

function parseDimensions(dim: string) {
  if (!dim || dim === '—') return { width_cm: null, height_cm: null, depth_cm: null as number | null };

  const feetCube = dim.match(/(\d+(?:\.\d+)?)\s*×\s*(\d+(?:\.\d+)?)\s*×\s*(\d+(?:\.\d+)?)\s*feet/i);
  if (feetCube) {
    return {
      width_cm: feetToCm(Number(feetCube[1])),
      height_cm: feetToCm(Number(feetCube[2])),
      depth_cm: feetToCm(Number(feetCube[3])),
    };
  }

  const inch3 = dim.match(/(\d+(?:\.\d+)?)"\s*×\s*(\d+(?:\.\d+)?)"\s*×\s*(\d+(?:\.\d+)?)"/);
  if (inch3) {
    return {
      width_cm: inchesToCm(Number(inch3[1])),
      height_cm: inchesToCm(Number(inch3[2])),
      depth_cm: inchesToCm(Number(inch3[3])),
    };
  }

  const inch2 = dim.match(/(\d+(?:\.\d+)?)"\s*×\s*(\d+(?:\.\d+)?)"/);
  if (inch2) {
    return {
      width_cm: inchesToCm(Number(inch2[1])),
      height_cm: inchesToCm(Number(inch2[2])),
      depth_cm: null,
    };
  }

  return { width_cm: null, height_cm: null, depth_cm: null };
}

function inferKind(medium: string, surface: string) {
  const text = `${medium} ${surface}`.toLowerCase();
  if (text.includes('sculpture') || text.includes('fountain') || (text.includes('glass') && text.includes('resin'))) {
    return 'installation';
  }
  if (text.includes('luggage') || text.includes('chair') || text.includes('table') || text.includes('found') || text.includes('gif')) {
    return 'object';
  }
  return 'painting';
}

function techniqueEs(medium: string) {
  const map: [RegExp, string][] = [
    [/acrylic painting on canvas/i, 'Acrílico sobre lienzo'],
    [/acrylic on canvas/i, 'Acrílico sobre lienzo'],
    [/acrylic and resin on glass/i, 'Acrílico y resina sobre vidrio'],
    [/acrylic on resin and glass/i, 'Acrílico sobre resina y vidrio'],
    [/acrylic painting on found table/i, 'Acrílico sobre mesa encontrada'],
    [/acrylic painting on wooden chair/i, 'Acrílico sobre silla de madera'],
    [/acrylic painting on carry-on luggage/i, 'Acrílico sobre equipaje de mano'],
    [/acrylic on foam board/i, 'Acrílico sobre cartón pluma'],
    [/acrylic on canvas plus coins/i, 'Acrílico sobre lienzo y monedas'],
    [/mixed media/i, 'Técnica mixta'],
    [/digital collage/i, 'Collage digital y pintura'],
    [/phone fountain sculpture/i, 'Escultura-fuente con teléfono'],
    [/gif video/i, 'Vídeo GIF'],
  ];
  for (const [re, es] of map) {
    if (re.test(medium)) return es;
  }
  if (medium && medium !== '—') return medium;
  return 'Técnica mixta';
}

function mapSeries(artwork: Artwork) {
  if (SERIES_BY_SLUG[artwork.slug]) return SERIES_BY_SLUG[artwork.slug];
  if (artwork.seriesId && SERIES_BY_ID[artwork.seriesId]) return SERIES_BY_ID[artwork.seriesId];
  return 'none';
}

function yamlString(value: string | number | boolean | null | undefined) {
  if (value == null) return 'null';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  const normalized = String(value).replace(/\r\n/g, '\n').trim();
  if (!/[\n:"'#]/.test(normalized)) return JSON.stringify(normalized);
  return `>- \n  ${normalized.replace(/\n/g, '\n  ')}`;
}

function copyImage(srcPath: string, destBaseName: string) {
  const ext = extOf(srcPath);
  const destName = `${destBaseName}${ext}`;
  const destPath = path.join(ASSETS_DIR, destName);
  fs.copyFileSync(srcPath, destPath);
  return `../../assets/works/${destName}`;
}

function collectImages(artwork: Artwork) {
  const urls = artwork.images.map((img) => img.url);
  const mainUrl = MP4_FALLBACK[artwork.slug] ?? urls[0];
  const mainSrc = resolveArchivePath(mainUrl);
  if (!mainSrc || !isRasterImage(mainSrc)) {
    throw new Error(`Missing cover image for ${artwork.slug}: ${mainUrl}`);
  }

  const coverRel = copyImage(mainSrc, artwork.slug);
  const gallery: string[] = [];
  const detailUrls = urls.slice(mainUrl === urls[0] ? 1 : 0);

  detailUrls.forEach((url, index) => {
    const src = resolveArchivePath(url);
    if (!src || !isRasterImage(src)) return;
    gallery.push(copyImage(src, `${artwork.slug}-g${String(index + 2).padStart(2, '0')}`));
  });

  return { coverRel, gallery };
}

function buildMarkdown(artwork: Artwork, order: number) {
  const dims = parseDimensions(artwork.dimensions);
  const kind = inferKind(artwork.medium, artwork.surface);
  const series = mapSeries(artwork);
  const storyEn = artwork.descriptionLong || artwork.descriptionShort || '';
  const storyEs = PRESERVE_STORY_ES[artwork.slug] ?? storyEn;
  const { coverRel, gallery } = collectImages(artwork);

  const lines = [
    '---',
    `title: ${yamlString(artwork.title)}`,
    `year: ${artwork.year}`,
    `technique_es: ${yamlString(techniqueEs(artwork.medium))}`,
    `technique_en: ${yamlString(artwork.medium === '—' ? 'Mixed media' : artwork.medium)}`,
    `width_cm: ${dims.width_cm ?? 'null'}`,
    `height_cm: ${dims.height_cm ?? 'null'}`,
  ];

  if (dims.depth_cm != null) lines.push(`depth_cm: ${dims.depth_cm}`);
  lines.push(
    `kind: ${kind}`,
    `series: ${series}`,
    `status: ${artwork.status}`,
    'price_eur: null',
    `featured: ${artwork.featured}`,
    `cover: ${coverRel}`,
  );

  if (gallery.length > 0) {
    lines.push('gallery:');
    for (const item of gallery) lines.push(`  - ${item}`);
  }

  lines.push(
    `story_es: ${yamlString(storyEs)}`,
    `story_en: ${yamlString(storyEn)}`,
    `order: ${order}`,
    '---',
    '',
  );

  return lines.join('\n');
}

fs.mkdirSync(ASSETS_DIR, { recursive: true });

for (const file of fs.readdirSync(WORKS_DIR).filter((f) => f.endsWith('.md'))) {
  fs.unlinkSync(path.join(WORKS_DIR, file));
}
for (const file of fs.readdirSync(ASSETS_DIR)) {
  fs.unlinkSync(path.join(ASSETS_DIR, file));
}

const filtered = artworks.filter((a) => !SKIP_SLUGS.has(a.slug));
let order = 1;

for (const artwork of filtered) {
  fs.writeFileSync(path.join(WORKS_DIR, `${artwork.slug}.md`), buildMarkdown(artwork, order++), 'utf8');
}

console.log(`Imported ${filtered.length} works into ${WORKS_DIR}`);
