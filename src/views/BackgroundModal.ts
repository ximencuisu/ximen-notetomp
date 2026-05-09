import { App, Modal } from "obsidian";
import { XimenSettings } from "../settings";

const BACKGROUND_PRESETS = [
    { name: "默认", color: "" },
    { name: "纯白", color: "#FFFFFF" },
    { name: "米白", color: "#FAFAFA" },
    { name: "奶油", color: "#FFFAF0" },
    { name: "象牙", color: "#FFFFF0" },
    { name: "淡粉", color: "#FFF5F7" },
    { name: "浅杏", color: "#FFF0E6" },
    { name: "薄荷", color: "#F0FFF4" },
    { name: "浅蓝", color: "#F0F8FF" },
    { name: "淡紫", color: "#F8F0FF" },
    { name: "暖黄", color: "#FFFDE7" },
    { name: "浅绿", color: "#F1F8E9" },
    { name: "桃色", color: "#FED7AA" },
    { name: "粉色", color: "#FED7E2" },
    { name: "天蓝", color: "#BAE6FD" },
    { name: "薄荷绿", color: "#A7F3D0" },
    { name: "淡黄", color: "#FEF08A" },
    { name: "浅橙", color: "#FDBA74" },
    { name: "暖橙", color: "#ED8936" },
    { name: "珊瑚", color: "#F87171" },
    { name: "亮红", color: "#E53E3E" },
    { name: "亮黄", color: "#F6E05E" },
    { name: "旧纸", color: "#F5E6D3" },
    { name: "棕褐", color: "#E8DCC8" },
    { name: "深灰", color: "#2D2D2D" },
    { name: "黑板", color: "#1A1A1A" },
    { name: "深黑", color: "#121212" },
    { name: "纯黑", color: "#000000" },
    { name: "深蓝", color: "#1E3A5F" },
    { name: "墨绿", color: "#1C2B1C" },
];

export class BackgroundModal extends Modal {
    private settings: XimenSettings;
    private onSave: () => void;

    constructor(app: App, settings: XimenSettings, onSave: () => void) {
        super(app);
        this.settings = settings;
        this.onSave = onSave;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.style.cssText = "padding: 20px; max-width: 420px;";

        contentEl.createEl("h3", { text: "背景设置" });

        contentEl.createEl("h4", { text: "背景颜色" });

        const presetGrid = contentEl.createDiv();
        presetGrid.style.cssText = "display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 12px;";

        for (const preset of BACKGROUND_PRESETS) {
            const swatch = presetGrid.createDiv();
            swatch.style.cssText = `width: 100%; aspect-ratio: 1; border-radius: 6px; cursor: pointer; border: 2px solid transparent; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #666; transition: border-color 0.15s, transform 0.1s; position: relative;`;

            if (preset.color === "") {
                swatch.style.background = "linear-gradient(135deg, #fff 45%, #ddd 50%, #fff 55%)";
                swatch.setText("默认");
                swatch.style.color = "#999";
                swatch.style.fontSize = "9px";
            } else {
                swatch.style.backgroundColor = preset.color;
                const brightness = this.getColorBrightness(preset.color);
                if (brightness < 128) {
                    swatch.style.color = "#fff";
                }
                swatch.setText(preset.name);
            }

            if (this.settings.redBackgroundColor === preset.color) {
                swatch.style.borderColor = "var(--interactive-accent)";
                swatch.style.transform = "scale(1.05)";
            }

            swatch.addEventListener("mouseenter", () => {
                swatch.style.borderColor = "var(--interactive-accent)";
            });
            swatch.addEventListener("mouseleave", () => {
                if (this.settings.redBackgroundColor !== preset.color) {
                    swatch.style.borderColor = "transparent";
                }
            });

            swatch.addEventListener("click", () => {
                this.settings.redBackgroundColor = preset.color;
                this.onSave();
                this.onOpen();
            });
        }

        const customRow = contentEl.createDiv();
        customRow.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 16px;";
        customRow.createSpan({ text: "自定义:" });
        const colorInput = customRow.createEl("input", { type: "text", placeholder: "#FFFAF0 或 rgb(...)" });
        colorInput.value = this.settings.redBackgroundColor;
        colorInput.style.cssText = "flex: 1; padding: 4px 8px; font-size: 13px;";
        const colorPreview = customRow.createDiv();
        colorPreview.style.cssText = `width: 28px; height: 28px; border-radius: 4px; border: 1px solid var(--background-modifier-border); background: ${this.settings.redBackgroundColor || "transparent"};`;
        const applyColorBtn = customRow.createEl("button", { text: "应用" });
        applyColorBtn.style.cssText = "padding: 4px 10px; font-size: 12px;";
        applyColorBtn.addEventListener("click", () => {
            this.settings.redBackgroundColor = colorInput.value.trim();
            this.onSave();
            this.onOpen();
        });

        contentEl.createEl("h4", { text: "背景图片" });

        const imgRow = contentEl.createDiv();
        imgRow.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 8px;";
        imgRow.createSpan({ text: "URL:" });
        const imgInput = imgRow.createEl("input", { type: "text", placeholder: "图片 URL 或路径" });
        imgInput.value = this.settings.redBackgroundImage;
        imgInput.style.cssText = "flex: 1; padding: 4px 8px; font-size: 13px;";
        const applyImgBtn = imgRow.createEl("button", { text: "应用" });
        applyImgBtn.style.cssText = "padding: 4px 10px; font-size: 12px;";
        applyImgBtn.addEventListener("click", () => {
            this.settings.redBackgroundImage = imgInput.value.trim();
            this.onSave();
            this.onOpen();
        });

        if (this.settings.redBackgroundImage) {
            const scaleRow = contentEl.createDiv();
            scaleRow.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 6px;";
            scaleRow.createSpan({ text: "缩放:" });
            const scaleSlider = scaleRow.createEl("input", { type: "range" });
            scaleSlider.min = "50";
            scaleSlider.max = "300";
            scaleSlider.step = "10";
            scaleSlider.value = String(this.settings.redBackgroundScale * 100);
            scaleSlider.style.cssText = "flex: 1;";
            const scaleVal = scaleRow.createSpan({ text: `${Math.round(this.settings.redBackgroundScale * 100)}%` });
            scaleVal.style.cssText = "min-width: 36px; text-align: right; font-size: 12px;";
            scaleSlider.addEventListener("input", () => {
                scaleVal.setText(`${scaleSlider.value}%`);
            });
            scaleSlider.addEventListener("change", () => {
                this.settings.redBackgroundScale = parseInt(scaleSlider.value) / 100;
                this.onSave();
            });

            const posXRow = contentEl.createDiv();
            posXRow.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 6px;";
            posXRow.createSpan({ text: "位置 X:" });
            const posXSlider = posXRow.createEl("input", { type: "range" });
            posXSlider.min = "0";
            posXSlider.max = "100";
            posXSlider.step = "1";
            posXSlider.value = String(this.settings.redBackgroundPositionX);
            posXSlider.style.cssText = "flex: 1;";
            const posXVal = posXRow.createSpan({ text: `${this.settings.redBackgroundPositionX}%` });
            posXVal.style.cssText = "min-width: 36px; text-align: right; font-size: 12px;";
            posXSlider.addEventListener("input", () => {
                posXVal.setText(`${posXSlider.value}%`);
            });
            posXSlider.addEventListener("change", () => {
                this.settings.redBackgroundPositionX = parseInt(posXSlider.value);
                this.onSave();
            });

            const posYRow = contentEl.createDiv();
            posYRow.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 6px;";
            posYRow.createSpan({ text: "位置 Y:" });
            const posYSlider = posYRow.createEl("input", { type: "range" });
            posYSlider.min = "0";
            posYSlider.max = "100";
            posYSlider.step = "1";
            posYSlider.value = String(this.settings.redBackgroundPositionY);
            posYSlider.style.cssText = "flex: 1;";
            const posYVal = posYRow.createSpan({ text: `${this.settings.redBackgroundPositionY}%` });
            posYVal.style.cssText = "min-width: 36px; text-align: right; font-size: 12px;";
            posYSlider.addEventListener("input", () => {
                posYVal.setText(`${posYSlider.value}%`);
            });
            posYSlider.addEventListener("change", () => {
                this.settings.redBackgroundPositionY = parseInt(posYSlider.value);
                this.onSave();
            });

            contentEl.appendChild(scaleRow);
            contentEl.appendChild(posXRow);
            contentEl.appendChild(posYRow);
        }

        const actionRow = contentEl.createDiv();
        actionRow.style.cssText = "display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end;";

        const resetBtn = actionRow.createEl("button", { text: "重置背景" });
        resetBtn.style.cssText = "padding: 6px 14px; font-size: 12px;";
        resetBtn.addEventListener("click", () => {
            this.settings.redBackgroundColor = "";
            this.settings.redBackgroundImage = "";
            this.settings.redBackgroundScale = 1;
            this.settings.redBackgroundPositionX = 0;
            this.settings.redBackgroundPositionY = 0;
            this.onSave();
            this.onOpen();
        });

        const closeBtn = actionRow.createEl("button", { text: "关闭" });
        closeBtn.style.cssText = "padding: 6px 14px; font-size: 12px;";
        closeBtn.addEventListener("click", () => {
            this.close();
        });
    }

    onClose(): void {
        this.contentEl.empty();
    }

    private getColorBrightness(hex: string): number {
        try {
            let r = 0, g = 0, b = 0;
            if (hex.startsWith("#")) {
                const clean = hex.replace("#", "");
                if (clean.length === 3) {
                    r = parseInt(clean[0] + clean[0], 16);
                    g = parseInt(clean[1] + clean[1], 16);
                    b = parseInt(clean[2] + clean[2], 16);
                } else if (clean.length === 6) {
                    r = parseInt(clean.substring(0, 2), 16);
                    g = parseInt(clean.substring(2, 4), 16);
                    b = parseInt(clean.substring(4, 6), 16);
                }
            }
            return (r * 299 + g * 587 + b * 114) / 1000;
        } catch {
            return 255;
        }
    }
}
