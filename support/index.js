// Import commands.js using ES2015 syntax:
import './commands';
import 'cypress-plugin-snapshots/commands';
import '@cypress/code-coverage/support';
import 'cypress-plugin-tab';

const addContext = require('mochawesome/addContext');

Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    const screenshotFileName = `${runnable.parent.title} -- ${test.title} (failed).png`;
    addContext({ test }, `screenshots/${Cypress.spec.name}/${screenshotFileName}`);
  }
});

// Added this code as a workaround to solve the ResizeObserver issue.
// Details regarding the current ongoing discussion can be found here
// https://github.com/quasarframework/quasar/issues/2233
// https://github.com/w3c/csswg-drafts/issues/5488
Cypress.on('uncaught:exception', err => {
  if (err.message.includes('ResizeObserver')) {
    // returning false here prevents Cypress from
    // failing the test with resize observer errors
    console.log(`Resize observer issue ocurred ${err.message}`);
    return false;
  }
  return true;
});
