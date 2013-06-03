# A simple dashboard

That dashboard has been made during a 24 hours hackaton at [Mappy](http://fr.mappy.com).

It’s composed of 2 parts, a node server and a client page.
The server fetches data from twitter, mongodb, xiti and some other JSON source.
All data are consumed by a web page refreshing frequently thoses data.

To use it, you‘ll need to create a config.json file (see config.dist.json), install modules `express` and `mongodb`, then launch it so :

```bash
node launcher.js
```

