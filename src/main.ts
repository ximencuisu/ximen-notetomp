import { Plugin, WorkspaceLeaf, Notice } from "obsidian";
import { XimenSettings, DEFAULT_SETTINGS } from "./settings";
import { XimenSettingTab } from "./setting-tab";
import { MarkdownParser } from "./markdown-parser";
import { HtmlRenderer } from "./html-renderer";
import { MpView, VIEW_TYPE_MP } from "./views/MpView";
import { RedView, VIEW_TYPE_RED } from "./views/RedView";

export default class XimenNoteToMp extends Plugin {
  settings: XimenSettings;
  private parser: MarkdownParser;
  private htmlRenderer: HtmlRenderer;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.parser = new MarkdownParser(this.app.vault, this.app);
    this.htmlRenderer = new HtmlRenderer();

    // Register 公众号/头条号 view
    this.registerView(VIEW_TYPE_MP, (leaf) => {
      return new MpView(leaf, this.parser, this.htmlRenderer, this.settings);
    });

    // Register 小红书 view
    this.registerView(VIEW_TYPE_RED, (leaf) => {
      return new RedView(leaf, this.parser, this.settings);
    });

    // Ribbon icon for 公众号
    this.addRibbonIcon("message-circle", "打开公众号/头条号预览", () => {
      this.openMpView();
    });

    // Ribbon icon for 小红书
    this.addRibbonIcon("camera", "打开小红书预览", () => {
      this.openRedView();
    });

    // Commands
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

    // Settings tab
    this.addSettingTab(new XimenSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
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
    // Cleanup views
    this.app.workspace.getLeavesOfType(VIEW_TYPE_MP).forEach(leaf => leaf.detach());
    this.app.workspace.getLeavesOfType(VIEW_TYPE_RED).forEach(leaf => leaf.detach());
  }
}

