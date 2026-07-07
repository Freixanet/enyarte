import es from './es.json';
import en from './en.json';

export type Locale = 'es' | 'en';

export const LOCALES: Locale[] = ['es', 'en'];
export const DEFAULT_LOCALE: Locale = 'es';
export const SITE_URL = 'https://enyarte.com';

const messages: Record<Locale, typeof es> = { es, en };

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      return collectKeys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

function validateParity(): void {
  const esKeys = new Set(collectKeys(es as Record<string, unknown>));
  const enKeys = new Set(collectKeys(en as Record<string, unknown>));

  for (const key of esKeys) {
    if (!enKeys.has(key)) {
      throw new Error(`Missing i18n key in en.json: ${key}`);
    }
  }

  for (const key of enKeys) {
    if (!esKeys.has(key)) {
      throw new Error(`Missing i18n key in es.json: ${key}`);
    }
  }
}

validateParity();

function resolveKey(obj: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((current, part) => {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string, unknown>)[part];
  }, obj);
}

export function t(key: string, locale: Locale): string {
  const value = resolveKey(messages[locale] as Record<string, unknown>, key);
  if (typeof value !== 'string') {
    throw new Error(`Missing i18n key "${key}" for locale "${locale}"`);
  }
  return value;
}

export function getLocale(pathname: string): Locale {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return 'en';
  }
  return 'es';
}

export type PageKey =
  | 'home'
  | 'works'
  | 'commissions'
  | 'about'
  | 'exhibitions'
  | 'press'
  | 'contact'
  | 'purchaseFaq'
  | 'privacy'
  | 'notFound';

const PAGE_PATHS: Record<PageKey, Record<Locale, string>> = {
  home: { es: '/', en: '/en/' },
  works: { es: '/obras', en: '/en/works' },
  commissions: { es: '/encargos', en: '/en/commissions' },
  about: { es: '/about', en: '/en/about' },
  exhibitions: { es: '/exposiciones', en: '/en/exhibitions' },
  press: { es: '/prensa', en: '/en/press' },
  contact: { es: '/contacto', en: '/en/contact' },
  purchaseFaq: { es: '/faq-compra', en: '/en/purchase-faq' },
  privacy: { es: '/privacidad', en: '/en/privacy' },
  notFound: { es: '/404', en: '/en/404' },
};

export function pathFor(pageKey: PageKey, locale: Locale): string {
  return PAGE_PATHS[pageKey][locale];
}

export function alternatePath(pathname: string, slug?: string): string {
  const locale = getLocale(pathname);
  const targetLocale: Locale = locale === 'es' ? 'en' : 'es';
  const normalized = pathname.endsWith('/') && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;

  if (normalized === '/' || normalized === '/en') {
    return pathFor('home', targetLocale);
  }

  const workMatch = normalized.match(/^\/obras\/([^/]+)$/);
  if (workMatch) {
    const workSlug = slug ?? workMatch[1];
    return targetLocale === 'en' ? `/en/works/${workSlug}` : `/obras/${workSlug}`;
  }

  const enWorkMatch = normalized.match(/^\/en\/works\/([^/]+)$/);
  if (enWorkMatch) {
    const workSlug = slug ?? enWorkMatch[1];
    return targetLocale === 'es' ? `/obras/${workSlug}` : `/en/works/${workSlug}`;
  }

  for (const pageKey of Object.keys(PAGE_PATHS) as PageKey[]) {
    if (PAGE_PATHS[pageKey][locale] === normalized) {
      return PAGE_PATHS[pageKey][targetLocale];
    }
  }

  return pathFor('home', targetLocale);
}

export function buildTitle(pageKey: PageKey, locale: Locale, customTitle?: string): string {
  if (pageKey === 'home' && !customTitle) {
    return t('site.artistName', locale);
  }
  const pageTitle = customTitle ?? t(`meta.${pageKey}.title`, locale);
  return `${pageTitle} — ${t('site.artistName', locale)}`;
}

export function absoluteUrl(path: string): string {
  if (path === '/') return `${SITE_URL}/`;
  if (path === '/en/') return `${SITE_URL}/en/`;
  const normalized = path.endsWith('/') ? path.slice(0, -1) : path;
  return `${SITE_URL}${normalized}`;
}

export function hreflangLinks(pathname: string, slug?: string): Array<{ lang: string; href: string }> {
  const esPath = getLocale(pathname) === 'es' ? pathname : alternatePath(pathname, slug);
  const enPath = getLocale(pathname) === 'en' ? pathname : alternatePath(pathname, slug);

  return [
    { lang: 'es', href: absoluteUrl(esPath) },
    { lang: 'en', href: absoluteUrl(enPath) },
    { lang: 'x-default', href: absoluteUrl(esPath) },
  ];
}

export function navLinks(locale: Locale): Array<{ href: string; label: string }> {
  return [
    { href: pathFor('works', locale), label: t('nav.works', locale) },
    { href: pathFor('commissions', locale), label: t('nav.commissions', locale) },
    { href: pathFor('about', locale), label: t('nav.about', locale) },
    { href: pathFor('contact', locale), label: t('nav.contact', locale) },
  ];
}

export function footerLinks(locale: Locale): Array<{ href: string; label: string }> {
  return [
    { href: pathFor('exhibitions', locale), label: t('footer.exhibitions', locale) },
    { href: pathFor('press', locale), label: t('footer.press', locale) },
    { href: pathFor('purchaseFaq', locale), label: t('footer.purchaseFaq', locale) },
    { href: pathFor('privacy', locale), label: t('footer.privacy', locale) },
  ];
}
