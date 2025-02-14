require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const util = require('util');
const dns = require('dns');
let bodyParser = require('body-parser');
const lookup = util.promisify(dns.lookup);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

// Basic Configuration
const port = process.env.PORT || 3000;
const validateUrl = async (url) => {
  let valid = true,
    purl = (url.replace(/(^http:\/\/|^https:\/\/|^ftp:\/)/, '')).replace(/\/.*$/, '');
  if (purl == url) valid = false;
  try {
    let x = await lookup(purl);
  }
  catch (err) {
    valid = false;
  }
  return valid;
};

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
const globalobj = ['index0'];
// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res, next) => {
  let url = req.body.url;
  if (! await validateUrl(url)) {
    res.json({ error: 'Invalid URL' });
    return;
  }
  next();
}, (req, res) => {
  let url = req.body.url;
  if (!globalobj.includes(url)) {
    globalobj.push(url);
  }
  res.json({ original_url: url, short_url: globalobj.indexOf(url) });
});

app.get('/api/shorturl/:num', (req, res) => {
  let num = req.params.num;
  if (isNaN(num)) {
    res.json({ "error": "Wrong format" });
  }
  else if ((globalobj[+num] != null)) {
    res.redirect(globalobj[num]);
  }
  else {
    res.json({ "error": "No short URL found for the given input" });
  }
});

app.use('/*', (req, res) => {
  res.send('Not Found');
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
