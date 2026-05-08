import { RedThemeStyle } from "./templates/index";

export class ThemeManager {
  applyTheme(container: HTMLElement, styles: RedThemeStyle, fontSize: number, fontFamily: string): void {
    // Apply imagePreview style
    const preview = container.querySelector(".red-image-preview") as HTMLElement;
    if (preview) {
      preview.setAttribute("style", styles.imagePreview);
    }

    // Header styles
    const header = container.querySelector(".red-preview-header");
    if (header) {
      header.querySelectorAll(".red-user-avatar").forEach(el => {
        (el as HTMLElement).setAttribute("style", styles.header.avatar.container);
      });
      header.querySelectorAll(".red-avatar-placeholder").forEach(el => {
        (el as HTMLElement).setAttribute("style", styles.header.avatar.placeholder);
      });
      header.querySelectorAll(".red-user-avatar img").forEach(el => {
        (el as HTMLElement).setAttribute("style", styles.header.avatar.image);
      });
      header.querySelectorAll(".red-user-name").forEach(el => {
        (el as HTMLElement).setAttribute("style", styles.header.userName);
      });
      header.querySelectorAll(".red-user-id").forEach(el => {
        (el as HTMLElement).setAttribute("style", styles.header.userId);
      });
      header.querySelectorAll(".red-post-time").forEach(el => {
        (el as HTMLElement).setAttribute("style", styles.header.postTime);
      });
      header.querySelectorAll(".red-verified-icon").forEach(el => {
        (el as HTMLElement).setAttribute("style", styles.header.verifiedIcon);
      });
    }

    // Footer styles
    const footer = container.querySelector(".red-preview-footer") as HTMLElement;
    if (footer) {
      footer.setAttribute("style", styles.footer.container);
      footer.querySelectorAll(".red-footer-text").forEach(el => {
        (el as HTMLElement).setAttribute("style", styles.footer.text);
      });
      footer.querySelectorAll(".red-footer-separator").forEach(el => {
        (el as HTMLElement).setAttribute("style", styles.footer.separator);
      });
    }

    // Title styles (h2, h3, h4-h6 -> base)
    container.querySelectorAll("h2, h3, h4, h5, h6").forEach(el => {
      const tag = el.tagName.toLowerCase();
      let titleStyle: { base: string; content: string; after: string };

      if (tag === "h2") titleStyle = styles.title.h2;
      else if (tag === "h3") titleStyle = styles.title.h3;
      else titleStyle = styles.title.base;

      (el as HTMLElement).setAttribute("style", `${titleStyle.base}; font-family: ${fontFamily};`);
      el.querySelector(".content")?.setAttribute("style", titleStyle.content);
      el.querySelector(".after")?.setAttribute("style", titleStyle.after);
    });

    // Paragraphs
    container.querySelectorAll("p:not(.red-blockquote-p)").forEach(el => {
      (el as HTMLElement).setAttribute("style", `${styles.paragraph}; font-family: ${fontFamily}; font-size: ${fontSize}px;`);
    });

    // Blockquotes
    container.querySelectorAll(".red-blockquote").forEach(el => {
      (el as HTMLElement).setAttribute("style", styles.quote);
    });
    container.querySelectorAll(".red-blockquote-p").forEach(el => {
      (el as HTMLElement).setAttribute("style", `font-family: ${fontFamily}; font-size: ${fontSize}px;`);
    });

    // Emphasis
    container.querySelectorAll(".red-emphasis strong").forEach(el => {
      (el as HTMLElement).setAttribute("style", styles.emphasis.strong);
    });
    container.querySelectorAll(".red-emphasis em").forEach(el => {
      (el as HTMLElement).setAttribute("style", styles.emphasis.em);
    });
    container.querySelectorAll(".red-del").forEach(el => {
      (el as HTMLElement).setAttribute("style", styles.emphasis.del);
    });

    // Lists
    container.querySelectorAll("ul, ol").forEach(el => {
      (el as HTMLElement).setAttribute("style", styles.list.container);
    });
    container.querySelectorAll("li").forEach(el => {
      (el as HTMLElement).setAttribute("style", `${styles.list.item}; font-family: ${fontFamily}; font-size: ${fontSize}px;`);
    });
    container.querySelectorAll(".red-task-list-item").forEach(el => {
      (el as HTMLElement).setAttribute("style", `${styles.list.taskList}; font-family: ${fontFamily}; font-size: ${fontSize}px;`);
    });

    // Code blocks
    container.querySelectorAll(".red-pre").forEach(el => {
      (el as HTMLElement).setAttribute("style", `${styles.code.block}; font-size: ${fontSize - 1}px;`);
    });
    container.querySelectorAll(".red-code-inline").forEach(el => {
      (el as HTMLElement).setAttribute("style", styles.code.inline);
    });

    // Images
    container.querySelectorAll(".red-image").forEach(el => {
      (el as HTMLElement).setAttribute("style", styles.image);
    });

    // Links
    container.querySelectorAll(".red-link").forEach(el => {
      (el as HTMLElement).setAttribute("style", styles.link);
    });

    // Tables
    container.querySelectorAll("table.red-table").forEach(el => {
      (el as HTMLElement).setAttribute("style", styles.table.container);
    });
    container.querySelectorAll("table.red-table th").forEach(el => {
      (el as HTMLElement).setAttribute("style", `${styles.table.header}; font-family: ${fontFamily}; font-size: ${fontSize}px;`);
    });
    container.querySelectorAll("table.red-table td").forEach(el => {
      (el as HTMLElement).setAttribute("style", `${styles.table.cell}; font-family: ${fontFamily}; font-size: ${fontSize}px;`);
    });

    // HR
    container.querySelectorAll(".red-hr").forEach(el => {
      (el as HTMLElement).setAttribute("style", styles.hr);
    });

    // Footnotes
    container.querySelectorAll(".red-footnote").forEach(el => {
      (el as HTMLElement).setAttribute("style", styles.footnote.ref);
    });
  }
}
