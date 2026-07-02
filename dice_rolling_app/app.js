const HTTP = require ('http');
const URL = require('url').URL;
const PORT = 3000;
const HOST = 'localhost';
const SCHEME = 'http';

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1; // IMPROVEMENT: extracted logic from the SERVER object
}
const SERVER = HTTP.createServer((req, res) => { // req = request, res = response
  let method = req.method;
  let path = req.url;

  if (path === '/favicon.ico') {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.write('404 Not Found');
    res.end();

  } else {
    let url = new URL(path, `${SCHEME}://${HOST}:${PORT}`);
    let params = url.searchParams;
    let sidesRequested = Number(params.get('sides')); // added explicit coercion since URL.prototype.get() always returns strings
    let rollsRequested = params.get('rolls'); // added explicit coercion since URL.prototype.get() always returns strings
    let rollsString = '';

    for (let rollsCompleted = 0; rollsCompleted < rollsRequested; rollsCompleted += 1) {
      rollsString += `${String(rollDie(sidesRequested))}\n`;
    } 
    
    res.statusCode = 200; // method that sets the status code
    res.setHeader('Content-Type', 'text/plain'); // method that creates a key-value pair in the response header
    res.write(`${rollsString}\n${method} ${path}`); // method that writes the body of the response
    res.end(); // method that finalizes the response (indicates response is ready)

  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
});

