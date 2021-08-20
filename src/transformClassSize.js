import postcss from "postcss";
import valueParser from "postcss-value-parser";
import selectorParser from "postcss-selector-parser";

/**
 * 转换 wxss 中的特定 class 宽高插件
 * @return {import('postcss').Plugin}
 */
const transformClassSizePlugin = ({classNames = []} = {}) => {
  return {
    postcssPlugin: "transform-class-size",
    Once(root, { result }) {
      root.walkRules(rule => {
        let selectorMatch
        // 判断 selector 是否命中对应 className
        selectorParser(selectors => {
          selectorMatch = selectors.every(selector => {
            let lastClassNode
            selector.walkClasses(node => { lastClassNode = node })
            return lastClassNode && classNames.includes(lastClassNode.value)
          })
        }).processSync(rule.selector)

        if (!selectorMatch) return

        rule.walkDecls(/^(width|height)$/, decl => {
          const unit = valueParser.unit(decl.value);
          if (!unit) return

          const factor = 0.5

          switch (unit.unit) {
            case 'px':
              decl.value = `calc(${+unit.number * factor / 16}rem + ${+unit.number * (1 - factor)}px)`;
              break
            case 'rpx':
              decl.value = `calc(${+unit.number * factor / 32}rem + ${+unit.number * (1 - factor)}rpx)`
            default:
              return
          }
        })
      });
    },
  };
};

/**
 * @param {string} source
 * @param {string} filename
 * @return {Promise<string>}
 */
export default async function transformClassSize(source, classNames, filename) {
  const { css } = await postcss([transformClassSizePlugin({classNames})]).process(source, {
    from: undefined,
  });
  return css;
}
