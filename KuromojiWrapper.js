'use strict'
const path = require('path')
const DIR = './node_modules/kuromoji/dict'
const kuromoji = require('kuromoji')

module.exports = class KuromojiWrapper {
  constructor() {
  }

  async init() {
    this.tokenizer = await new Promise((resolve, reject) => {
      kuromoji
        .builder({ dicPath: DIR })
        .build((err, tokenizer) => {
          if (err) reject(err)
          resolve(tokenizer)
        })
    })
  }

  exec(text) {
    return this.tokenizer.tokenize(text)
  }

  get(text) {
    const res = this.exec(text)
    // 第一優先: 感動詞
    const prop1 = res.find((o) => o.pos == '感動詞')
    if (prop1) return prop1.basic_form
    // 第二優先: 形容詞
    const prop2 = res.find((o) => o.pos == '形容詞')
    if (prop2) return prop2.basic_form
    return text
  }
}
