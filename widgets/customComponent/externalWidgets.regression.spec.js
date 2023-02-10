// <reference types="Cypress" />
const shared = require('../../../../shared/shared');

const pageIDs = [];

const testExternalWidgetsWithSpecificAngularVersion = angularVersion => {
  // check Angular Forms
  cy.get(`#external_component_test_mfe_forms_ng${angularVersion}`).within(() => {
    cy.get('#input1').type('test');
    cy.get('#input2').type('abc');
    cy.contains('Submit').click();
    cy.contains('Submitted values: Input 1: test, Input 2: abc');
  });

  // check UIF API
  cy.get(`#external_component_test_mfe_uif_api_demo_ng${angularVersion}`).within(() => {
    cy.get('#btnTestSpinnerOverlay').click();
    cy.get('[data-cy=spinnerOverlay]').should('be.visible');
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('#contextB1').click();
  });
  cy.wait(['@getPagesMetadata']);
  cy.contains('[data-cy=contextLabelType-ItemB]', 'contextB1');
  cy.get('[data-cy=context-tag-ItemB] button.tag-remove').click();

  // check ngx-formly
  cy.get(`#external_component_test_mfe_formly_ng${angularVersion}`).within(() => {
    cy.get('input').clear().type('test@test.com');
    cy.contains('Submit').click();
    cy.contains('Submitted: Model: test@test.com');
  });

  // check l10n
  cy.get(`#external_component_test_mfe_flip_card_ng${angularVersion}`).within(() => {
    cy.contains('Translation works!');

    // check data load
    cy.contains('Failed to load data').should('not.exist');
  });
};

describe('Custom Component', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/moduleFederationPage*`
    }).as('loadPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
  });

  ['13', '14'].forEach(angularVersion => {
    it(`Angular v${angularVersion}: Check the loading and functionality of a custom widgets created with mfe`, () => {
      cy.visit(`/moduleFederationPageNg${angularVersion}`);
      cy.wait(['@loadPage', '@getTOC']);
      cy.get('mondrian-widget').should('have.length', 5);
      cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');

      testExternalWidgetsWithSpecificAngularVersion(angularVersion);
    });
  });

  it(`WebComponents: Check the loading and functionality of a custom widgets created with mfe`, () => {
    cy.visit('/moduleFederationPageWebComponents');
    cy.wait(['@loadPage', '@getTOC']);
    cy.get('mondrian-widget').should('have.length', 9);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');

    testExternalWidgetsWithSpecificAngularVersion('13_web_comp');
    testExternalWidgetsWithSpecificAngularVersion('14_web_comp');
  });
});

describe('External Component API Testing', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/moduleFederationApiTest*`
    }).as('loadPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
  });

  it('Check mondrain API setTimeframe is available to external components', () => {
    cy.visit('/moduleFederationApiTest');
    cy.wait(['@loadPage', '@getTOC']);
    cy.get('mondrian-widget').should('have.length', 1);
    cy.get('context-view').find('.context-filter-menu').should('contain', '2 Hours');
    cy.get('[data-cy=mfe-uif-api-demo]').within(() => {
      cy.get('[data-cy=btnTestSetTimeframe]').click();
    });
    cy.get('context-view').find('.context-filter-menu').should('contain', '9/24/2021');
  });

  it('Check mondrain API getConfig is available to external components', () => {
    cy.visit('/moduleFederationApiTest');
    cy.wait(['@loadPage', '@getTOC']);
    cy.get('mondrian-widget').should('have.length', 1);

    cy.get('[data-cy=mfe-uif-api-demo]').within(() => {
      cy.get('[data-cy=configOldText]').should('contain', 'This widget demonstrates different exposed functionalities from the mondrain API.');
      cy.get('[data-cy=configNewText]').should('contain', '');
      cy.get('[data-cy=btnTestGetConfig]').click();
      cy.get('[data-cy=configNewText]').should('contain', 'RESET');
    });
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy=page-action-item-saveAs]').click();
    cy.wait(['@getTOC']);
    cy.get('#pgmt-radio-button-definition > .ux-radio-button > .ux-radio-button-container').click();
    cy.get('[data-cy="pgmt-properties-definition-title"]').clear().type('test MFE api');
    cy.get('[data-cy="submit-button"]').click();
    cy.bvdCheckToast('test MFE api');
    cy.get('[data-cy="mondrianBreadcrumbData"] > span').then($data => {
      expect($data).contain.text('test MFE api');
    });
    cy.get('[data-cy=mfe-uif-api-demo]').within(() => {
      cy.get('[data-cy=configOldText]').should('contain', 'RESET');
      cy.get('[data-cy=configNewText]').should('contain', '');
    });
    shared.addToPageIDs(pageIDs);
  });

  afterEach(() => {
    shared.deletePages(pageIDs);
  });
});
