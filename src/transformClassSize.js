import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import valueParser from "postcss-value-parser";

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


        const factor = 0.5
        rule.walkDecls(/^(width|height)$/, decl => {
          // 必须要带单位才进行转换
          const unit = valueParser.unit(decl.value);
          if (!unit) return;
          decl.value = `calc(${decl.value} + ${factor} * (1rem - 16px))`;
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
