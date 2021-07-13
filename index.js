/* eslint-disable */

const fs = require('fs')
const postcss = require('postcss')
const valueParser = require('postcss-value-parser')

/** @return {import('postcss').Plugin} */
const plugin = (options = {}) => {
  return {
    postcssPlugin: 'transform-font-size',
    Once (root, { result }) {
      root.walkRules(rule => {
        let pxFontSize
        rule.walkDecls('font-size', decl => {
          const unit = valueParser.unit(decl.value)
          pxFontSize = unit && unit.unit === 'px' ? unit.number : false
          if (!pxFontSize) return

          decl.value = `calc(${+unit.number / 32}rem + ${+unit.number / 2}px)`
        })
        if (!pxFontSize) return

        rule.walkDecls(decl => {
          if (!['height', 'line-height', 'min-height', 'max-height'].includes(decl.prop)) return

          const unit = valueParser.unit(decl.value)
          // if (!unit) console.log(decl.value)
          if (!unit) return

          switch (unit.unit) {
            case 'px': {
              const offset = +unit.number - pxFontSize / 2
              if (!offset) {
                decl.value = `${+pxFontSize / 32}rem`
              } else {
                decl.value = `calc(${+pxFontSize / 32}rem ${offset > 0 ? '+' : '-'} ${Math.abs(offset)}px)`
              }
              break
            }
          }
        })
      })
    }
  }
}


// 遍历所有的文件
const root = process.argv[2]
readDirSync(root)

// 使用异步获取路径, 参数是遍历文件的根路径
function readDirSync(path){
  let pa = fs.readdirSync(path)
  // 循环遍历当前的文件以及文件夹
  pa.forEach(function(ele,index) {
    let info = fs.statSync(path + '/' + ele)
    if(info.isDirectory()){
      readDirSync(path + '/' + ele)
    } else{
      let filePath = path + '/' + ele
      // 找到 .wxss 文件
      let fileNameReg = /\.wxss/g
      let shouldFormat =  fileNameReg.test(filePath)
      if (shouldFormat) {
        // 这里就拿到了符合条件的文件路径，后面就可以根据这个路径来执行相关的操作
        console.log('find  file:', filePath)
        const argv = filePath
        const content = fs.readFileSync(filePath, 'utf8')
        postcss([
          plugin()
        ])
        .process(content, { from: undefined })
        .then(({css}) => {console.log(css);fs.writeFileSync(filePath, css)})
        .catch(console.error)
      }
    }
  })
}