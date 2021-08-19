const express = require('express');
const app = express()
const superagent = require('superagent')
const cheerio = require('cheerio')
const Nightmare = require('nightmare'); 
const nightmare = Nightmare({ show: true }); 

let server = app.listen(3000, '0.0.0.0', () => {
  let host = server.address().address;
  let port = server.address().port
  console.log('Your App is running at http://%s:%s', host, port);
})

let hostNews = []
let localNews = []

let getHostNews = (res) => {
  let hostNews = []
  let $ = cheerio.load(res.text)
  $('div#pane-news a').each((idx, ele) => {
    let news = {
      title: $(ele).text(),
      href: $(ele).attr('href')
    }
    hostNews.push(news)
  })
  return hostNews
}

nightmare
.goto('http://news.baidu.com/')
.wait("div#local_news")
.evaluate(() => document.querySelector("div#local_news").innerHTML)
.then(htmlStr => {
  // 获取本地新闻数据
  localNews = getLocalNews(htmlStr)
})
.catch(error => {
  console.log(`本地新闻抓取失败 - ${error}`);
})

let getLocalNews = (htmlStr) => {
  let localNews = [];
  let $ = cheerio.load(htmlStr);

  // 本地新闻
  $('ul#localnews-focus li a').each((idx, ele) => {
    //console.log(ele)
    let news = {
      title: $(ele).text(),
      href: $(ele).attr('href'),
    };
    localNews.push(news)
  });
  return localNews
}

superagent.get('http://news.baidu.com/').end((err, res) => {
  if(err) {
    console.log(`抓取热点新闻失败: ${err}`)
  }
  else {
    hostNews = getHostNews(res)
  }
})

app.get('/', (req, res) => {
  res.send({
    hostNews,
    localNews
  })
})