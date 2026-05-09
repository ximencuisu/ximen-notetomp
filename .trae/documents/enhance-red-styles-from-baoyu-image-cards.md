# 实施计划：吸取 baoyu-image-cards 样式增强小红书板块

## 概述

从 `baoyu-image-cards` 仓库吸取 12 种视觉风格，转化为小红书卡片主题，并修复背景自定义功能（颜色+图片）。

## 当前状态分析

### 现有主题
- 11 个主题：default, minimal, elegant, cyber, warm, forest, ocean, sakura, starry, metal, yueling
- 每个主题是 `src/templates/` 下的 JSON 文件，遵循 `RedThemeStyle` 接口
- 主题通过 `ThemeManager.applyTheme()` 以 inline style 方式应用到 DOM 元素

### 背景功能缺陷
- `XimenSettings` 中已定义 `redBackgroundImage`, `redBackgroundScale`, `redBackgroundPositionX`, `redBackgroundPositionY`
- 但这些设置**从未在渲染代码中使用**（RedView.ts 和 ThemeManager.ts 中无引用）
- 设置页面（setting-tab.ts）中也**没有这些设置的 UI**
- 缺少 `redBackgroundColor` 设置字段

### baoyu-image-cards 风格参考
12 种风格及其配色方案：
| 风格 | 背景色 | 主色调 | 适合场景 |
|------|--------|--------|----------|
| Cute 甜美可爱 | #FFFAF0 / #FFF5F7 奶油/淡粉 | 粉色#FED7E2, 薄荷#C6F6D5 | 生活方式、美妆 |
| Fresh 清新自然 | #FFFFFF / #F0FFF4 白/薄荷 | 薄荷绿#9AE6B4, 天蓝#90CDF4 | 健康、自然 |
| Warm 暖阳文艺 | #FFFAF0 / #FED7AA 奶油/桃色 | 暖橙#ED8936, 金黄#F6AD55 | 生活故事、情感 |
| Bold 醒目冲击 | #000000 / #1A1A1A 深黑 | 亮红#E53E3E, 亮黄#F6E05E | 重要提醒、排行 |
| Minimal 极简专业 | #FAFAFA / #FFFFFF 灰白 | 黑#000000, 单色强调 | 专业、商务 |
| Retro 复古怀旧 | #F5E6D3 / #E8DCC8 旧纸/棕褐 | 暖橙#E07A4D, 暗粉#D4A5A5 | 怀旧、经典 |
| Pop 活力流行 | #FFFFFF / #F7FAFC 白/浅灰 | 亮红#F56565, 亮黄#ECC94B | 趣味、年轻 |
| Notion 极简知识 | #FFFFFF / #FAFAFA 白/灰白 | 黑#1A1A1A, 淡蓝#A8D4F0 | 知识、效率 |
| Chalkboard 黑板风 | #1A1A1A / #1C2B1C 黑板黑/绿黑 | 粉笔白#F5F5F5, 粉笔黄#FFE566 | 教育、教程 |
| Study Notes 学霸笔记 | #FFFFFF 白纸 | 蓝墨#1E3A5F, 红笔#CC0000 | 学习笔记、考试 |
| Screen Print 海报印刷 | #121212 / #F5E6D0 深黑/暖奶油 | 橙#E8751A, 青#0A6E6E | 海报、影评 |
| Sketch Notes 手绘笔记 | #F5F0E8 暖奶油 | 马卡龙蓝#A8D8EA, 珊瑚红#E8655A | 教育、图解 |

## 变更计划

### 1. 新增 12 个主题 JSON 文件

在 `src/templates/` 下新增以下文件，每个文件遵循现有 `RedThemeStyle` 接口：

| 文件 | id | name | 背景色系 |
|------|-----|------|----------|
| `cute.json` | `cute` | `Cute 甜美可爱` | 淡粉/奶油色 |
| `fresh.json` | `fresh` | `Fresh 清新自然` | 白/薄荷色 |
| `bold.json` | `bold` | `Bold 醒目冲击` | 深黑色 |
| `retro.json` | `retro` | `Retro 复古怀旧` | 旧纸/棕褐色 |
| `pop.json` | `pop` | `Pop 活力流行` | 白/浅灰色 |
| `notion.json` | `notion` | `Notion 极简知识` | 白/灰白色 |
| `chalkboard.json` | `chalkboard` | `Chalkboard 黑板风` | 黑板深色 |
| `study-notes.json` | `study-notes` | `Study Notes 学霸笔记` | 白纸色 |
| `screen-print.json` | `screen-print` | `Screen Print 海报印刷` | 深黑/暖奶油 |
| `sketch-notes.json` | `sketch-notes` | `Sketch Notes 手绘笔记` | 暖奶油色 |

> 注：Warm 暖阳文艺已有现有主题 `warm`，不再重复添加。Minimal 极简专业已有现有主题 `minimal`，不再重复添加。实际新增 10 个主题。

每个主题的样式将参考 baoyu-image-cards 的配色方案，适配到 `RedThemeStyle` 结构中：
- `imagePreview`：包含背景色和内边距
- `header`：头像、用户名、ID、时间等样式
- `footer`：底部栏样式
- `title`：h2/h3/base 标题样式
- `paragraph`：正文段落样式
- `emphasis`：strong/em/del 强调样式
- `list`：列表容器和条目样式
- `code`：代码块和行内代码样式
- `quote`：引用块样式
- `image`：图片样式
- `link`：链接样式
- `table`：表格样式
- `hr`：分隔线样式
- `footnote`：脚注样式

### 2. 注册新主题 — `src/templates/index.ts`

- 新增 10 个 JSON import
- 将新主题加入 `RED_THEMES` 数组
- `RED_THEME_MAP` 自动生成无需额外修改

### 3. 修复背景自定义功能

#### 3a. 新增设置字段 — `src/settings.ts`

新增字段：
```typescript
redBackgroundColor: string;  // 自定义背景颜色，空字符串表示使用主题默认
```

默认值：
```typescript
redBackgroundColor: "",
```

#### 3b. 应用背景设置 — `src/views/RedView.ts`

在 `showCurrentPage()` 方法中，在调用 `applyThemeToCurrent()` 之后，追加背景覆盖逻辑：

```typescript
private applyBackgroundOverride(): void {
  const container = this.previewContainer;
  if (!container) return;

  // 背景颜色覆盖
  if (this.settings.redBackgroundColor) {
    container.style.backgroundColor = this.settings.redBackgroundColor;
    // 同步更新 footer 背景
    const footer = container.querySelector(".red-preview-footer") as HTMLElement;
    if (footer) {
      footer.style.background = this.settings.redBackgroundColor;
    }
  }

  // 背景图片
  if (this.settings.redBackgroundImage) {
    container.style.backgroundImage = `url(${this.settings.redBackgroundImage})`;
    container.style.backgroundSize = `${this.settings.redBackgroundScale * 100}%`;
    container.style.backgroundPosition = `${this.settings.redBackgroundPositionX}% ${this.settings.redBackgroundPositionY}%`;
    container.style.backgroundRepeat = "no-repeat";
  }
}
```

在 `showCurrentPage()` 末尾调用 `this.applyBackgroundOverride()`。

#### 3c. 添加设置 UI — `src/setting-tab.ts`

在小红书设置区域新增：

1. **背景颜色** — 文本输入框，输入 CSS 颜色值（如 `#FFFAF0`、`rgb(255,250,240)`），留空使用主题默认
2. **背景图片** — 文本输入框，输入图片路径或 URL
3. **背景缩放** — 滑块，范围 0.5-3.0，步长 0.1
4. **背景位置 X** — 滑块，范围 0-100，步长 1
5. **背景位置 Y** — 滑块，范围 0-100，步长 1

### 4. 更新版本号

将 `manifest.json`、`package.json`、`versions.json` 版本从 `1.1.0` 升级到 `1.2.0`。

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/templates/cute.json` | 新增 | Cute 甜美可爱主题 |
| `src/templates/fresh.json` | 新增 | Fresh 清新自然主题 |
| `src/templates/bold.json` | 新增 | Bold 醒目冲击主题 |
| `src/templates/retro.json` | 新增 | Retro 复古怀旧主题 |
| `src/templates/pop.json` | 新增 | Pop 活力流行主题 |
| `src/templates/notion.json` | 新增 | Notion 极简知识主题 |
| `src/templates/chalkboard.json` | 新增 | Chalkboard 黑板风主题 |
| `src/templates/study-notes.json` | 新增 | Study Notes 学霸笔记主题 |
| `src/templates/screen-print.json` | 新增 | Screen Print 海报印刷主题 |
| `src/templates/sketch-notes.json` | 新增 | Sketch Notes 手绘笔记主题 |
| `src/templates/index.ts` | 修改 | 注册 10 个新主题 |
| `src/settings.ts` | 修改 | 新增 redBackgroundColor 字段 |
| `src/views/RedView.ts` | 修改 | 新增 applyBackgroundOverride()，在 showCurrentPage() 中调用 |
| `src/setting-tab.ts` | 修改 | 新增背景颜色、背景图片、缩放、位置 X/Y 设置 UI |
| `manifest.json` | 修改 | 版本号 → 1.2.0 |
| `package.json` | 修改 | 版本号 → 1.2.0 |
| `versions.json` | 修改 | 新增 1.2.0 条目 |

## 假设与决策

1. **不引入独立 Palette 系统** — 每个主题自带固定配色，用户可通过背景设置微调
2. **不新增小绿书视图** — 仅增强现有小红书板块
3. **主题命名采用中英双语** — 如 "Cute 甜美可爱"
4. **Warm 和 Minimal 不重复添加** — 已有现有主题覆盖
5. **背景设置优先级** — 背景颜色/图片设置覆盖主题默认值
6. **背景图片支持 URL 和本地路径** — 与 redUserAvatar 一致

## 验证步骤

1. `npm run build` 构建通过，无 TypeScript 错误
2. 在 Obsidian 中加载插件，小红书预览视图正常显示
3. 切换所有 21 个主题（11 旧 + 10 新），确认样式正确应用
4. 设置背景颜色后，卡片背景正确覆盖主题默认色
5. 设置背景图片后，卡片背景正确显示图片
6. 背景缩放和位置设置生效
7. 清除背景设置后，恢复主题默认背景
