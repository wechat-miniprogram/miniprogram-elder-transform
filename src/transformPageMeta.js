import * as wxmlParser from "./utils/wxmlParser";

/**
 * 转换 wxml 的 <page-meta> 设置
 * @param {string} source
 * @param {string} filename
 */
export default async function transformPageMeta(source, filename) {
  const ast = wxmlParser.parse(filename, source);

  let rootPath;
  let pageMeta;
  wxmlParser.walk(ast, {
    begin(path) {
      if (!rootPath) rootPath = path;
      if (path.node.type !== "element" || path.node.tag !== "page-meta") return;
      pageMeta = path.node;
    },
  });

  if (!pageMeta) {
    // 顶部插入一个 <page-meta>
    pageMeta = {
      type: "element",
      tag: "page-meta",
      attrs: [],
      children: [],
    };
    rootPath.insertBefore(pageMeta);
    rootPath.insertBefore({ type: "text", text: "\n" }); // 插入换行
  }

  let hasRootFontSize = false;
  pageMeta.attrs.forEach((attr) => {
    if (attr.name === "root-font-size") {
      hasRootFontSize = true;

      if (attr.value !== "system") {
        console.warn(
          `cannot change <page-meta root-font-size="system"> in ${filename}`
        );
      } else {
        attr.value = "system";
      }
    }
  });

  // 给 <page-meta> 添加一个 root-font-size
  if (!hasRootFontSize) {
    pageMeta.attrs.push({
      name: "root-font-size",
      value: "system",
    });
  }

  const { code } = wxmlParser.codegen(ast);
  return code;
}
