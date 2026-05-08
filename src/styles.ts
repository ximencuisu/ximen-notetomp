import themesData from "./themes-data.json";

export interface ThemeStyle {
  container: string;
  h1: string; h2: string; h3: string; h4: string; h5: string; h6: string;
  p: string; strong: string; em: string; a: string;
  ul: string; ol: string; li: string;
  blockquote: string; code: string; pre: string;
  hr: string; img: string;
  table: string; th: string; td: string; tr: string;
}

export interface Theme {
  id: string;
  name: string;
  styles: ThemeStyle;
}

export const THEMES: Record<string, Theme> = {};

for (const [id, data] of Object.entries(themesData)) {
  THEMES[id] = {
    id,
    name: (data as any).name,
    styles: (data as any).styles,
  };
}

export const THEME_IDS = Object.keys(THEMES);
export const THEME_NAMES: Record<string, string> = {};
for (const id of THEME_IDS) {
  THEME_NAMES[id] = THEMES[id].name;
}
