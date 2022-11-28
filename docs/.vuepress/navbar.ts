import { navbar } from "vuepress-theme-hope";

export const navbarConfig = navbar([
  { text: "来这看", icon: "article", link: "/home.md" },
  {
    text: "网站相关",
    icon: "about",
    children: [
      { text: "关于作者", icon: "zuozhe", link: "/about-the-author/" },
    ],
  },
  {
    text: "更新历史",
    icon: "history",
    link: "/timeline/",
  },
]);
