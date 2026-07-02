'use server';

import { askLibrary, type AskResult } from '@/lib/ai';
import { isValidLocale, defaultLocale } from '@/i18n/routing';

/** Ask-the-Library action, callable from the client component. */
export async function askLibraryAction(question: string, locale: string): Promise<AskResult> {
  const loc = isValidLocale(locale) ? locale : defaultLocale;
  return askLibrary(question, loc);
}
