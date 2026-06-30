const HTTP = require('http');
const URL = require('url').URL;
const SCHEME = 'http';
const HOST = 'localhost';
const PORT = 3000;

const HTML_START = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <style type="text/css">
      body {
        background: rgba(250, 250, 250);
        font-family: sans-serif;
        color: rgb(50, 50, 50);
      }

      article {
        width: 100%;
        max-width: 40rem;
        margin: 0 auto;
        padding: 1rem 2rem;
      }

      h1 {
        font-size: 2.5rem;
        text-align: center;
      }

      table {
        font-size: 2rem;
      }

      th {
        text-align: right;
      }
    </style>
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>`;

const HTML_END = `
        </tbody>
      </table>
    </article>
  </body>
</html>`;

const APR = 0.05;
const APR_STR = (APR * 100).toFixed(0);
const MONTHLY_INTEREST_RATE = APR / 12;

const MIN_PRINCIPAL = 0;
const MIN_DURATION_YEARS = 1;

const VALIDATED_INVALID = 'INVALID';

function validatePrincipal(principal) {
  if (principal === null) return MIN_PRINCIPAL;
  
  principal = Number(principal);
  if (Number.isNaN(principal)) return VALIDATED_INVALID;
  if (principal < MIN_PRINCIPAL) return VALIDATED_INVALID;
  
  return principal;
}

function validateDurationInYears(durationInYears) {
  if (durationInYears === null) return MIN_DURATION_YEARS;
  
  durationInYears = Number(durationInYears);
  if (Number.isNaN(durationInYears)) return VALIDATED_INVALID;
  if (durationInYears < MIN_DURATION_YEARS) return VALIDATED_INVALID;
  
  return durationInYears;
}

function validateParams(params) {
  let principal = params.get('amount');
  let durationInYears = params.get('duration');

  return [validatePrincipal(principal), validateDurationInYears(durationInYears)];
}

function calcMonthlyPayment(principal, monthlyInterestRate, durationInMonths) {
  return principal * (monthlyInterestRate / (1 - (1 + monthlyInterestRate) ** (-durationInMonths)));
}

function createLoanOffer(principal, durationInYears) {
  let durationInMonths = durationInYears * 12;
  let monthlyPayment = calcMonthlyPayment(principal, MONTHLY_INTEREST_RATE, durationInMonths);
  let monthlyPaymentStr = monthlyPayment.toFixed(2);

  return `${HTML_START}
      <tr>
        <th>Amount:</th>
        <td><a href="${SCHEME}://${HOST}:${PORT}/?amount=${principal - 100}&duration=${durationInYears}">- $100</a></td>
        <td>$${principal}</td>
        <td><a href="${SCHEME}://${HOST}:${PORT}/?amount=${principal + 100}&duration=${durationInYears}">+ $100</a></td>
      </tr>
      <tr>
        <th>Duration:</th>
        <td><a href="${SCHEME}://${HOST}:${PORT}/?amount=${principal}&duration=${durationInYears - 1}">- 1 year</a></td>
        <td>${durationInYears} years</td>
        <td><a href="${SCHEME}://${HOST}:${PORT}/?amount=${principal}&duration=${durationInYears + 1}">+ 1 year</a></td>
      </tr>
      <tr>
        <th>APR:</th>
        <td colspan='3'>${APR_STR}%</td>
      </tr>
      <tr>
        <th>Monthly payment:</th>
        <td colspan='3'>$${monthlyPaymentStr}</td>
      </tr>
      ${HTML_END}`
  
}

const SERVER = HTTP.createServer((req, res) => {
  let path = req.url;

  if (path === '/favicon.ico') {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.write('404 Not Found');
    res.end();
    return;
  }

  let url = new URL(path, `${SCHEME}://${HOST}:${PORT}`);
  let params = url.searchParams;
  let [principal, durationInYears] = validateParams(params);

  if (principal === VALIDATED_INVALID || durationInYears === VALIDATED_INVALID) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain');
    res.write('400: invalid parameter');
    res.end()
  
  } else {
    let loanOfferHTML = createLoanOffer(principal, durationInYears); // extracted loan offer logic (application logic) into createLoanOaffer function to separate from server logic
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(loanOfferHTML); 
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
});