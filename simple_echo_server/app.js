const HTTP = require ('http');
const PORT = 3000;

const SERVER = HTTP.createServer((req, res) => { // req = request, res = response
  let method = req.method;
  let path = req.url;

  if (path !== '/favicon.ico') {
    res.statusCode = 200; // method that sets the status code
    res.setHeader('Content-type', 'text/plain'); // method that creates a key-value pair in the response header
    res.write(`${method} ${path}`); // method that writes the body of the response
    res.end(); // method that finalizes the response (indicates response is ready)
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.write('404 Not Found');
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
});

