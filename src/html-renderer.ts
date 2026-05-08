import { Theme, THEMES } from "./styles";

export class HtmlRenderer {
  applyTheme(html: string, themeId: string): string {
    const theme = THEMES[themeId];
    if (!theme) return html;

    const s = theme.styles;

    // Wrap in container with theme styles
    let result = `<div class="note-to-mp" style="${s.container}">${html}</div>`;

    // Apply inline styles to elements
    // Headings
    result = this.applyTagStyle(result, "h1", s.h1);
    result = this.applyTagStyle(result, "h2", s.h2);
    result = this.applyTagStyle(result, "h3", s.h3);
    result = this.applyTagStyle(result, "h4", s.h4);
    result = this.applyTagStyle(result, "h5", s.h5);
    result = this.applyTagStyle(result, "h6", s.h6);
    result = this.applyTagStyle(result, "p", s.p);
    result = this.applyTagStyle(result, "strong", s.strong);
    result = this.applyTagStyle(result, "em", s.em);
    result = this.applyTagStyleInclusive(result, "a", s.a);
    result = this.applyTagStyle(result, "ul", s.ul);
    result = this.applyTagStyle(result, "ol", s.ol);
    result = this.applyTagStyle(result, "li", s.li);
    result = this.applyTagStyle(result, "blockquote", s.blockquote);
    result = this.applyTagStyle(result, "pre", s.pre);
    result = this.applyTagStyle(result, "hr", s.hr);
    result = this.applyTagStyle(result, "img", s.img);
    result = this.applyTagStyle(result, "table", s.table);
    result = this.applyTagStyle(result, "th", s.th);
    result = this.applyTagStyle(result, "td", s.td);

    // Inline code (inside <p>, <li>, etc., not inside <pre>)
    this.applyInlineCode(result, s.code);

    return result;
  }

  private applyTagStyle(html: string, tag: string, style: string): string {
    if (!style) return html;
    // Match opening tags: <tag>, <tag attr="...">, but not </tag>
    const regex = new RegExp(`<${tag}(\\s[^>]*)?>`, "gi");
    return html.replace(regex, (match) => {
      if (match.includes("style=")) {
        return match.replace(/style="([^"]*)"/, (_, existing) => `style="${existing} ${style}"`);
      }
      return match.replace(">", ` style="${style}">`);
    });
  }

  private applyTagStyleInclusive(html: string, tag: string, style: string): string {
    if (!style) return html;
    // Style the <a> tag but not if it already has style
    const regex = new RegExp(`<${tag}(\\s[^>]*)?>`, "gi");
    return html.replace(regex, (match) => {
      if (match.includes("style=")) return match;
      return match.replace(">", ` style="${style}">`);
    });
  }

  private applyInlineCode(html: string, style: string): void {
    // We don't need to do anything for inline code here
    // as marked already handles <code> tags
  }

  /**
   * Copy HTML to clipboard as rich text (so WeChat/Toutiao editors can paste with styles)
   */
  async copyHtmlToClipboard(html: string): Promise<void> {
    // Create a Blob with HTML content
    const fullHtml = `<!DOCTYPE html><html><body>${html}</body></html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const textBlob = new Blob([this.htmlToPlainText(html)], { type: "text/plain" });

    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": blob,
        "text/plain": textBlob,
      }),
    ]);
  }

  /**
   * Export as self-contained HTML file
   */
  exportHtmlFile(html: string): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Export</title>
</head>
<body>
${html}
</body>
</html>`;
  }

  private htmlToPlainText(html: string): string {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || "";
  }
}

