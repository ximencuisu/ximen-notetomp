import { MarkdownParser } from "./markdown-parser";
import { XimenSettings } from "./settings";

export interface RedCardSection {
  index: string;
  heading: string;
  content: string; // HTML content
}

export class RedRenderer {
  private parser: MarkdownParser;

  constructor(parser: MarkdownParser) {
    this.parser = parser;
  }

  async renderCards(md: string, filePath: string, settings: XimenSettings): Promise<RedCardSection[]> {
    const parsed = await this.parser.parse(md, filePath);
    const { html, title } = parsed;

    // Create a temporary DOM to parse sections
    const div = document.createElement("div");
    div.innerHTML = html;

    const headingLevel = settings.redHeadingLevel || "h2";
    const headers = Array.from(div.querySelectorAll(headingLevel));

    if (headers.length === 0) {
      // No headings - single card
      const sectionHtml = this.processElements(div.innerHTML);
      return [{
        index: "0",
        heading: title || "",
        content: this.wrapHeading(title, headingLevel) + sectionHtml,
      }];
    }

    const sections: RedCardSection[] = [];
    let sectionIdx = 0;

    const beforeFirstHeader: Element[] = [];
    let firstHeaderIdx = -1;
    for (let i = 0; i < div.children.length; i++) {
      const child = div.children[i] as Element;
      if (child.matches(headingLevel)) {
        firstHeaderIdx = i;
        break;
      }
      beforeFirstHeader.push(child);
    }

    if (beforeFirstHeader.length > 0) {
      const preContent = beforeFirstHeader.map(el => el.outerHTML).join("\n");
      sections.push({
        index: String(sectionIdx),
        heading: title || "",
        content: this.wrapHeading(title, headingLevel) + this.processElements(preContent),
      });
      sectionIdx++;
    }

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const headingText = header.textContent || "";
      let contentNodes: Element[] = [];
      let sibling = header.nextElementSibling;

      while (sibling && !sibling.matches(headingLevel)) {
        contentNodes.push(sibling);
        sibling = sibling.nextElementSibling;
      }

      // Check for HR splits within this section
      const pages = this.splitByHR(contentNodes, headingText, headingLevel, sectionIdx);
      sections.push(...pages);
      sectionIdx = sections.length;
    }

    return sections;
  }

  private wrapHeading(text: string, level: string): string {
    return `<${level}><span class="content">${this.escapeHtml(text)}</span><span class="after"></span></${level}>`;
  }

  private splitByHR(nodes: Element[], headingText: string, headingLevel: string, baseIdx: number): RedCardSection[] {
    const pages: { heading: string; content: Element[] }[] = [];

    let currentPage: Element[] = [];
    for (const node of nodes) {
      if (node.tagName === "HR") {
        if (currentPage.length > 0) {
          pages.push({ heading: headingText, content: currentPage });
          currentPage = [];
        }
        // Still start a new page after HR
      } else {
        currentPage.push(node);
      }
    }
    if (currentPage.length > 0 || pages.length === 0) {
      pages.push({ heading: headingText, content: currentPage });
    }

    return pages.map((page, i) => {
      const headingHtml = this.wrapHeading(page.heading, headingLevel);
      const contentHtml = page.content.map(el => el.outerHTML).join("\n");
      return {
        index: `${baseIdx}-${i}`,
        heading: page.heading,
        content: headingHtml + this.processElements(contentHtml),
      };
    });
  }

  processElements(html: string): string {
    const div = document.createElement("div");
    div.innerHTML = html;

    div.querySelectorAll("blockquote").forEach(el => {
      el.classList.add("red-blockquote");
      el.querySelectorAll("p").forEach(p => p.classList.add("red-blockquote-p"));
    });

    div.querySelectorAll("strong").forEach(el => {
      const wrap = document.createElement("span");
      wrap.classList.add("red-emphasis");
      el.parentNode?.insertBefore(wrap, el);
      wrap.appendChild(el);
    });

    div.querySelectorAll("em").forEach(el => {
      const parent = el.closest(".red-emphasis");
      if (!parent) {
        const wrap = document.createElement("span");
        wrap.classList.add("red-emphasis");
        el.parentNode?.insertBefore(wrap, el);
        wrap.appendChild(el);
      }
    });

    div.querySelectorAll("del").forEach(el => el.classList.add("red-del"));

    div.querySelectorAll("pre").forEach(el => {
      el.classList.add("red-pre");
    });

    div.querySelectorAll("code").forEach(el => {
      if (!el.closest("pre")) {
        el.classList.add("red-code-inline");
      }
    });

    div.querySelectorAll("img").forEach(el => el.classList.add("red-image"));

    div.querySelectorAll("a").forEach(el => el.classList.add("red-link"));

    div.querySelectorAll("table").forEach(el => el.classList.add("red-table"));

    div.querySelectorAll("hr").forEach(el => el.classList.add("red-hr"));

    div.querySelectorAll('input[type="checkbox"]').forEach(el => {
      const li = el.closest("li");
      if (li) li.classList.add("red-task-list-item");
    });

    return div.innerHTML;
  }

  /**
   * Convert card HTML to plain text for clipboard copy
   */
  cardToPlainText(sections: RedCardSection[]): string {
    return sections.map(s => {
      const div = document.createElement("div");
      div.innerHTML = s.content;
      return div.textContent || "";
    }).join("\n\n---\n\n");
  }

  private escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
}
