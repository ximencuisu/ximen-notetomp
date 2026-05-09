import { App, Modal } from "obsidian";
import { XimenSettings } from "../settings";

export class AvatarModal extends Modal {
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
        contentEl.style.cssText = "padding: 20px; max-width: 360px;";

        contentEl.createEl("h3", { text: "头像设置" });

        const previewRow = contentEl.createDiv();
        previewRow.style.cssText = "display: flex; align-items: center; gap: 16px; margin-bottom: 16px;";
        const avatarBox = previewRow.createDiv();
        avatarBox.style.cssText = "width: 60px; height: 60px; border-radius: 50%; overflow: hidden; background: #2c2c2e; display: flex; align-items: center; justify-content: center; font-size: 30px; border: 2px solid var(--background-modifier-border);";
        if (this.settings.redUserAvatar) {
            const img = avatarBox.createEl("img");
            img.src = this.settings.redUserAvatar;
            img.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
        } else {
            avatarBox.setText("👤");
        }
        const infoDiv = previewRow.createDiv();
        infoDiv.createDiv({ text: this.settings.redUserAvatar ? "当前头像" : "默认头像 (👤)" });
        infoDiv.createDiv({ text: this.settings.redUserName, attr: { style: "font-weight: 600; margin-top: 4px;" } });

        const uploadRow = contentEl.createDiv();
        uploadRow.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 12px;";
        uploadRow.createSpan({ text: "上传:" });
        const fileInput = uploadRow.createEl("input", { type: "file", attr: { accept: "image/*" } });
        fileInput.style.cssText = "flex: 1; font-size: 12px;";
        fileInput.addEventListener("change", async (e) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) return;
            try {
                const dataUrl = await this.readFileAsDataUrl(file);
                this.settings.redUserAvatar = dataUrl;
                this.onSave();
                this.onOpen();
            } catch (err) {
                console.error("Failed to read avatar file", err);
            }
        });

        const urlRow = contentEl.createDiv();
        urlRow.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 12px;";
        urlRow.createSpan({ text: "URL:" });
        const urlInput = urlRow.createEl("input", { type: "text", placeholder: "头像图片 URL" });
        urlInput.value = this.settings.redUserAvatar.startsWith("data:") ? "" : (this.settings.redUserAvatar || "");
        urlInput.style.cssText = "flex: 1; padding: 4px 8px; font-size: 13px;";
        const applyBtn = urlRow.createEl("button", { text: "应用" });
        applyBtn.style.cssText = "padding: 4px 10px; font-size: 12px;";
        applyBtn.addEventListener("click", () => {
            const val = urlInput.value.trim();
            if (val) {
                this.settings.redUserAvatar = val;
                this.onSave();
                this.onOpen();
            }
        });

        const actionRow = contentEl.createDiv();
        actionRow.style.cssText = "display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end;";

        if (this.settings.redUserAvatar) {
            const clearBtn = actionRow.createEl("button", { text: "清除头像" });
            clearBtn.style.cssText = "padding: 6px 14px; font-size: 12px;";
            clearBtn.addEventListener("click", () => {
                this.settings.redUserAvatar = "";
                this.onSave();
                this.onOpen();
            });
        }

        const closeBtn = actionRow.createEl("button", { text: "关闭" });
        closeBtn.style.cssText = "padding: 6px 14px; font-size: 12px;";
        closeBtn.addEventListener("click", () => {
            this.close();
        });
    }

    onClose(): void {
        this.contentEl.empty();
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
