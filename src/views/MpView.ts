import { ItemView, WorkspaceLeaf, TFile, Notice } from "obsidian";
import { MarkdownParser } from "../markdown-parser";
import { HtmlRenderer } from "../html-renderer";
import { XimenSettings, DEFAULT_SETTINGS } from "../settings";
import { THEMES, THEME_IDS, THEME_NAMES } from "../styles";

export const VIEW_TYPE_MP = "ximen-mp-view";

export class MpView extends ItemView {
  private parser: MarkdownParser;
  private htmlRenderer: HtmlRenderer;
  private settings: XimenSettings;
  private currentFile: TFile | null = null;
  private mpContentEl: HTMLElement;
  private previewEl: HTMLElement;
  private themeSelect: HTMLSelectElement;

  constructor(leaf: WorkspaceLeaf, parser: MarkdownParser, htmlRenderer: HtmlRenderer, settings: XimenSettings) {
    super(leaf);
    this.parser = parser;
    this.htmlRenderer = htmlRenderer;
    this.settings = settings;
  }

  getViewType(): string {
    return VIEW_TYPE_MP;
  }

  getDisplayText(): string {
    return "公众号/头条号预览";
  }

  getIcon(): string {
    return "message-circle";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();

    // Toolbar
    const toolbar = container.createDiv({ cls: "mp-toolbar" });
    toolbar.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--background-modifier-border);flex-wrap:wrap;";

    toolbar.createSpan({ text: "样式: " });
    this.themeSelect = toolbar.createEl("select");
    this.themeSelect.style.cssText = "flex:1;min-width:120px;";
    for (const id of THEME_IDS) {
      const opt = this.themeSelect.createEl("option");
      opt.value = id;
      opt.textContent = THEME_NAMES[id];
    }
    this.themeSelect.value = this.settings.mpDefaultTheme;
    this.themeSelect.addEventListener("change", () => {
      this.settings.mpDefaultTheme = this.themeSelect.value;
      this.refresh();
    });

    const copyBtn = toolbar.createEl("button", { text: "复制 HTML" });
    copyBtn.style.cssText = "padding:4px 12px;cursor:pointer;";
    copyBtn.addEventListener("click", () => this.copyHtml());

    const exportBtn = toolbar.createEl("button", { text: "导出 HTML" });
    exportBtn.style.cssText = "padding:4px 12px;cursor:pointer;";
    exportBtn.addEventListener("click", () => this.exportHtml());

    const refreshBtn = toolbar.createEl("button", { text: "刷新" });
    refreshBtn.style.cssText = "padding:4px 12px;cursor:pointer;";
    refreshBtn.addEventListener("click", () => this.refresh());

    // Preview area
    this.previewEl = container.createDiv({ cls: "mp-preview" });
    this.previewEl.style.cssText = "padding:16px;overflow-y:auto;height:calc(100% - 50px);";

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
      this.previewEl.setText("请打开一个 Markdown 文件");
      return;
    }

    try {
      const md = await this.app.vault.cachedRead(this.currentFile);
      this.parser.setCurrentFile(this.currentFile.path);
      const parsed = await this.parser.parse(md, this.currentFile.path);
      const themedHtml = this.htmlRenderer.applyTheme(parsed.html, this.settings.mpDefaultTheme);
      this.previewEl.innerHTML = themedHtml;
    } catch (e) {
      this.previewEl.setText("渲染错误: " + e.message);
    }
  }

  async copyHtml(): Promise<void> {
    const html = this.previewEl.innerHTML;
    await this.htmlRenderer.copyHtmlToClipboard(html);
    new Notice("HTML 已复制到剪贴板");
  }

  async exportHtml(): Promise<void> {
    const html = this.previewEl.innerHTML;
    const fullHtml = this.htmlRenderer.exportHtmlFile(html);
    const filename = this.currentFile?.basename || "export";
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    new Notice("HTML 文件已导出");
  }

  async onClose(): Promise<void> {
    // Cleanup
  }
}

