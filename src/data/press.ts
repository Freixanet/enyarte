import type { ImageMetadata } from 'astro';
import type { Locale } from '../i18n';
import { t, tMaybe } from '../i18n';

import alexiaCover from '../assets/press/press-alexia-vorbe-2024-cover.png';
import colorsBookCover from '../assets/press/press-colors-book-2024-cover.png';
import f4daeCover from '../assets/press/press-f4dae-grove-2019-cover.png';
import heraldCover from '../assets/press/press-miami-herald-2019-cover.png';
import yagCover from '../assets/press/press-yag-2019-cover.jpeg';
import smmsCover from '../assets/press/press-smms-magnet-2015-cover.png';

export type PressId =
  | 'press-alexia-vorbe-2024'
  | 'press-colors-book-2024'
  | 'press-f4dae-grove-2019'
  | 'press-miami-herald-2019'
  | 'press-yag-2019'
  | 'press-smms-magnet-2015';

type PressMeta = {
  id: PressId;
  year: number;
  type: 'mention' | 'interview' | 'article';
  cover: ImageMetadata;
};

const PRESS: PressMeta[] = [
  { id: 'press-alexia-vorbe-2024', year: 2024, type: 'article', cover: alexiaCover },
  { id: 'press-colors-book-2024', year: 2024, type: 'article', cover: colorsBookCover },
  { id: 'press-f4dae-grove-2019', year: 2019, type: 'mention', cover: f4daeCover },
  { id: 'press-miami-herald-2019', year: 2019, type: 'article', cover: heraldCover },
  { id: 'press-yag-2019', year: 2019, type: 'mention', cover: yagCover },
  { id: 'press-smms-magnet-2015', year: 2015, type: 'mention', cover: smmsCover },
];

export type PressView = PressMeta & {
  title: string;
  source: string;
  description?: string;
  quote?: string;
};

function localizePress(item: PressMeta, locale: Locale): PressView {
  const base = `pressData.${item.id}`;
  return {
    ...item,
    title: t(`${base}.title`, locale),
    source: t(`${base}.source`, locale),
    description: tMaybe(`${base}.description`, locale),
    quote: tMaybe(`${base}.quote`, locale),
  };
}

export function getPressItems(locale: Locale): PressView[] {
  return [...PRESS]
    .sort((a, b) => b.year - a.year)
    .map((item) => localizePress(item, locale));
}
