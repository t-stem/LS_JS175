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


const createObjOfEntry = (entry) => {
  return {
      key: entry[0],
      value: entry[1],
    };
};

const reverseObjOfEntry = ({key, value}) => {
  return [key, value];
}

const mapObjOfEntry = (objOfEntry, callback) => { // callback must accept an entry object and return the mapped value
  let { key, value } = objOfEntry;
  return [key, callback(objOfEntry)];
};

const mapObject = (obj, callback) => {
  let entries = Object.entries(obj);

  return Object.fromEntries(
    entries
      .map(entry => createObjOfEntry(entry))
      .map(objOfEntry => mapObjOfEntry(objOfEntry, callback))
  );
};

const filterObjOfEntryValues = ({key, value}, callback) => {
  return callback(value);
};

const filterObjOfEntryKeys = ({key, value}, callback) => {
  return callback(key);
}

const filterObject = (filterObjOfEntry, obj, callback) => { // filterfunction must e 
  let entries = Object.entries(obj);

  return Object.fromEntries(
    entries
      .map(entry => createObjOfEntry(entry))
      .filter(objOfEntry => filterObjOfEntry(objOfEntry, callback))
      .map(objOfEntry => reverseObjOfEntry(objOfEntry))
  );
};

const filterObjectKeys = (obj, callback) => {
  return filterObject(filterObjOfEntryKeys, obj, callback);
};

const filterObjectValues = (obj, callback) => {
  return filterObject(filterObjOfEntryValues, obj, callback);
};

const entryStringLength = ({key, value}) => { // value must be a string
  if (typeof(value) === 'string') return value.length;

  return value;
};

const isZero = (int) => int === 0;

const entryErrorMessage = ({key, value}) => {
  return `${key} is required.`;
};

const checkContactForErrors = (newContactObj) => {
  let mappedFieldLengthsObj = mapObject(newContactObj, entryStringLength);
  let filteredFieldLengthsObj = filterObjectValues(mappedFieldLengthsObj, isZero);
  let mappedErrorMessagesObj = mapObject(filteredFieldLengthsObj, entryErrorMessage);
  let errorMessagesArr = Object.values(mappedErrorMessagesObj);

  return errorMessagesArr;
}

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
  let varsToTemplate = { ...viewVarsObj };

  if (!Object.keys(varsToTemplate).includes('errorMessages')) {
    varsToTemplate['errorMessages'] = [];
  }
  
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
    console.log(viewVars)
    renderNewContact(request, response, viewVars);

  } else {
    
    createContact(newContact);

    redirectToContacts(request, response);
  }
}
app.post("/contacts/new", postNewContactForm);

const logListening = () => console.log(`Listening to port: ${PORT}`);
app.listen(PORT, "localhost", logListening);