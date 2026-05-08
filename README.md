# 西门发布助手 (ximen-notetomp)

将 Obsidian 笔记发布到微信公众号、头条号、小红书。

基于 [note-to-mp](https://github.com/sunbooshi/note-to-mp) 和 [note-to-red](https://github.com/Yeban/note-to-red) 的思路重构的简化版插件。

## 功能

| 平台 | 功能 | 说明 |
|------|------|------|
| **公众号/头条号** | HTML 带样式输出 | 19 种排版主题，复制到编辑器即可粘贴 |
| **小红书** | 图片卡片 (PNG) | 按标题自动分页，3:4 比例，11 套卡片主题 |
| **小红书** | 纯文本复制 | 去除格式后复制到剪贴板 |

### Markdown 解析支持

- 标准 GFM（标题、加粗、斜体、列表、表格、引用、代码块、链接、图片、分隔线）
- `[[wikilink]]` — Obsidian 内部链接解析
- `![[embed]]` — 嵌入图片和笔记内容
- `> [!callout]` — 彩色提醒块（支持 note/info/tip/warning/danger/quote 等类型）
- YAML Frontmatter 自动剥离

## 安装

1. 在 Obsidian 中打开设置 → 第三方插件 → 关闭安全模式
2. 打开 `.obsidian/plugins/` 目录，创建 `ximen-notetomp` 文件夹
3. 将 `main.js`、`manifest.json`、`styles.css` 放入该目录
4. 重启 Obsidian，在第三方插件列表中启用「西门发布助手」

## 使用

Ribbon 栏有两个图标：

| 图标 | 功能 |
|------|------|
| 💬 | 打开公众号/头条号预览面板 |
| 📷 | 打开小红书预览面板 |

### 公众号/头条号

1. 打开一篇 Markdown 笔记
2. 点击 Ribbon 栏的 💬 图标（或在命令面板中搜索「打开公众号/头条号预览」）
3. 右侧面板显示带样式的 HTML 预览
4. 顶部工具栏选择样式主题
5. 点击「复制 HTML」粘贴到微信公众号或头条号编辑器
6. 也可点击「导出 HTML」保存为独立文件

### 小红书

1. 打开一篇 Markdown 笔记
2. 点击 Ribbon 栏的 📷 图标
3. 右侧面板显示 3:4 比例的卡片预览
4. 顶部工具栏选择卡片主题和字号
5. 使用 ◀ ▶ 按钮翻页浏览
6. 导出方式：
   - **导出 PNG** — 下载当前页为高分辨率 PNG
   - **批量 ZIP** — 导出全部页面为 ZIP 压缩包
   - **复制图片** — 将当前页复制到剪贴板（可直接粘贴到小红书）
   - **复制文本** — 复制纯文本内容

### 设置

在 Obsidian 设置 → 西门发布助手 中配置：

- **公众号/头条号**：默认样式主题、代码行号
- **小红书**：卡片主题、分段标题级别 (h1/h2)、字体大小、用户名、用户 ID、页脚文字

## 样式主题

### 公众号/头条号 (19 种)

| 主题 ID | 名称 |
|---------|------|
| wechat-default | 默认公众号风格 |
| latepost-depth | 晚点风格 |
| wechat-ft | 金融时报 |
| wechat-anthropic | Claude |
| wechat-tech | 技术风格 |
| wechat-elegant | 优雅简约 |
| wechat-deepread | 深度阅读 |
| wechat-nyt | 纽约时报 |
| wechat-jonyive | Jony Ive |
| wechat-medium | Medium 长文 |
| wechat-apple | Apple 极简 |
| kenya-emptiness | 原研哉·空 |
| hische-editorial | Hische·编辑部 |
| ando-concrete | 安藤·清水 |
| gaudi-organic | 高迪·有机 |
| guardian | Guardian 卫报 |
| nikkei | Nikkei 日経 |
| warm-docs | 焦橙文档 |
| lemonde | Le Monde 世界报 |

### 小红书卡片 (11 种)

| 主题 ID | 名称 | 背景 |
|---------|------|------|
| default | 默认主题 | 深色 |
| minimal | 极简主题 | 白色 |
| elegant | 优雅暗色 | 深紫 |
| cyber | 赛博朋克 | 白色 |
| warm | 暖阳文艺 | 暖白 |
| forest | 森林清晨 | 深绿 |
| ocean | 深海之境 | 深蓝 |
| sakura | 樱花飞舞 | 深粉 |
| starry | 星空梦境 | 深海军蓝 |
| metal | 金属科技 | 深灰 |
| yueling | 悦灵雅棕 | 深色 |

## 技术栈

- TypeScript + Obsidian API
- [marked](https://marked.js.org/) — Markdown 解析
- [html-to-image](https://github.com/bubkoo/html-to-image) — DOM 转 PNG
- [JSZip](https://stuk.github.io/jszip/) — 批量导出压缩

## 许可证

MIT
