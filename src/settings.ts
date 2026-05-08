export interface XimenSettings {
  // 公众号/头条号设置
  mpDefaultTheme: string;
  showLineNumbers: boolean;

  // 小红书设置
  redThemeId: string;
  redHeadingLevel: "h1" | "h2";
  redFontSize: number;
  redFontFamily: string;
  redUserName: string;
  redUserId: string;
  redUserAvatar: string;
  redShowTime: boolean;
  redFooterLeft: string;
  redFooterRight: string;
  redBackgroundImage: string;
  redBackgroundScale: number;
  redBackgroundPositionX: number;
  redBackgroundPositionY: number;
}

export const DEFAULT_SETTINGS: XimenSettings = {
  mpDefaultTheme: "wechat-default",
  showLineNumbers: false,
  redThemeId: "default",
  redHeadingLevel: "h2",
  redFontSize: 16,
  redFontFamily: 'Optima-Regular, Optima, PingFangSC-light, PingFangSC, "Microsoft YaHei", sans-serif',
  redUserName: "西门",
  redUserId: "@ximen",
  redUserAvatar: "",
  redShowTime: true,
  redFooterLeft: "感谢阅读",
  redFooterRight: "欢迎关注",
  redBackgroundImage: "",
  redBackgroundScale: 1,
  redBackgroundPositionX: 0,
  redBackgroundPositionY: 0,
};
