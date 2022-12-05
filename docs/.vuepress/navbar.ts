import { navbar } from "vuepress-theme-hope";

export const navbarConfig = navbar([
  { text: "来这看", icon: "article", link: "/home.md" },
  {
    text: "网站相关",
    icon: "about",
    link:"/webabout/"
  },
  {
    text: "时间线",
    icon: "history",
    link: "/timeline/",
  },
]);
