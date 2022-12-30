require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const util = require('util');
const dns = require('dns');
let bodyParser = require('body-parser');
const lookup = util.promisify(dns.lookup);

// Basic Configuration
const port = process.env.PORT || 3000;
const validateUrl = async (url) => {
  let valid = true, 
    purl = url.replace(/(^\w+:|^)\/\//, ''),
    res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  if (purl == url || !res) valid = false;
  try {
    let url = await lookup(purl);
    console.log(purl, JSON.stringify(url));
  }
  catch (err) {
    valid = false;
  }
  return valid;
};
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
app.post('/api/shorturl', async (req, res) => {
  let url = req.body.url;
  if (! await validateUrl(url)) {
    res.json({ error: 'Invalid URL' });
    return;
  }
  if (globalobj[url] != null) {
    res.json({ original_url: url, shorturl: +(globalobj[url]) });
    return;
  }
  let n = 1;
  while (globalobj[n] != null) {
    n = Math.floor(Math.random() * 100) + 1;
  }
  globalobj[n] = url;
  globalobj[url] = n;
  res.json({ original_url: url, shorturl: +n });
});

app.get('/api/shorturl/:num', (req, res) => {
  let n = req.params.num;
  if (globalobj[+n] != null) {
    res.redirect(302, globalobj[+n]);
  }
  else {
    res.json({ "error": "No short URL found for the given input" });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
