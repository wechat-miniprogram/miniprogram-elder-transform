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
        let pxFontSize;
        rule.walkDecls("font-size", (decl) => {
          const unit = valueParser.unit(decl.value);
          if (!unit) return

          const factor = 0.5

          switch (unit.unit) {
            case 'px':
              pxFontSize = +unit.number
              decl.value = `calc(${+unit.number * factor / 16}rem + ${+unit.number * (1 - factor)}px)`;
              break
            case 'rpx':
              pxFontSize = +unit.number / 2
              decl.value = `calc(${+unit.number * factor / 32}rem + ${+unit.number * (1 - factor)}rpx)`
            default:
              return
          }

        });
        if (!pxFontSize) return;

        rule.walkDecls((decl) => {
          if (
            !["height", "line-height", "min-height", "max-height"].includes(
              decl.prop
            )
          )
            return;

          const unit = valueParser.unit(decl.value);
          // if (!unit) console.log(decl.value)
          if (!unit) return;

          switch (unit.unit) {
            case "px": {
              const offset = +unit.number - pxFontSize / 2;
              if (!offset) {
                decl.value = `${+pxFontSize / 32}rem`;
              } else {
                decl.value = `calc(${+pxFontSize / 32}rem ${
                  offset > 0 ? "+" : "-"
                } ${Math.abs(offset)}px)`;
              }
              break;
            }
          }
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
