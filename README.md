# A simple dashboard

That dashboard has been made during a 24 hours hackaton at [Mappy](http://fr.mappy.com).

It’s composed of 2 parts, a node server and a client page.
The server fetches data from twitter, mongodb, xiti, text file and geoposition points from a JSON source.
All data are consumed by a web page refreshing frequently thoses data.

To use it, you‘ll need to create a `config.json` file (based on `config.dist.json`), install modules `express`, `mongodb` and `twit`, then launch :

```bash
node launcher.js
```

In `www/resources`, you may also create `edito.txt` (based on `edito.dist.txt`) and `outdoor.json` (based on `outdoor.dist.json`).
