// <reference types="Cypress" />
const shared = require('../../shared/shared');

describe('About Dialog Reporting', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.bvdLogin(undefined, undefined, 60000);
    cy.visit('/#/show/Welcome');
    cy.get('[data-cy="help-button"]').click();
    cy.get('.spinner').should('not.be.visible');
    cy.get('[data-cy="aboutDialog"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000); // need some buffer time to load the content of iframe
  });

  it('"ABOUT" link must be visible and click on link must open about tab', () => {
    cy.get('[data-cy="bvd-about-iframe"]').then($iframe => {
      cy.wrap($iframe.contents().find('a[title="About"]')).click();
      cy.wrap($iframe.contents().find('#about-tab'));
      cy.wrap($iframe.contents().find('.qtm-capability-name')).contains('Business Value Dashboard');
    });
  });

  it('"LICENSE" link must be visible and click on link must open licence tab', () => {
    cy.get('[data-cy="bvd-about-iframe"]').then($iframe => {
      cy.wrap($iframe.contents().find('a[title="License"]')).click();
      cy.wrap($iframe.contents().find('#license-tab'));
      cy.wrap($iframe.contents().find('.control-group')).contains('Allowed number of dashboards');
    });
  });

  it('Open and close About dialog using the close button included in the', () => {
    cy.get('[data-cy="bvd-about-iframe"]').then($iframe => {
      cy.wrap($iframe.contents().find('.qtm-suite-logo'));
      cy.wrap($iframe.contents().find('.btn-primary')).click();
    });
    cy.get('[data-cy="bvd-about-iframe"]').should('not.exist');
  });

  it('Open and close About dialog using the additional close button', () => {
    cy.get('[data-cy="bvd-about-iframe"]').then($iframe => {
      cy.wrap($iframe.contents().find('.qtm-about-dialog'));
    });
    cy.get('[data-cy="closeBtnAbout"]').click();
    cy.get('[data-cy="bvd-about-iframe"]').should('not.exist');
  });

  it('Click outside the aboutDialog should close the corresponding window', () => {
    cy.get('[data-cy="bvd-about-iframe"]').then($iframe => {
      cy.wrap($iframe.contents().find('.qtm-about-dialog'));
    });
    cy.get('.navbar-body').click({ force: true });
    cy.get('[data-cy="bvd-about-iframe"]').should('not.exist');
  });
});
