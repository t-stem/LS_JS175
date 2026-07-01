const HTTP = require('http');
const URL = require('url').URL;
const HANDLEBARS = require('handlebars');

const SCHEME = 'http';
const HOST = 'localhost';
const PORT = 3000;

const SOURCE = `
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
        font-size: 1.5rem;
      }
      th {
        text-align: right;
      }
      td {
        text-align: center;
      }
      th,
      td {
        padding: 0.5rem;
      }
    </style>
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>
          <tr>
            <th>Amount:</th>
            <td>
              <a href='/?amount={{principalDecrement}}&duration={{durationInYears}}'>- $100</a>
            </td>
            <td>$ {{principal}}</td>
            <td>
              <a href='/?amount={{principalIncrement}}&duration={{durationInYears}}'>+ $100</a>
            </td>
          </tr>
          <tr>
            <th>Duration:</th>
            <td>
              <a href='/?amount={{principal}}&duration={{durationInYearsDecrement}}'>- 1 year</a>
            </td>
            <td>{{durationInYears}} years</td>
            <td>
              <a href='/?amount={{principal}}&duration={{durationInYearsIncrement}}'>+ 1 year</a>
            </td>
          </tr>
          <tr>
            <th>APR:</th>
            <td colspan='3'>{{apr}}%</td>
          </tr>
          <tr>
            <th>Monthly payment:</th>
            <td colspan='3'>$ {{monthlyPayment}}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </body>
</html>
`;

const LOAN_OFFER_TEMPLATE = HANDLEBARS.compile(SOURCE);

const APR = 0.05;
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

function areAllArgsValid(...args) {
  return !args.includes(VALIDATED_INVALID);
}

function calcMonthlyPayment(principal, monthlyInterestRate, durationInMonths) {
  let monthlyPayment = principal * (monthlyInterestRate / (1 - (1 + monthlyInterestRate) ** (-durationInMonths)));
  return monthlyPayment.toFixed(2);
}

function createLoanOffer(params) {
  const MONTHLY_INTEREST_RATE = APR / 12;
  const DELTA_PRINCIPAL = 100;
  const DELTA_DURATION_YEARS = 1;
  let offerData = {};
  offerData.apr = `${(APR * 100).toFixed(2)}`;

  let [principal, durationInYears] = validateParams(params);

  offerData.principal = principal;
  offerData.principalDecrement = principal === VALIDATED_INVALID ? MIN_PRINCIPAL : principal - DELTA_PRINCIPAL;
  offerData.principalIncrement = principal === VALIDATED_INVALID ? MIN_PRINCIPAL : principal + DELTA_PRINCIPAL;

  offerData.durationInYears = durationInYears;
  offerData.durationInYearsDecrement = durationInYears === VALIDATED_INVALID ? MIN_DURATION_YEARS : durationInYears - DELTA_DURATION_YEARS;
  offerData.durationInYearsIncrement = durationInYears === VALIDATED_INVALID ? MIN_DURATION_YEARS : durationInYears + DELTA_DURATION_YEARS;
  
  let durationInMonths = durationInYears * 12;
  offerData.monthlyPayment  = areAllArgsValid(principal, durationInYears) ? calcMonthlyPayment(principal, MONTHLY_INTEREST_RATE, durationInMonths) : VALIDATED_INVALID;

  return offerData;
}

function renderTemplateHTML(template, data) {
  let html = template(data);
  return html;
}

const SERVER = HTTP.createServer((req, res) => {
  let path = req.url;

  if (path === '/favicon.ico') {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.write('404 Not Found');
    res.end();
    return;
  
  } else {
    let url = new URL(path, `${SCHEME}://${HOST}:${PORT}`);
    let params = url.searchParams;
    let offerData = createLoanOffer(params);
    let HTMLcontent = renderTemplateHTML(LOAN_OFFER_TEMPLATE, offerData);
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(HTMLcontent); 
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
});