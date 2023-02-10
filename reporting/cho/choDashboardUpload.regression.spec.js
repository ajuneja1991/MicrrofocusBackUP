const shared = require('../../shared/shared');
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
const dashboardFileUpload = require('../../../../support/reporting/restUtils/uploadFile');

describe('tests for load testing on cho system', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
  });
  const iterations = 100;
  let i = 0;

  it('dashboard Upload for CHO System and reload 100 times for load testing', () => {
    cy.bvdLogin();
    dashboardFileUpload.uploadFileRequest('reporting/MultiSeriesLineChart_chrome.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.visit('/#/show/MultiSeriesLineChart_chrome?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);

    while (i < iterations) {
      cy.reload();
      cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
      cy.get('#load-spinner').should('not.be.visible');
      i += 1;
      cy.log(`reloaded${i}`);
    }
    MainPage.logOutOfBVD();
  });
});
