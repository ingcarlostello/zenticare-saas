import 'server-only';
import type { Locale } from './config';

// We enumerate all dictionaries here for better webpack support
const dictionaries = {
  en: () => import('../../dictionaries/en.json').then((module) => module.default),
  es: () => import('../../dictionaries/es.json').then((module) => module.default),
  pt: () => import('../../dictionaries/pt.json').then((module) => module.default),
  fr: () => import('../../dictionaries/fr.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]?.() ?? dictionaries.en();
};
