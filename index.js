'use strict'

const line = require('@line/bot-sdk')
const client = new line.Client({ channelAccessToken: process.env.ACCESSTOKEN })
const crypto = require('crypto')
const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'ap-northeast-1'
})
const KuromojiWrapper = require('./KuromojiWrapper')

exports.handler = async (event) => {
  return new Promise(async (resolve, reject) => {
    const signature = crypto.createHmac('sha256', process.env.CHANNELSECRET).update(event.body).digest('base64')
    const checkHeader = (event.headers || {})['X-Line-Signature']
    const body = JSON.parse(event.body)

    if (signature !== checkHeader) {
      reject('Authentication error')
    }
    const events = body.events[0]
    const message = events.message.text
    console.log(`message: ${message}`)

    const analysis = new KuromojiWrapper()
    await analysis.init()
    const key = analysis.get(message)
    console.log(`key: ${key}`)

    const param = {
      TableName: 'ReplyMapping',
      Key: {
        type: key
      }
    }
    const result = await dynamodb.get(param).promise()
    let msg, img
    if (result.Item) {
      const getRandomList = (list) => list[Math.floor(Math.random() * list.length)]
      msg = getRandomList(result.Item.msg)
      img = getRandomList(result.Item.img)
    } else {
      msg = `${message}ってなんでちゅか？`
      img = ''
    }

    const replyText = {
      type: 'text',
      text: msg
    }
    const replyImage = {
      type: 'image',
      originalContentUrl: img,
      previewImageUrl: img
    }

    client.replyMessage(events.replyToken, replyText)
      .then((r) => {
        return client.pushMessage(events.source.userId, replyImage)
      })
      .then((r) => {
        resolve({
          statusCode: 200,
          headers: { 'X-Line-Status': 'OK' },
          body: '{"result":"completed"}'
        })
      }).catch(reject)
  })
}
