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
      .setName("用户头像")
      .setDesc("卡片头部显示的用户头像，留空使用默认图标")
      .addText(text => {
        text.setValue(this.plugin.settings.redUserAvatar.startsWith("data:") ? "(已上传图片)" : this.plugin.settings.redUserAvatar);
        text.setPlaceholder("头像图片 URL");
        text.onChange(async (value) => {
          if (value !== "(已上传图片)") {
            this.plugin.settings.redUserAvatar = value;
            await this.plugin.saveSettings();
          }
        });
      })
      .addButton(btn => {
        btn.setButtonText("上传");
        btn.onClick(() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async () => {
              this.plugin.settings.redUserAvatar = reader.result as string;
              await this.plugin.saveSettings();
              this.display();
            };
            reader.readAsDataURL(file);
          };
          input.click();
        });
      })
      .addButton(btn => {
        btn.setButtonText("清除");
        btn.onClick(async () => {
          this.plugin.settings.redUserAvatar = "";
          await this.plugin.saveSettings();
          this.display();
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

    containerEl.createEl("h4", { text: "背景设置" });

    new Setting(containerEl)
      .setName("背景颜色")
      .setDesc("自定义卡片背景颜色（如 #FFFAF0），留空使用主题默认")
      .addText(text => {
        text.setValue(this.plugin.settings.redBackgroundColor);
        text.onChange(async (value) => {
          this.plugin.settings.redBackgroundColor = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("背景图片")
      .setDesc("卡片背景图片 URL 或路径，留空不使用")
      .addText(text => {
        text.setValue(this.plugin.settings.redBackgroundImage);
        text.onChange(async (value) => {
          this.plugin.settings.redBackgroundImage = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("背景缩放")
      .setDesc("背景图片缩放比例")
      .addSlider(slider => {
        slider.setLimits(50, 300, 10);
        slider.setValue(this.plugin.settings.redBackgroundScale * 100);
        slider.setDynamicTooltip();
        slider.onChange(async (value) => {
          this.plugin.settings.redBackgroundScale = value / 100;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("背景位置 X")
      .setDesc("背景图片水平位置 (%)")
      .addSlider(slider => {
        slider.setLimits(0, 100, 1);
        slider.setValue(this.plugin.settings.redBackgroundPositionX);
        slider.setDynamicTooltip();
        slider.onChange(async (value) => {
          this.plugin.settings.redBackgroundPositionX = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("背景位置 Y")
      .setDesc("背景图片垂直位置 (%)")
      .addSlider(slider => {
        slider.setLimits(0, 100, 1);
        slider.setValue(this.plugin.settings.redBackgroundPositionY);
        slider.setDynamicTooltip();
        slider.onChange(async (value) => {
          this.plugin.settings.redBackgroundPositionY = value;
          await this.plugin.saveSettings();
        });
      });
  }
}
