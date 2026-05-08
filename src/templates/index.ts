import defaultTheme from "./default.json";
import minimalTheme from "./minimal.json";
import elegantTheme from "./elegant.json";
import cyberTheme from "./cyber.json";
import warmTheme from "./warm.json";
import forestTheme from "./forest.json";
import oceanTheme from "./ocean.json";
import sakuraTheme from "./sakura.json";
import starryTheme from "./starry.json";
import metalTheme from "./metal.json";
import yuelingTheme from "./yueling.json";

export interface RedThemeStyle {
  imagePreview: string;
  header: {
    avatar: { container: string; placeholder: string; image: string };
    nameContainer: string;
    userName: string;
    userId: string;
    postTime: string;
    verifiedIcon: string;
  };
  footer: {
    container: string;
    text: string;
    separator: string;
  };
  title: {
    h2: { base: string; content: string; after: string };
    h3: { base: string; content: string; after: string };
    base: { base: string; content: string; after: string };
  };
  paragraph: string;
  emphasis: { strong: string; em: string; del: string };
  list: { container: string; item: string; taskList: string };
  code: { block: string; inline: string };
  quote: string;
  image: string;
  link: string;
  table: { container: string; header: string; cell: string };
  hr: string;
  footnote: { ref: string; backref: string };
}

export interface RedTheme {
  id: string;
  name: string;
  styles: RedThemeStyle;
}

export const RED_THEMES: RedTheme[] = [
  defaultTheme as RedTheme,
  minimalTheme as RedTheme,
  elegantTheme as RedTheme,
  cyberTheme as RedTheme,
  warmTheme as RedTheme,
  forestTheme as RedTheme,
  oceanTheme as RedTheme,
  sakuraTheme as RedTheme,
  starryTheme as RedTheme,
  metalTheme as RedTheme,
  yuelingTheme as RedTheme,
];

export const RED_THEME_MAP: Record<string, RedTheme> = {};
for (const t of RED_THEMES) {
  RED_THEME_MAP[t.id] = t;
}
