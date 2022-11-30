import { hopeTheme } from "vuepress-theme-hope";
import { navbarConfig } from "./navbar";
import { sidebarConfig } from "./sidebar";

export const themeConfig = hopeTheme({
  logo: "/logo.png",
  hostname: "https://leyunone.com/",
  author: {
    name: "乐云一",
    url: "https://leyunone.com/article/",
  },
  repo: "https://github.com/LeYunone/leyunone.com",
  docsDir: "docs",
  iconAssets: "//at.alicdn.com/t/c/font_2922463_bcn6tjuoz8b.css",
  navbar: navbarConfig,
  sidebar: sidebarConfig,
  editLink:false,
  pageInfo: [
    "Author",
    "Category",
    "Tag",
    "Date",
    "Original",
    "Word",
    "ReadingTime",
  ],
  blog: {
    name:"乐云一",
    avatar:"/head.png",
    intro: "/about-the-author/",
    sidebarDisplay: "mobile",
    description:"快乐是可以具象化的！",
    medias: {
      Zhihu: "https://www.zhihu.com/people/leyuna",
      Github: "https://github.com/LeYunone",
      QQ:"http://wpa.qq.com/msgrd?v=3&uin=365627310&site=qq&menu=yes",
      BiliBili:"https://space.bilibili.com/7749032"
    },
    roundAvatar:true,
    timeline:"时间线上的船只"
  },
  footer:
    '<a href="https://beian.miit.gov.cn/" target="_blank">湘ICP备2022021814号-1</a>',
  displayFooter: true,
  plugins: {
    blog: true,
    copyright: true,
    mdEnhance: {
      codetabs: true,
      container: true,
      tasklist: true,
    },
    feed: {
      json: true,
    },
    comment:{
      provider: "Waline",
      search:true,
      serverURL:"https://leyuna-com-comment-lhhmusl8l-leyunone.vercel.app/"
    }
  },
});
