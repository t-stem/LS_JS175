const EXPRESS = require('express');
const APP = EXPRESS();

const PORT = 3000;

APP.set("views", "./views");
APP.set("view engine", "pug");

APP.get("/", (request, response) => {
  response.render('hello-world-english');
});

let logPortNumber = () => console.log(`Listening on port: ${PORT}`);
APP.listen(PORT, "localhost", logPortNumber);