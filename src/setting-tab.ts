import { App, PluginSettingTab, Setting } from "obsidian";
import { XimenSettings, DEFAULT_SETTINGS } from "./settings";
import XimenNoteToMp from "./main";
import { THEME_IDS, THEME_NAMES } from "./styles";
import { RED_THEMES } from "./templates/index";

export class XimenSettingTab extends PluginSettingTab {
  private plugin: XimenNoteToMp;

  constructor(app: App, plugin: XimenNoteToMp) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "西门发布助手设置" });

    // === 公众号/头条号设置 ===
    containerEl.createEl("h3", { text: "公众号/头条号" });

    new Setting(containerEl)
      .setName("默认样式")
      .setDesc("公众号/头条号 HTML 输出的默认样式主题")
      .addDropdown(dropdown => {
        for (const id of THEME_IDS) {
          dropdown.addOption(id, THEME_NAMES[id]);
        }
        dropdown.setValue(this.plugin.settings.mpDefaultTheme);
        dropdown.onChange(async (value) => {
          this.plugin.settings.mpDefaultTheme = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("显示代码行号")
      .setDesc("在代码块中显示行号")
      .addToggle(toggle => {
        toggle.setValue(this.plugin.settings.showLineNumbers);
        toggle.onChange(async (value) => {
          this.plugin.settings.showLineNumbers = value;
          await this.plugin.saveSettings();
        });
      });

    // === 小红书设置 ===
    containerEl.createEl("h3", { text: "小红书" });

    new Setting(containerEl)
      .setName("卡片主题")
      .setDesc("小红书卡片图片的默认主题")
      .addDropdown(dropdown => {
        for (const t of RED_THEMES) {
          dropdown.addOption(t.id, t.name);
        }
        dropdown.setValue(this.plugin.settings.redThemeId);
        dropdown.onChange(async (value) => {
          this.plugin.settings.redThemeId = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("分段标题级别")
      .setDesc("按几级标题将内容分段（h1 或 h2）")
      .addDropdown(dropdown => {
        dropdown.addOption("h1", "H1 (#)");
        dropdown.addOption("h2", "H2 (##)");
        dropdown.setValue(this.plugin.settings.redHeadingLevel);
        dropdown.onChange(async (value) => {
          this.plugin.settings.redHeadingLevel = value as "h1" | "h2";
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("字体大小")
      .setDesc("卡片正文字体大小 (12-30)")
      .addSlider(slider => {
        slider.setLimits(12, 30, 1);
        slider.setValue(this.plugin.settings.redFontSize);
        slider.onChange(async (value) => {
          this.plugin.settings.redFontSize = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("用户名")
      .setDesc("卡片头部显示的用户名")
      .addText(text => {
        text.setValue(this.plugin.settings.redUserName);
        text.onChange(async (value) => {
          this.plugin.settings.redUserName = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("用户 ID")
      .setDesc("卡片头部显示的用户 ID（如 @ximen）")
      .addText(text => {
        text.setValue(this.plugin.settings.redUserId);
        text.onChange(async (value) => {
          this.plugin.settings.redUserId = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("左侧页脚文字")
      .setDesc("卡片底部左侧文字")
      .addText(text => {
        text.setValue(this.plugin.settings.redFooterLeft);
        text.onChange(async (value) => {
          this.plugin.settings.redFooterLeft = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("右侧页脚文字")
      .setDesc("卡片底部右侧文字")
      .addText(text => {
        text.setValue(this.plugin.settings.redFooterRight);
        text.onChange(async (value) => {
          this.plugin.settings.redFooterRight = value;
          await this.plugin.saveSettings();
        });
      });
  }
}
