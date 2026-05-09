# 修复计划：4 项功能增强与 Bug 修复

## 概述

本次修改涉及 4 个问题：
1. 微信公众号板块增加主题色选框
2. 小红书背景"默认/无图片"无法恢复的 Bug
3. 背景颜色和图片增加透明度选项
4. 小红书用户头像上传/取消功能

---

## 问题 1：微信公众号板块增加主题色选框

### 现状分析
- `MpView.ts` 工具栏布局：`样式: [下拉框] | 复制HTML | 导出HTML | 刷新`
- MP 主题通过 `themes-data.json` 定义，每个主题有固定的颜色方案（如 `#3498db`、`#d32f2f` 等）
- `HtmlRenderer.applyTheme()` 将主题样式作为 inline style 注入 HTML
- 当前没有"主题色"概念，颜色硬编码在各主题的 style 字符串中

### 方案
在 `MpView.ts` 工具栏的样式下拉框和"复制 HTML"按钮之间，增加一个主题色选择器：
- 提供 8-10 种预设主题色色卡（微信绿 `#07C160`、晚点红 `#D32F2F`、科技蓝 `#3498DB`、暖橙 `#ED8936`、深紫 `#7C3AED`、森林绿 `#2D8B56`、玫瑰粉 `#E91E8C`、墨黑 `#1A1A1A`）
- 支持自定义颜色输入
- 选择主题色后，动态替换当前主题中的强调色

### 主题色替换逻辑（仅替换强调色）
1. 从当前主题的 `h2` 样式中提取 `border-left: 4px solid #XXXXXX` 的颜色作为"原始强调色"
2. 将原始强调色替换为用户选择的 `mpAccentColor`
3. 替换范围（仅强调色元素）：
   - `h1` 的 `border-bottom` 颜色
   - `h2` 的 `border-left` 颜色、`background-color`（如果有）
   - `h3` 的 `border-left` 颜色
   - `a` 的 `color` 和 `border-bottom` 颜色
   - `blockquote` 的 `border-left` 颜色
   - `th` 的 `background-color`
   - `hr` 中 `linear-gradient` 包含的颜色
4. 使用正则匹配 `#XXXXXX` 格式的颜色值进行替换
5. 当 `mpAccentColor` 为空时，不进行任何替换（使用主题默认色）

### 涉及文件
- **`src/settings.ts`**：新增 `mpAccentColor: string` 字段，默认值 `""`
- **`src/views/MpView.ts`**：在工具栏增加主题色选择 UI（色卡 + 自定义输入），位于样式下拉框和"复制 HTML"按钮之间
- **`src/html-renderer.ts`**：新增 `applyAccentColor(html, accentColor, themeId)` 方法，在 `applyTheme()` 返回结果后调用

---

## 问题 2：小红书背景"默认/无图片"无法恢复

### Bug 分析
在 `RedView.ts` 的 `applyBackgroundOverride()` 中：
```typescript
if (this.settings.redBackgroundColor) {  // 空字符串为 falsy，不会进入
  container.style.backgroundColor = this.settings.redBackgroundColor;
  ...
}
if (this.settings.redBackgroundImage) {  // 空字符串为 falsy，不会进入
  ...
}
```
**问题**：当用户选择"默认"（color=""）或"无图片"（value=""）时，设置值确实被清空了，但之前设置的 `container.style.backgroundColor` 和 `container.style.backgroundImage` **没有被清除**，因为空字符串不满足 if 条件，所以旧的样式仍然保留在 DOM 上。

### 修复方案
在 `applyBackgroundOverride()` 中增加 else 分支：
- 当 `redBackgroundColor` 为空时，清除 `backgroundColor`（设为空字符串），并恢复 footer 的 background 为空（让主题样式接管）
- 当 `redBackgroundImage` 为空时，清除 `backgroundImage`、`backgroundSize`、`backgroundPosition`、`backgroundRepeat`（全部设为空字符串）

### 涉及文件
- **`src/views/RedView.ts`**：修改 `applyBackgroundOverride()` 方法

---

## 问题 3：背景颜色和图片增加透明度选项

### 现状分析
- `BackgroundModal.ts` 中有颜色预设和图片预设，但没有透明度控制
- `XimenSettings` 中没有透明度相关字段

### 方案
在 `BackgroundModal.ts` 中增加透明度滑块：
- 新增设置字段 `redBackgroundOpacity: number`（0-1，步长 0.05，默认 1）
- 在背景颜色和背景图片区域之后，增加一个"透明度"滑块
- 仅当设置了背景颜色或背景图片时显示

### 透明度实现
在 `RedView.ts` 的 `showCurrentPage()` 中，在 `previewContainer` 内部最底层插入一个 `div.red-bg-overlay`：
- `position: absolute; inset: 0; z-index: 0;`
- 将背景颜色和背景图片都应用到这个 overlay 上
- 通过 `overlay.style.opacity = settings.redBackgroundOpacity` 控制透明度
- 内容层（header + content-inner + footer）设置 `position: relative; z-index: 1;`

### 涉及文件
- **`src/settings.ts`**：新增 `redBackgroundOpacity: number` 字段，默认值 1
- **`src/views/BackgroundModal.ts`**：增加透明度滑块 UI
- **`src/views/RedView.ts`**：修改 `showCurrentPage()` 增加 overlay 层，修改 `applyBackgroundOverride()` 将背景应用到 overlay 而非 container

---

## 问题 4：小红书用户头像上传/取消功能

### 现状分析
- `RedView.ts` 中头像渲染逻辑：
  ```typescript
  this.settings.redUserAvatar
    ? '<img src="..." />'
    : "👤"  // 无头像时显示 emoji
  ```
- `settings.ts` 中 `redUserAvatar: string` 默认为空字符串
- `setting-tab.ts` 中有用户名和用户 ID 的输入框，但**没有头像设置 UI**
- 用户无法在设置页面上传或清除头像

### 方案
在小红书工具栏中增加 `👤 头像` 按钮（位于背景按钮旁边），点击弹出 `AvatarModal`：
- 显示当前头像预览（圆形，40x40）
- 上传本地图片（转为 data URL 存储）
- 输入 URL
- 清除头像按钮（恢复默认 👤 emoji）

同时在 `setting-tab.ts` 的用户名/用户 ID 设置区域增加头像上传/清除 UI。

### 涉及文件
- **`src/views/RedView.ts`**：工具栏增加头像按钮
- **`src/views/AvatarModal.ts`**（新建）：头像上传/清除弹窗
- **`src/setting-tab.ts`**：增加头像上传/清除 UI

---

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/settings.ts` | 修改 | 新增 `mpAccentColor: string`、`redBackgroundOpacity: number` 字段 |
| `src/views/MpView.ts` | 修改 | 工具栏增加主题色选择器 UI（色卡 + 自定义输入） |
| `src/html-renderer.ts` | 修改 | 新增 `applyAccentColor()` 方法，替换强调色 |
| `src/views/RedView.ts` | 修改 | 修复背景清除 Bug、增加透明度 overlay 层、增加头像按钮 |
| `src/views/BackgroundModal.ts` | 修改 | 增加透明度滑块 UI |
| `src/views/AvatarModal.ts` | 新建 | 头像上传/清除弹窗 |
| `src/setting-tab.ts` | 修改 | 增加头像上传/清除 UI |

---

## 验证步骤

1. `npm run build` 构建通过，无 TypeScript 错误
2. 微信公众号：选择不同主题色，预览中 h1/h2/a/blockquote/th 的强调色正确变化
3. 微信公众号：自定义主题色输入 `#FF6600`，预览正确应用
4. 微信公众号：清空主题色，恢复主题默认颜色
5. 小红书：选择背景颜色后，再点"默认"，背景恢复主题默认色
6. 小红书：选择渐变背景后，再点"无图片"，背景图片清除
7. 小红书：设置背景颜色 + 透明度 50%，背景半透明显示
8. 小红书：上传头像图片，卡片头部显示上传的头像
9. 小红书：清除头像，卡片头部恢复 👤 emoji
