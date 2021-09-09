import postcss from "postcss";
import valueParser from "postcss-value-parser";

/**
 * 转换 wxss 中的 font-size 插件
 * @return {import('postcss').Plugin}
 */
const transformFontSizePlugin = (options = {}) => {
  return {
    postcssPlugin: "transform-font-size",
    Once(root, { result }) {
      root.walkRules((rule) => {
        let fontSizeValue;
        const factor = 0.5;
        rule.walkDecls("font-size", (decl) => {
          // font-size 必须要带单位才进行转换
          const unit = valueParser.unit(decl.value);
          if (!unit) return;

          fontSizeValue = decl.value;
          decl.value = `calc(${decl.value} + ${factor} * (1rem - 16px))`;
        });
        if (!fontSizeValue) return;

        rule.walkDecls((decl) => {
          if (
            !["height", "line-height", "min-height", "max-height"].includes(
              decl.prop
            )
          )
            return;

          // line-height 必须要带单位才进行转换
          const unit = valueParser.unit(decl.value);
          if (!unit) return;

          decl.value = `calc(${decl.value} + ${factor} * (1rem - 16px))`;
        });
      });
    },
  };
};

/**
 * @param {string} source
 * @param {string} filename
 * @return {Promise<string>}
 */
export default async function transformFontSize(source, filename) {
  const { css } = await postcss([transformFontSizePlugin()]).process(source, {
    from: undefined,
  });
  return css;
}
