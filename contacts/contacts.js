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

const validateFirstName = (contactObj, errorMessagesArr) => {
  if (!contactObj.hasOwnProperty('firstName')) {
    errorMessagesArr.push('First name property does not exist');
    return;
  } 
  
  let firstName = contactObj['firstName']
    .trim();

  if (firstName.length === 0) {
    errorMessagesArr.push('First name is required');
  }
}

const validateLastName = (contactObj, errorMessagesArr) => {
  if (!contactObj.hasOwnProperty('lastName')) {
    errorMessagesArr.push('Last name property does not exist');
    return;
  }

  let lastName = contactObj['lastName']
    .trim();

  if (lastName.length === 0) {
    errorMessagesArr.push('Last name is required');
  }
}

const validatePhoneNumber = (contactObj, errorMessagesArr) => {
  if (!contactObj.hasOwnProperty('phoneNumber')) {
    errorMessagesArr.push('Phone number property doesn not exist');
    return;
  }

  let phoneNumber = contactObj['phoneNumber']
    .trim();

  if (phoneNumber.length === 0) {
    errorMessagesArr.push('Phone number is required');
  }
}

const checkContactForErrors = (contactObj) => {
  let errorMessages = [];

  validateFirstName(contactObj, errorMessages);
  validateLastName(contactObj, errorMessages);
  validatePhoneNumber(contactObj, errorMessages);

  return errorMessages;
}

const redirectToContacts = (request, response) => response.redirect("/contacts");

app.get("/", redirectToContacts);

const renderContacts = (request, response, viewVarsObj) => {
  let varsToTemplate = {
    ...viewVarsObj,
    contacts: sortContacts(contactData)
  };

  response.render("contacts", varsToTemplate);
}

app.get("/contacts", (request, response) => { // this arrow function syntax is necessary to prevent app.get from calling renderNewContact with a 'next' argument
  renderContacts(request, response);
});

const renderNewContact = (request, response, viewVarsObj={}) => {
  let varsToTemplate = { 
    errorMessages: [], // if viewVarsObj contains a property with this name, the existing one with an empty array value will be overwritten
    ...viewVarsObj 
  };
  
  response.render("new-contact-form", varsToTemplate)
};

app.get("/contacts/new", (request, response) => { // this arrow function syntax is necessary to prevent app.get from calling renderNewContact with a 'next' argument
  renderNewContact(request, response); 
});

const postNewContactForm = (request, response) => {
  let newContact = {...request.body};

  let errorMessagesArr = checkContactForErrors(newContact);

  if (errorMessagesArr.length > 0) {
    
    let viewVars = { errorMessages: errorMessagesArr };
    renderNewContact(request, response, viewVars);

  } else {
    
    createContact(newContact);

    redirectToContacts(request, response);
  }
}
app.post("/contacts/new", postNewContactForm);

const logListening = () => console.log(`Listening to port: ${PORT}`);
app.listen(PORT, "localhost", logListening);