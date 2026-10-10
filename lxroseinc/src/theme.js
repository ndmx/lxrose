import { resolveSchemeVars } from '@xlumina/system/scheme';
import { getRegistryEntry } from '@xlumina/system/registry';

// Lumina Design System · Variation 05 · Created by ndmx
// website / browser / react / editorial / forms / public-submissions
const palette = getRegistryEntry('design-variation-05').tokenOverrides;
export const publicTheme = {
  ...resolveSchemeVars('light', 'atelier'),
  '--ls-bg': palette.background,
  '--ls-surface': palette.surface,
  '--ls-text': palette.textPrimary,
  '--ls-text-muted': palette.textMuted,
  '--ls-accent': palette.accentPrimary,
  '--ls-accent-2': palette.accentSecondary,
  '--ls-on-accent': '#ffffff',
};
