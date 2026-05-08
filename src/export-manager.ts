import { toPng, toBlob } from "html-to-image";
import JSZip from "jszip";

export class ExportManager {
  /**
   * Capture a DOM element as PNG blob
   */
  async captureToBlob(element: HTMLElement): Promise<Blob | null> {
    try {
      return await toBlob(element, {
        pixelRatio: 4,
        quality: 1,
        cacheBust: true,
      });
    } catch (e) {
      console.error("captureToBlob failed:", e);
      return null;
    }
  }

  /**
   * Capture a DOM element as PNG data URL
   */
  async captureToDataUrl(element: HTMLElement): Promise<string | null> {
    try {
      return await toPng(element, {
        pixelRatio: 4,
        quality: 1,
        cacheBust: true,
      });
    } catch (e) {
      console.error("captureToDataUrl failed:", e);
      return null;
    }
  }

  /**
   * Download a single PNG file
   */
  async downloadSingle(element: HTMLElement, filename: string): Promise<void> {
    const dataUrl = await this.captureToDataUrl(element);
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Download multiple sections as a ZIP file
   */
  async downloadBatch(
    sections: HTMLElement[],
    zipFilename: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    const zip = new JSZip();

    for (let i = 0; i < sections.length; i++) {
      const dataUrl = await this.captureToDataUrl(sections[i]);
      if (dataUrl) {
        // Convert data URL to blob for zip
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        zip.file(`page_${String(i + 1).padStart(2, "0")}.png`, blob);
      }
      onProgress?.(i + 1, sections.length);
    }

    const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 9 } });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.download = `${zipFilename}.zip`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy PNG image to clipboard
   */
  async copyImageToClipboard(element: HTMLElement): Promise<boolean> {
    try {
      const blob = await this.captureToBlob(element);
      if (!blob) return false;

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      return true;
    } catch (e) {
      console.error("copyImageToClipboard failed:", e);
      return false;
    }
  }

  /**
   * Copy plain text to clipboard
   */
  async copyTextToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.error("copyTextToClipboard failed:", e);
      return false;
    }
  }
}
