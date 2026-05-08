import { Plugin, WorkspaceLeaf, Notice } from "obsidian";
import { XimenSettings, DEFAULT_SETTINGS } from "./settings";
import { XimenSettingTab } from "./setting-tab";
import { MarkdownParser } from "./markdown-parser";
import { HtmlRenderer } from "./html-renderer";
import { MpView, VIEW_TYPE_MP } from "./views/MpView";
import { RedView, VIEW_TYPE_RED } from "./views/RedView";
import "./styles.css";

export default class XimenNoteToMp extends Plugin {
  settings: XimenSettings;
  private parser: MarkdownParser;
  private htmlRenderer: HtmlRenderer;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.parser = new MarkdownParser(this.app.vault, this.app);
    this.htmlRenderer = new HtmlRenderer();

    this.addStyleTag();

    this.registerView(VIEW_TYPE_MP, (leaf) => {
      return new MpView(leaf, this.parser, this.htmlRenderer, this.settings);
    });

    this.registerView(VIEW_TYPE_RED, (leaf) => {
      return new RedView(leaf, this.parser, this.settings);
    });

    this.addRibbonIcon("message-circle", "打开公众号/头条号预览", () => {
      this.openMpView();
    });

    this.addRibbonIcon("camera", "打开小红书预览", () => {
      this.openRedView();
    });

    this.addCommand({
      id: "open-mp-preview",
      name: "打开公众号/头条号预览",
      callback: () => this.openMpView(),
    });

    this.addCommand({
      id: "open-red-preview",
      name: "打开小红书预览",
      callback: () => this.openRedView(),
    });

    this.addCommand({
      id: "copy-mp-html",
      name: "复制公众号/头条号 HTML",
      callback: async () => {
        const view = await this.getMpView();
        if (view) {
          await view.copyHtml();
        } else {
          new Notice("请先打开公众号/头条号预览");
        }
      },
    });

    this.addSettingTab(new XimenSettingTab(this.app, this));
  }

  addStyleTag(): void {
    const style = document.createElement("style");
    style.textContent = `
      .mp-toolbar button:hover,
      .red-toolbar button:hover,
      .red-export-bar button:hover {
        background: var(--interactive-accent);
        color: var(--text-on-accent);
      }
      .red-image-preview { position: relative; overflow: hidden; }
      .red-preview-content-inner { min-height: 200px; }
      .note-callout { margin: 16px 0; padding: 12px 16px; border-radius: 4px; border-left: 4px solid; }
      .note-callout-title-wrap { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-weight: 600; }
      .note-callout-icon { display: inline-flex; align-items: center; }
      .note-callout-icon svg { width: 18px; height: 18px; }
      .note-callout-content > :first-child { margin-top: 0; }
      .note-callout-content > :last-child { margin-bottom: 0; }
      .note-callout-note, .note-callout-info, .note-callout-todo { border-left-color: rgb(8, 109, 221); background: rgba(8, 109, 221, 0.1); }
      .note-callout-abstract, .note-callout-tip, .note-callout-hint { border-left-color: rgb(0, 176, 255); background: rgba(0, 176, 255, 0.1); }
      .note-callout-success, .note-callout-done, .note-callout-check { border-left-color: rgb(0, 200, 83); background: rgba(0, 200, 83, 0.1); }
      .note-callout-question, .note-callout-help { border-left-color: rgb(255, 193, 7); background: rgba(255, 193, 7, 0.1); }
      .note-callout-warning, .note-callout-caution, .note-callout-attention { border-left-color: rgb(255, 152, 0); background: rgba(255, 152, 0, 0.1); }
      .note-callout-failure, .note-callout-fail, .note-callout-missing, .note-callout-danger, .note-callout-error, .note-callout-bug { border-left-color: rgb(255, 69, 58); background: rgba(255, 69, 58, 0.1); }
      .note-callout-example { border-left-color: rgb(156, 39, 176); background: rgba(156, 39, 176, 0.1); }
      .note-callout-quote, .note-callout-cite { border-left-color: rgb(158, 158, 158); background: rgba(158, 158, 158, 0.1); }
      blockquote.note-embed { border-left: 3px solid var(--background-modifier-border); margin: 12px 0; padding: 8px 16px; background: var(--background-primary-alt); }
    `;
    document.head.appendChild(style);
  }

  async loadSettings(): Promise<void> {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.refreshViews();
  }

  private refreshViews(): void {
    this.app.workspace.getLeavesOfType(VIEW_TYPE_MP).forEach(leaf => {
      const view = leaf.view as MpView;
      view.refresh();
    });
    this.app.workspace.getLeavesOfType(VIEW_TYPE_RED).forEach(leaf => {
      const view = leaf.view as RedView;
      view.refresh();
    });
  }

  async openMpView(): Promise<void> {
    const leaf = this.app.workspace.getLeaf("split", "vertical");
    await leaf.setViewState({
      type: VIEW_TYPE_MP,
      active: true,
    });
    this.app.workspace.revealLeaf(leaf);
  }

  async openRedView(): Promise<void> {
    const leaf = this.app.workspace.getLeaf("split", "vertical");
    await leaf.setViewState({
      type: VIEW_TYPE_RED,
      active: true,
    });
    this.app.workspace.revealLeaf(leaf);
  }

  async getMpView(): Promise<MpView | null> {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_MP);
    if (leaves.length > 0) {
      return leaves[0].view as MpView;
    }
    return null;
  }

  onunload(): void {
    this.app.workspace.getLeavesOfType(VIEW_TYPE_MP).forEach(leaf => leaf.detach());
    this.app.workspace.getLeavesOfType(VIEW_TYPE_RED).forEach(leaf => leaf.detach());
  }
}
