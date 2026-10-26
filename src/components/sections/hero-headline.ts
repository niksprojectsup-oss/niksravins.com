export const HOME_HERO_HEADLINE_CLASS = "type-display max-w-content home-hero-headline";

/** Tiptap “medium” kickers inherit the display headline’s computed tracking. */
export function cmsHeroHtmlHasMediumKicker(html?: string): boolean {
  return Boolean(html && /font-size:\s*medium/i.test(html));
}
