const express = require('express');
const morgan = require('morgan');
const app = express();

const PORT = 3000;

const contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

const sortContacts = contacts => {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
};

const createContact = (newContact) => {
   contactData.push(newContact);
}

app.set("views", './views');
app.set("view engine", "pug");

app.use(express.static("public")); // checks whether requested static assets exists in /public and serves it if it does
app.use(express.urlencoded({ extended: false})); // needed to decode data from body of html requests
app.use(morgan("common")); // logs http requests to the terminal

const redirectToContacts = (request, response) => response.redirect("/contacts");

app.get("/", redirectToContacts);

const renderContacts = (request, response) => {
  let viewVars = {contacts: sortContacts(contactData)};
  response.render("contacts", viewVars);
}
app.get("/contacts", renderContacts);

const renderNewContact = (request, response) => response.render("new-contact-form");
app.get("/contacts/new", renderNewContact);

const postNewContactForm = (request, response) => {
  let newContact = {...request.body};

  createContact(newContact);

  redirectToContacts(request, response);
}
app.post("/contacts/new", postNewContactForm);

const logListening = () => console.log(`Listening to port: ${PORT}`);
app.listen(PORT, "localhost", logListening);