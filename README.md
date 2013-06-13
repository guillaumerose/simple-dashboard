# A simple dashboard

That dashboard has been made during a 24 hours hackaton at [Mappy](http://fr.mappy.com).

It’s composed of 2 parts, a node server and a client web page.

The server fetches data like :
  - followers and last tweets from twitter, 
  - some collection count from mongodb,
  - some analytics from xiti, 
  - geoposition points from a JSON files,
  - html text from a file.

All of those data are consumed by a web page refreshing them frequently.

## Install

To use it, you‘ll need to :
  1. launch `npm install` to install dependencies,
  2. create a `config.json` file (copy `config.dist.json`) and adapt configuration to your needs, 
  3. in `www/resources`, you may also create `edito.txt` (copy `edito.dist.txt`) and `outdoor.json` (copy `outdoor.dist.json`),
  4. then launch the server with `node launcher.js`,
  5. open your browser on `http://localhost:8000/`.

## Run in production

To deploy on a server, use `./prod.sh`.

## Develop

During development, you can use `npm run-script run` (or `nodemon launcher.js`) which will reload the app when a file changes.
