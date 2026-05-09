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

const IMAGE_PRESETS = [
    { name: "无图片", value: "" },
    { name: "暖阳", value: "linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 50%, #FFF5F0 100%)" },
    { name: "樱花", value: "linear-gradient(135deg, #FFB7C5 0%, #FFDDE1 50%, #FFF0F5 100%)" },
    { name: "薄荷", value: "linear-gradient(135deg, #A8E6CF 0%, #DCEDC1 50%, #FFF9E6 100%)" },
    { name: "天空", value: "linear-gradient(135deg, #89CFF0 0%, #B8D4E3 50%, #E8F4FD 100%)" },
    { name: "晚霞", value: "linear-gradient(135deg, #F093FB 0%, #F5576C 50%, #FF9A76 100%)" },
    { name: "星空", value: "linear-gradient(135deg, #0C0D2D 0%, #1A1A4E 50%, #2D1B69 100%)" },
    { name: "森林", value: "linear-gradient(135deg, #134E5E 0%, #2C7873 50%, #71B280 100%)" },
    { name: "沙漠", value: "linear-gradient(135deg, #C2956A 0%, #E0C097 50%, #F5E6D0 100%)" },
    { name: "海洋", value: "linear-gradient(135deg, #005C97 0%, #363795 50%, #005C97 100%)" },
    { name: "晨曦", value: "linear-gradient(135deg, #F6D365 0%, #FDA085 50%, #F6D365 100%)" },
    { name: "紫梦", value: "linear-gradient(135deg, #A18CD1 0%, #FBC2EB 50%, #A18CD1 100%)" },
    { name: "墨韵", value: "linear-gradient(135deg, #2C3E50 0%, #4CA1AF 50%, #2C3E50 100%)" },
    { name: "秋叶", value: "linear-gradient(135deg, #D4A574 0%, #C0392B 50%, #F39C12 100%)" },
    { name: "极光", value: "linear-gradient(135deg, #43E97B 0%, #38F9D7 30%, #4FACFE 70%, #667EEA 100%)" },
    { name: "玫瑰金", value: "linear-gradient(135deg, #B76E79 0%, #E8C8C8 50%, #F5E6E0 100%)" },
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
        contentEl.style.cssText = "padding: 20px; max-width: 460px; max-height: 80vh; overflow-y: auto;";

        contentEl.createEl("h3", { text: "背景设置" });

        this.renderColorSection(contentEl);
        this.renderImageSection(contentEl);
        this.renderAdjustSection(contentEl);
        this.renderActions(contentEl);
    }

    private renderColorSection(contentEl: HTMLElement): void {
        contentEl.createEl("h4", { text: "背景颜色" });

        const presetGrid = contentEl.createDiv();
        presetGrid.style.cssText = "display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 12px;";

        for (const preset of BACKGROUND_PRESETS) {
            const swatch = presetGrid.createDiv();
            swatch.style.cssText = "width: 100%; aspect-ratio: 1; border-radius: 6px; cursor: pointer; border: 2px solid transparent; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #666; transition: border-color 0.15s, transform 0.1s;";

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
    }

    private renderImageSection(contentEl: HTMLElement): void {
        contentEl.createEl("h4", { text: "背景图片" });

        const presetGrid = contentEl.createDiv();
        presetGrid.style.cssText = "display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 12px;";

        for (const preset of IMAGE_PRESETS) {
            const card = presetGrid.createDiv();
            card.style.cssText = "border-radius: 6px; cursor: pointer; border: 2px solid transparent; overflow: hidden; transition: border-color 0.15s, transform 0.1s;";

            const preview = card.createDiv();
            preview.style.cssText = "width: 100%; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #666;";

            if (preset.value === "") {
                preview.style.background = "repeating-linear-gradient(45deg, transparent, transparent 4px, #ddd 4px, #ddd 8px)";
                preview.setText("无图片");
                preview.style.color = "#999";
                preview.style.fontSize = "9px";
            } else {
                preview.style.background = preset.value;
                const label = card.createDiv({ text: preset.name });
                label.style.cssText = "text-align: center; padding: 2px 0; font-size: 10px; color: var(--text-muted); background: var(--background-primary);";
            }

            const currentImage = this.settings.redBackgroundImage;
            const isMatch = (preset.value === "" && !currentImage) || currentImage === preset.value;
            if (isMatch) {
                card.style.borderColor = "var(--interactive-accent)";
                card.style.transform = "scale(1.03)";
            }

            card.addEventListener("mouseenter", () => {
                card.style.borderColor = "var(--interactive-accent)";
            });
            card.addEventListener("mouseleave", () => {
                if (!isMatch) {
                    card.style.borderColor = "transparent";
                }
            });

            card.addEventListener("click", () => {
                this.settings.redBackgroundImage = preset.value;
                this.onSave();
                this.onOpen();
            });
        }

        const uploadRow = contentEl.createDiv();
        uploadRow.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 8px;";
        uploadRow.createSpan({ text: "上传:" });
        const fileInput = uploadRow.createEl("input", { type: "file", attr: { accept: "image/*" } });
        fileInput.style.cssText = "flex: 1; font-size: 12px;";
        fileInput.addEventListener("change", async (e) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) return;
            try {
                const dataUrl = await this.readFileAsDataUrl(file);
                this.settings.redBackgroundImage = dataUrl;
                this.onSave();
                this.onOpen();
            } catch (err) {
                console.error("Failed to read image file", err);
            }
        });

        const urlRow = contentEl.createDiv();
        urlRow.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 8px;";
        urlRow.createSpan({ text: "URL:" });
        const imgInput = urlRow.createEl("input", { type: "text", placeholder: "图片 URL 或路径" });
        imgInput.value = this.isDataUrl(this.settings.redBackgroundImage) ? "" : (this.settings.redBackgroundImage || "");
        imgInput.style.cssText = "flex: 1; padding: 4px 8px; font-size: 13px;";
        const applyImgBtn = urlRow.createEl("button", { text: "应用" });
        applyImgBtn.style.cssText = "padding: 4px 10px; font-size: 12px;";
        applyImgBtn.addEventListener("click", () => {
            const val = imgInput.value.trim();
            if (val) {
                this.settings.redBackgroundImage = val;
            }
            this.onSave();
            this.onOpen();
        });

        if (this.settings.redBackgroundImage) {
            const currentRow = contentEl.createDiv();
            currentRow.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 12px; color: var(--text-muted);";
            currentRow.createSpan({ text: "当前:" });
            const label = this.isDataUrl(this.settings.redBackgroundImage)
                ? "已上传图片"
                : this.settings.redBackgroundImage.startsWith("linear-gradient")
                    ? "渐变预设"
                    : this.settings.redBackgroundImage;
            currentRow.createSpan({ text: label.length > 40 ? label.substring(0, 40) + "..." : label });
            const clearImgBtn = currentRow.createEl("button", { text: "清除图片" });
            clearImgBtn.style.cssText = "padding: 2px 8px; font-size: 11px;";
            clearImgBtn.addEventListener("click", () => {
                this.settings.redBackgroundImage = "";
                this.onSave();
                this.onOpen();
            });
        }
    }

    private renderAdjustSection(contentEl: HTMLElement): void {
        if (!this.settings.redBackgroundImage) return;

        contentEl.createEl("h4", { text: "图片调整" });

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
        contentEl.appendChild(scaleRow);

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
        contentEl.appendChild(posXRow);

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
        contentEl.appendChild(posYRow);
    }

    private renderActions(contentEl: HTMLElement): void {
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

    private isDataUrl(str: string): boolean {
        return str.startsWith("data:");
    }

    private readFileAsDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}
