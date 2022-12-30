require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
let bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
let globalobj = {};
// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
app.post('/api/shorturl', (req, res) => {
  let url = req.body.url,
    valid = true,
    purl = url.replace(/(^\w+:|^)\/\//, '');
  if (purl == url) valid = false;
  dns.lookup(purl, (err, data) => {
    if (err) valid = false;
  });
  if (globalobj[url] != null) {
    res.json({ original_url: url, shorturl: +(globalobj[url]) });
  }
  let n = 1;
  while (globalobj[n] != null) {
    n = Math.floor(Math.random() * 100) + 1;
  }
  let u = {
    n: n, url: url
  };
  if (!valid) {
    res.json({ error: 'Invalid URL' });
  }
  globalobj[n] = url;
  globalobj[url] = n;
  res.json({ original_url: url, shorturl: +n });
});

app.get('/api/shorturl/:num', (req, res) => {
  let n = req.params.num;
  if (globalobj[n] != null) {
    res.redirect(globalobj[n]);
  }
  else {
    res.json({ "error": "No short URL found for the given input" });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
