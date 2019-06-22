const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const port = process.env.PORT || 4000
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyDJVbkePROCadDMjDFMH_f1P_a5O4FXbiE',
  Promise: Promise
});
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.post('/webhook', (req, res) => {
    let reply_token = req.body.events[0].replyToken
    let msg = req.body.events[0].message.text
    google_map(msg,function(result){
      reply(reply_token,result,msg)
      res.sendStatus(200)
    })
})
app.listen(port)

function google_map(msg,callback) {
  googleMapsClient.geocode({address: msg})
  .asPromise()
  .then((response) => {
    callback(response.json.results)
  })
  .catch((err) => {
    console.log(err);
  });
}
function reply(reply_token,data,msg) {
  console.log(data[0])
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {qa8ZFQTih+te1f5r/pzYeTC+q9q0J4aqeq02VfViv3D14ct6Rd1IX/u6reNhnUTM1sv8BRvs65QwzqVW1AORv/lJBlLh8QDwwIWZSMp1VLELp3Ma9D2UAWjF7shGeCsOUlZfucX9/L/eIyJOTK07AgdB04t89/1O/w1cDnyilFU=}'
    }
    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [
            {
              "type": "flex",
              "altText": msg,
              "contents": {
                "type": "bubble",
                "styles": {
                    "header": {
                      "backgroundColor": "#ffaaaa"
                    },
                    "body": {
                      "backgroundColor": "#aaffaa"
                    },
                  },
                "header": {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": msg,
                      "wrap": true
                    }
                  ]
                },
                "body": {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": data[0]['formatted_address'],
                      "wrap": true
                    }
                  ]
                },
                "footer": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "spacer",
                      "size": "xl"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "uri",
                        "label": "นำทาง",
                        "uri": "http://maps.google.com/?q="+msg+""
                      },
                      "style": "primary",
                      "color": "#0000ff"
                    }
                  ]
                }
              }
            }
          ]
    })
    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
    });
}