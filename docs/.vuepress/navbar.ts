import {navbar} from "vuepress-theme-hope";

export const navbarConfig = navbar([
    {text: "有技可述", icon: "article", link: "/home.md"},
    {
        text: "有言可乐",
        icon: "about",
        link: "/talkabout/"
    },
    {
        text: "有感可发",
        icon: "about",
        link: "/writeabout/"
    },
    {
        text: "时间线",
        icon: "history",
        link: "/timeline/",
    },
]);
