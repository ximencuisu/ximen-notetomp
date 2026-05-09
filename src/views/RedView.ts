import { ItemView, WorkspaceLeaf, TFile, Notice } from "obsidian";
import { MarkdownParser } from "../markdown-parser";
import { RedRenderer, RedCardSection } from "../red-renderer";
import { ThemeManager } from "../theme-manager";
import { ExportManager } from "../export-manager";
import { XimenSettings } from "../settings";
import { RED_THEME_MAP, RED_THEMES } from "../templates/index";
import { BackgroundModal } from "./BackgroundModal";

export const VIEW_TYPE_RED = "ximen-red-view";

export class RedView extends ItemView {
  private parser: MarkdownParser;
  private redRenderer: RedRenderer;
  private themeManager: ThemeManager;
  private exportManager: ExportManager;
  private settings: XimenSettings;
  private currentFile: TFile | null = null;

  private previewContainer: HTMLElement;
  private contentContainer: HTMLElement;
  private navEl: HTMLElement;
  private themeSelect: HTMLSelectElement;
  private fontSizeInput: HTMLInputElement;
  private sections: RedCardSection[] = [];
  private currentIndex = 0;

  constructor(leaf: WorkspaceLeaf, parser: MarkdownParser, settings: XimenSettings) {
    super(leaf);
    this.parser = parser;
    this.redRenderer = new RedRenderer(parser);
    this.themeManager = new ThemeManager();
    this.exportManager = new ExportManager();
    this.settings = settings;
  }

  getViewType(): string {
    return VIEW_TYPE_RED;
  }

  getDisplayText(): string {
    return "小红书预览";
  }

  getIcon(): string {
    return "camera";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.style.cssText = "display:flex;flex-direction:column;height:100%;";

    // Toolbar
    const toolbar = container.createDiv({ cls: "red-toolbar" });
    toolbar.style.cssText = "display:flex;align-items:center;gap:6px;padding:6px 8px;border-bottom:1px solid var(--background-modifier-border);flex-wrap:wrap;font-size:12px;";

    // Background button
    const bgBtn = toolbar.createEl("button", { text: "🎨 背景" });
    bgBtn.style.cssText = "padding:2px 8px;cursor:pointer;font-size:12px;";
    bgBtn.addEventListener("click", () => {
      const modal = new BackgroundModal(this.app, this.settings, () => {
        this.applyThemeToCurrent();
        this.applyBackgroundOverride();
      });
      modal.open();
    });

    toolbar.createSpan({ text: "主题:" });
    this.themeSelect = toolbar.createEl("select");
    this.themeSelect.style.cssText = "max-width:100px;";
    for (const t of RED_THEMES) {
      const opt = this.themeSelect.createEl("option");
      opt.value = t.id;
      opt.textContent = t.name;
    }
    this.themeSelect.value = this.settings.redThemeId;
    this.themeSelect.addEventListener("change", () => {
      this.settings.redThemeId = this.themeSelect.value;
      this.applyThemeToCurrent();
    });

    toolbar.createSpan({ text: "字号:" });
    this.fontSizeInput = toolbar.createEl("input", { type: "number", value: String(this.settings.redFontSize) });
    this.fontSizeInput.style.cssText = "width:50px;";
    this.fontSizeInput.addEventListener("change", () => {
      this.settings.redFontSize = parseInt(this.fontSizeInput.value) || 16;
      this.applyThemeToCurrent();
    });

    // Navigation
    this.navEl = toolbar.createDiv();
    this.navEl.style.cssText = "margin-left:auto;display:flex;align-items:center;gap:4px;";

    const prevBtn = this.navEl.createEl("button", { text: "<" });
    prevBtn.style.cssText = "padding:2px 6px;cursor:pointer;";
    prevBtn.addEventListener("click", () => this.navigate(-1));

    const navSpan = this.navEl.createSpan({ text: " 0/0 " });

    const nextBtn = this.navEl.createEl("button", { text: ">" });
    nextBtn.style.cssText = "padding:2px 6px;cursor:pointer;";
    nextBtn.addEventListener("click", () => this.navigate(1));

    // Export buttons row
    const exportBar = container.createDiv({ cls: "red-export-bar" });
    exportBar.style.cssText = "display:flex;align-items:center;gap:4px;padding:4px 8px;border-bottom:1px solid var(--background-modifier-border);flex-wrap:wrap;";

    const mkBtn = (text: string, cb: () => void) => {
      const btn = exportBar.createEl("button", { text });
      btn.style.cssText = "padding:3px 8px;font-size:11px;cursor:pointer;";
      btn.addEventListener("click", cb);
      return btn;
    };

    mkBtn("导出 PNG", () => this.exportCurrentPng());
    mkBtn("批量 ZIP", () => this.exportBatchZip());
    mkBtn("复制图片", () => this.copyCurrentImage());
    mkBtn("复制文本", () => this.copyPlainText());

    // Card preview area
    const previewWrapper = container.createDiv({ cls: "red-preview-wrapper" });
    previewWrapper.style.cssText = "flex:1;display:flex;justify-content:center;align-items:flex-start;overflow-y:auto;padding:16px;background:var(--background-secondary);";

    this.previewContainer = previewWrapper.createDiv({ cls: "red-image-preview" });
    this.previewContainer.style.cssText = "width:360px;aspect-ratio:3/4;max-width:100%;border-radius:8px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.15);position:relative;background:#1c1c1e;";

    this.contentContainer = this.previewContainer.createDiv({ cls: "red-preview-content" });

    // Listen to file changes
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        if (file instanceof TFile) {
          this.currentFile = file;
          this.refresh();
        }
      })
    );

    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file === this.currentFile) {
          this.refresh();
        }
      })
    );

    // Initial render
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      this.currentFile = activeFile;
      await this.refresh();
    }
  }

  async refresh(): Promise<void> {
    if (!this.currentFile) {
      this.contentContainer.setText("请打开一个 Markdown 文件");
      return;
    }

    try {
      if (this.themeSelect) {
        this.themeSelect.value = this.settings.redThemeId;
      }
      if (this.fontSizeInput) {
        this.fontSizeInput.value = String(this.settings.redFontSize);
      }
      const md = await this.app.vault.cachedRead(this.currentFile);
      this.parser.setCurrentFile(this.currentFile.path);
      this.sections = await this.redRenderer.renderCards(md, this.currentFile.path, this.settings);
      this.currentIndex = 0;
      this.showCurrentPage();
      this.updateNav();
    } catch (e) {
      this.contentContainer.setText("渲染错误: " + (e as Error).message);
    }
  }

  private showCurrentPage(): void {
    if (this.sections.length === 0) {
      this.contentContainer.empty();
      return;
    }

    const section = this.sections[this.currentIndex];
    this.contentContainer.empty();
    this.contentContainer.innerHTML = [
      '<div class="red-preview-header">',
      '  <div class="red-user-info" style="display:flex;justify-content:space-between;align-items:center;padding:16px;">',
      '    <div style="display:flex;align-items:center;gap:10px;">',
      '      <div class="red-user-avatar" style="width:40px;height:40px;border-radius:50%;overflow:hidden;background:#2c2c2e;display:flex;align-items:center;justify-content:center;font-size:20px;">',
      this.settings.redUserAvatar
        ? '<img src="' + this.escapeHtml(this.settings.redUserAvatar) + '" style="width:100%;height:100%;object-fit:cover;" />'
        : "👤",
      "      </div>",
      '      <div>',
      '        <div class="red-user-name" style="font-size:16px;font-weight:600;">' + this.escapeHtml(this.settings.redUserName) + "</div>",
      '        <div class="red-user-id" style="font-size:13px;color:#98989d;">' + this.escapeHtml(this.settings.redUserId) + "</div>",
      "      </div>",
      "    </div>",
      this.settings.redShowTime
        ? '<div class="red-post-time" style="font-size:12px;color:#636366;">' + new Date().toLocaleDateString("zh-CN") + "</div>"
        : "",
      "  </div>",
      "</div>",
      '<div class="red-preview-content-inner" style="padding:0 16px 60px;">',
      section.content,
      "</div>",
      '<div class="red-preview-footer" style="position:absolute;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:12px;padding:12px;border-top:1px solid #2c2c2e;background:#1c1c1e;font-size:12px;color:#98989d;">',
      '<span class="red-footer-text">' + this.escapeHtml(this.settings.redFooterLeft) + "</span>",
      '<span class="red-footer-separator" style="color:#636366;">|</span>',
      '<span class="red-footer-text">' + this.escapeHtml(this.settings.redFooterRight) + "</span>",
      "</div>",
    ].join("\n");

    this.applyThemeToCurrent();
    this.applyBackgroundOverride();
  }

  private applyThemeToCurrent(): void {
    const theme = RED_THEME_MAP[this.settings.redThemeId];
    if (theme) {
      this.themeManager.applyTheme(this.previewContainer, theme.styles, this.settings.redFontSize, this.settings.redFontFamily);
    }
  }

  private applyBackgroundOverride(): void {
    const container = this.previewContainer;
    if (!container) return;

    if (this.settings.redBackgroundColor) {
      container.style.backgroundColor = this.settings.redBackgroundColor;
      const footer = container.querySelector(".red-preview-footer") as HTMLElement;
      if (footer) {
        footer.style.background = this.settings.redBackgroundColor;
      }
    }

    if (this.settings.redBackgroundImage) {
      container.style.backgroundImage = `url(${this.settings.redBackgroundImage})`;
      container.style.backgroundSize = `${this.settings.redBackgroundScale * 100}%`;
      container.style.backgroundPosition = `${this.settings.redBackgroundPositionX}% ${this.settings.redBackgroundPositionY}%`;
      container.style.backgroundRepeat = "no-repeat";
    }
  }

  private navigate(delta: number): void {
    const newIndex = this.currentIndex + delta;
    if (newIndex >= 0 && newIndex < this.sections.length) {
      this.currentIndex = newIndex;
      this.showCurrentPage();
      this.updateNav();
    }
  }

  private updateNav(): void {
    this.navEl.empty();
    const prevBtn = this.navEl.createEl("button", { text: "<" });
    prevBtn.style.cssText = "padding:2px 6px;cursor:pointer;";
    prevBtn.addEventListener("click", () => this.navigate(-1));

    this.navEl.createSpan({ text: " " + (this.currentIndex + 1) + "/" + this.sections.length + " " });

    const nextBtn = this.navEl.createEl("button", { text: ">" });
    nextBtn.style.cssText = "padding:2px 6px;cursor:pointer;";
    nextBtn.addEventListener("click", () => this.navigate(1));
  }

  private async exportCurrentPng(): Promise<void> {
    const filename = (this.currentFile?.basename || "export") + "_" + (this.currentIndex + 1);
    await this.exportManager.downloadSingle(this.previewContainer, filename);
    new Notice("PNG 已导出");
  }

  private async exportBatchZip(): Promise<void> {
    const captureEls: HTMLElement[] = [];
    for (let i = 0; i < this.sections.length; i++) {
      this.currentIndex = i;
      this.showCurrentPage();
      await new Promise(r => setTimeout(r, 100));
      const clone = this.previewContainer.cloneNode(true) as HTMLElement;
      const style = this.previewContainer.getAttribute("style") || "";
      clone.style.cssText = style + ";position:absolute;left:-9999px;top:0;";
      document.body.appendChild(clone);
      captureEls.push(clone);
    }

    await this.exportManager.downloadBatch(captureEls, this.currentFile?.basename || "export");

    for (const el of captureEls) {
      document.body.removeChild(el);
    }

    this.currentIndex = 0;
    this.showCurrentPage();
    this.updateNav();
    new Notice("ZIP 已导出");
  }

  private async copyCurrentImage(): Promise<void> {
    const ok = await this.exportManager.copyImageToClipboard(this.previewContainer);
    new Notice(ok ? "图片已复制到剪贴板" : "复制失败");
  }

  private async copyPlainText(): Promise<void> {
    const text = this.redRenderer.cardToPlainText(this.sections);
    const ok = await this.exportManager.copyTextToClipboard(text);
    new Notice(ok ? "文本已复制到剪贴板" : "复制失败");
  }

  private escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  async onClose(): Promise<void> {
    // Cleanup
  }
}
