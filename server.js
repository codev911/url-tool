const axios = require('axios')
const cors = require('cors')
const convert = require('amrhextotext')
const puppeteer = require('puppeteer')


var express = require('express'),
    app = express(),
    port = process.env.PORT || 8000,
    bodyParser = require('body-parser')

var allowlist = ['http://localhost:4200']
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
      corsOptions = { origin: true }
    } else {
      corsOptions = { origin: false }
    }
    callback(null, corsOptions)
  }

app.use(cors(corsOptionsDelegate));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/bypass', async (req,res) => {
    if(req.query.url === undefined || req.query.url === null){
        res.send({
            "error":"error"
        })
    }else{
        try{
            const data = await axios.get(req.query.url)
            res.send(data.data)
        }catch{
            res.send({
                "error":"error"
            })
        }
    }
})

app.get('/checksite', async (req,res) => {
    if(req.query.url === undefined || req.query.url === null){
        res.send({
            "error":"error"
        })
    }else{
        try{
            const data = await axios.get(req.query.url)
            let sendData = {
                "status": data.status
            }
            res.send(sendData)
        }catch{
            res.send({
                "error":"error"
            })
        }
    }
})

app.get('/checkpng', async (req,res) => {
    if(req.query.url === undefined || req.query.url === null){
        res.send({
            "error":"error"
        })
    }else{
        try{
            const data = await axios.get(req.query.url)
            const bufData = Buffer.from(data.data);
            const isPng = bufData.includes("PNG") && convert.textToHex(data.data).slice(0,8) == 'efbfbd50';
            let sendData = {
                "status": data.status,
                "isPng": isPng
            }
            res.send(sendData)
        }catch{
            res.send({
                "error":"error"
            })
        }
    }
})

app.get('/checktelegram', async (req,res) => {
    if(req.query.url === undefined || req.query.url === null){
        res.send({
            "error":"error"
        })
    }else{
        try{
            const teleUsername = req.query.url.replace('https://t.me/','');
            const data = await axios.get(req.query.url)
            const bufData = Buffer.from(data.data);
            
            let isTele = false;

            if(req.query.url.includes('https://t.me/')){
                if(bufData.includes("tg://resolve?domain="+teleUsername)){
                    if(bufData.includes('If you have <strong>Telegram</strong>, you can contact <a class="tgme_username_link" href="tg://resolve?domain='+teleUsername+'">@'+teleUsername+'</a> right away.')){
                        isTele = false;
                    }else{
                        isTele = true;
                    }
                }
            }

            let sendData = {
                "status": data.status,
                "isTelegramUrl": isTele
            }
            res.send(sendData)
        }catch{
            res.send({
                "error":"error"
            })
        }
    }
})

app.get('/checktwitter', async (req,res) => {
    if(req.query.url === undefined || req.query.url === null){
        res.send({
            "error":"error"
        })
    }else{
        try{
            let twitterUsername;

            if(req.query.url.includes('https://twitter.com/')){
                twitterUsername = req.query.url.replace('https://twitter.com/','');
            }else if(req.query.url.includes('https://mobile.twitter.com/')){
                twitterUsername = req.query.url.replace('https://mobile.twitter.com/','');
            }

            let expUsername;
            if(twitterUsername != undefined){
                expUsername = twitterUsername.split('/');
            }

            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            await page.setUserAgent(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
            );
            await page.setJavaScriptEnabled(true);
            await page.goto(req.query.url, {
                waitUntil: 'networkidle2',
              });
            const dataPuppet = await page.evaluate(() => document.querySelector('*').outerHTML);
            await browser.close();

            const bufData = Buffer.from(dataPuppet);
            
            let isTw = false;

            if(req.query.url.includes('https://twitter.com/') || req.query.url.includes('https://mobile.twitter.com/')){
                if(expUsername.length == 1){
                    if(bufData.includes("@"+twitterUsername)){
                        if(bufData.includes("This account doesn’t exist")){
                            isTw = false;
                        }else{
                            isTw = true;
                        }
                    }
                }
            }

            let sendData = {
                "isTwitterUrl": isTw
            }
            res.send(sendData)
        }catch{
            res.send({
                "error":"error"
            })
        }
    }
})

app.listen(port);
console.log('Bullfrog url tool start on : ' + port);