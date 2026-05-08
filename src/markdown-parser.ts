import { Marked } from "marked";
import { TFile, Vault } from "obsidian";
import { App } from "obsidian";

// Frontmatter regex
const FM_REGEX = /^---\s*\n[\s\S]*?\n---\s*\n/;

// Wikilink regex: [[link]] or [[link|alias]] or ![[embed]] or ![[embed|alias]]
const WIKILINK_REGEX = /!?\[\[([^\]]+?)(?:\|([^\]]*))?\]\]/g;

// Callout regex: > [!TYPE] optional title
const CALLOUT_REGEX = /^>\s*\[!(\w+)\]\s*(.*)$/;

export interface ParseResult {
  html: string;
  images: string[];
  title: string;
}

export class MarkdownParser {
  private marked: Marked;
  private vault: Vault;
  private app: App;
  private currentFilePath: string;

  constructor(vault: Vault, app: App) {
    this.vault = vault;
    this.app = app;
    this.marked = new Marked({
      gfm: true,
      breaks: false,
    });
  }

  setCurrentFile(path: string) {
    this.currentFilePath = path;
  }

  private stripFrontmatter(md: string): string {
    return md.replace(FM_REGEX, "");
  }

  private getTitleFromFrontmatter(md: string): string {
    const match = md.match(/^---\s*\n[\s\S]*?\n---\s*\n/);
    if (!match) return "";
    const fm = match[0];
    const titleMatch = fm.match(/^(?:title|标题)[:\s]+(.+)$/im);
    return titleMatch ? titleMatch[1].trim().replace(/^["\']|["\']$/g, "") : "";
  }

  private async resolveWikilink(link: string): Promise<string | null> {
    const files = this.vault.getMarkdownFiles();
    for (const f of files) {
      if (f.basename === link || f.path === link || f.path.endsWith("/" + link)) {
        return f.path;
      }
    }
    const all = this.vault.getAllLoadedFiles();
    for (const f of all) {
      if (f.name === link || f.path === link || f.path.endsWith("/" + link)) {
        return f.path;
      }
    }
    return null;
  }

  private async processWikilinks(md: string): Promise<string> {
    const results: string[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    WIKILINK_REGEX.lastIndex = 0;

    while ((match = WIKILINK_REGEX.exec(md)) !== null) {
      results.push(md.slice(lastIndex, match.index));

      const fullMatch = match[0];
      const isEmbed = fullMatch.startsWith("!");
      const target = match[1].trim();
      const alias = match[2]?.trim() || target;

      if (isEmbed) {
        const resolved = await this.resolveWikilink(target);
        if (resolved) {
          const ext = resolved.split(".").pop()?.toLowerCase();
          if (["png", "jpg", "jpeg", "gif", "bmp", "webp", "svg"].includes(ext || "")) {
            const fileObj = this.vault.getAbstractFileByPath(resolved);
            const resourcePath = (fileObj instanceof TFile) ? this.app.vault.getResourcePath(fileObj) : resolved;
            results.push(`<img src="${this.escapeHtml(resourcePath)}" alt="${this.escapeHtml(alias)}" data-source="note" />`);
          } else {
            try {
              const file = this.vault.getAbstractFileByPath(resolved);
              if (file instanceof TFile && file.extension === "md") {
                const content = await this.vault.cachedRead(file);
                const stripped = this.stripFrontmatter(content);
                results.push(`<blockquote class="note-embed">${await this.marked.parse(stripped)}</blockquote>`);
              } else {
                results.push(`<a href="${this.escapeHtml(resolved)}">${this.escapeHtml(alias)}</a>`);
              }
            } catch {
              results.push(`<span class="broken-embed">${this.escapeHtml(alias)}</span>`);
            }
          }
        } else {
          results.push(`<span class="broken-embed">${this.escapeHtml(alias)}</span>`);
        }
      } else {
        const resolved = await this.resolveWikilink(target);
        if (resolved) {
          results.push(`<a href="${this.escapeHtml(resolved)}" class="internal-link">${this.escapeHtml(alias)}</a>`);
        } else {
          results.push(`<span class="broken-link">${this.escapeHtml(alias)}</span>`);
        }
      }

      lastIndex = match.index + fullMatch.length;
    }

    results.push(md.slice(lastIndex));
    return results.join("");
  }

  private async processCallouts(md: string): Promise<string> {
    const lines = md.split("\n");
    const result: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const calloutMatch = line.match(CALLOUT_REGEX);

      if (calloutMatch) {
        const type = calloutMatch[1].toLowerCase();
        const title = calloutMatch[2] || this.capitalize(type);
        const calloutLines: string[] = [];
        i++;

        while (i < lines.length) {
          const cl = lines[i];
          if (cl.startsWith(">")) {
            calloutLines.push(cl.replace(/^>\s?/, ""));
            i++;
          } else {
            break;
          }
        }

        const content = calloutLines.join("\n");
        const htmlContent = await this.marked.parse(content) as string;
        result.push(`<div class="note-callout note-callout-${type}">
<div class="note-callout-title-wrap">
<span class="note-callout-icon"><svg viewBox="0 0 18 18" width="18" height="18">${this.getCalloutIcon(type)}</svg></span>
<span class="note-callout-title">${this.escapeHtml(title)}</span>
</div>
<div class="note-callout-content">${htmlContent}</div>
</div>`);
      } else {
        result.push(line);
        i++;
      }
    }

    return result.join("\n");
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  private getCalloutIcon(type: string): string {
    const icons: Record<string, string> = {
      note: '<path d="M9 1a8 8 0 100 16A8 8 0 009 1z" fill="currentColor"/>',
      info: '<path d="M9 1a8 8 0 100 16A8 8 0 009 1zm0 2a1 1 0 110 2 1 1 0 010-2zm1 10H8V7h2v6z" fill="currentColor"/>',
      todo: '<path d="M9 1a8 8 0 100 16A8 8 0 009 1zm3.5 5.5l-4 4-2-2L5 10l3.5 3.5 5.5-5.5-1.5-1.5z" fill="currentColor"/>',
      tip: '<path d="M9 1a8 8 0 100 16A8 8 0 009 1zm1 13H8v-2h2v2zm0-3H8V5h2v6z" fill="currentColor"/>',
      warning: '<path d="M9 1L1 16h16L9 1zm0 3l5 10H4L9 4zm0 8a1 1 0 110 2 1 1 0 010-2z" fill="currentColor"/>',
      danger: '<path d="M9 1a8 8 0 100 16A8 8 0 009 1zm4 10.5l-1.5 1.5L9 12l-2.5 2L5 11.5 7.5 9 5 6.5 6.5 5 9 7.5 11.5 5 13 6.5 10.5 9 13 11.5z" fill="currentColor"/>',
      quote: '<path d="M4 4h10v2H4V4zm0 4h8v2H4V8zm0 4h6v2H4v-2z" fill="currentColor"/>',
      abstract: '<path d="M4 4h10v2H4V4zm0 4h8v2H4V8zm0 4h6v2H4v-2z" fill="currentColor"/>',
      success: '<path d="M9 1a8 8 0 100 16A8 8 0 009 1zm4 5.5l-1.5-1.5L8 9 6.5 7.5 5 9l3 3 5-5.5z" fill="currentColor"/>',
      question: '<path d="M9 1a8 8 0 100 16A8 8 0 009 1zm1 13H8v-2h2v2zm1.1-5.7l-.9.9c-.2.2-.3.4-.3.8H9v-.5c0-.4.2-.8.5-1.1l1-1c.3-.3.5-.7.5-1.2 0-.8-.7-1.5-1.5-1.5S8 6.2 8 7H6c0-1.7 1.3-3 3-3s3 1.3 3 3c0 .7-.3 1.4-.9 1.8z" fill="currentColor"/>',
    };
    return icons[type] || icons.note;
  }

  async parse(md: string, filePath: string): Promise<ParseResult> {
    this.currentFilePath = filePath;
    const title = this.getTitleFromFrontmatter(md) || filePath.split("/").pop()?.replace(/\.md$/, "") || "";
    let body = this.stripFrontmatter(md);
    body = await this.processWikilinks(body);
    body = await this.processCallouts(body);
    const html = await this.marked.parse(body) as string;
    return { html, images: [], title };
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
