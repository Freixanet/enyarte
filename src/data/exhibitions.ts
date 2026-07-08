import type { ImageMetadata } from 'astro';
import type { Locale } from '../i18n';
import { t, tMaybe } from '../i18n';

import veniceCover from '../assets/exhibitions/ex-itsliquid-venice-2024-cover.jpeg';
import anasaeaCover from '../assets/exhibitions/ex-anasaea-2024-cover.jpeg';
import artexpoCover from '../assets/exhibitions/ex-artexpo-basel-2024-cover.jpg';
import artsToHeartsCover from '../assets/exhibitions/ex-arts-to-hearts-2024-cover.jpeg';
import artCollideCover from '../assets/exhibitions/ex-art-collide-2024-cover.png';
import frameOnWheelsCover from '../assets/exhibitions/ex-frame-on-wheels-2024-cover.jpeg';
import somartsCover from '../assets/exhibitions/ex-somarts-2023-cover.jpeg';
import yagCover from '../assets/exhibitions/ex-young-artists-2019-cover.jpeg';

export type ExhibitionId =
  | 'ex-itsliquid-venice-2024'
  | 'ex-anasaea-2024'
  | 'ex-artexpo-basel-2024'
  | 'ex-arts-to-hearts-2024'
  | 'ex-art-collide-2024'
  | 'ex-frame-on-wheels-2024'
  | 'ex-somarts-2023'
  | 'ex-young-artists-2019';

type ExhibitionMeta = {
  id: ExhibitionId;
  year: number;
  type: 'solo' | 'group';
  cover: ImageMetadata;
};

const EXHIBITIONS: ExhibitionMeta[] = [
  { id: 'ex-itsliquid-venice-2024', year: 2024, type: 'group', cover: veniceCover },
  { id: 'ex-anasaea-2024', year: 2024, type: 'group', cover: anasaeaCover },
  { id: 'ex-artexpo-basel-2024', year: 2024, type: 'group', cover: artexpoCover },
  { id: 'ex-arts-to-hearts-2024', year: 2024, type: 'group', cover: artsToHeartsCover },
  { id: 'ex-art-collide-2024', year: 2024, type: 'group', cover: artCollideCover },
  { id: 'ex-frame-on-wheels-2024', year: 2024, type: 'group', cover: frameOnWheelsCover },
  { id: 'ex-somarts-2023', year: 2023, type: 'group', cover: somartsCover },
  { id: 'ex-young-artists-2019', year: 2019, type: 'group', cover: yagCover },
];

export type ExhibitionView = ExhibitionMeta & {
  title: string;
  venue: string;
  city: string;
  country: string;
  notes?: string;
};

function localizeExhibition(item: ExhibitionMeta, locale: Locale): ExhibitionView {
  const base = `exhibitionsData.${item.id}`;
  return {
    ...item,
    title: t(`${base}.title`, locale),
    venue: t(`${base}.venue`, locale),
    city: t(`${base}.city`, locale),
    country: t(`${base}.country`, locale),
    notes: tMaybe(`${base}.notes`, locale),
  };
}

export function getExhibitions(locale: Locale): ExhibitionView[] {
  return [...EXHIBITIONS]
    .sort((a, b) => b.year - a.year)
    .map((item) => localizeExhibition(item, locale));
}

export function formatExhibitionLocation(item: ExhibitionView): string {
  const parts = [item.venue];
  if (item.city !== '—') parts.push(item.city);
  if (item.country !== '—') parts.push(item.country);
  return parts.join(' · ');
}
