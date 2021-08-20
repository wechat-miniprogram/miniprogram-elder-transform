import * as wxmlParser from "./utils/wxmlParser";

/**
 * 提取 wxml 中图片对应的 wxss className
 * @param {string} source
 * @param {string} filename
 * @returns {Promise<string[]>}
 */
export default async function extractImageClass(source, filename) {
  const wxmlAst = wxmlParser.parse(filename, source);
  const imageClasses = [];
  wxmlParser.walk(wxmlAst, {
    begin(path) {
      if (
        path.node.type !== "element" ||
        !["image", "icon"].includes(path.node.tag)
      )
        return;
      let classAttr;
      path.node.attrs.forEach((attr) => {
        if (attr.name === "class") classAttr = attr;
      });
      if (!classAttr || !classAttr.value || /\{\{/.test(classAttr.value))
        return;
      imageClasses.push(...classAttr.value.split(" "));
    },
  });

  return imageClasses;
}
