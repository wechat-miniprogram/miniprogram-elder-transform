# miniprogram-elder-transform
> 小程序适老化自动适配工具

## 注意
本适老化适配工具不能覆盖所有场景，经过本工具转换后仍需要进行测试和手动适配，以符合产品预期

## 使用

```bash
# 转换当前目录下小程序源码，需要保证 app.json 在目录下
npx miniprogram-elder-transform .
```

## 原理

转换工具会首先自动给页面`wxml`加上 `<page-meta root-font-size="system"/>`，从而将用户设置的字体大小作用到小程序的 `rem` 大小单位。

之后，转换工具会将`wxss`中的字体大小，行高，图片宽高等样式，转换为根据`rem`缩放的形式：

如转换前`wxss`样式为 `font-size: 14px;`，则转换后为 `font-size: calc(14px + 0.5 * (1rem - 16px));`。
