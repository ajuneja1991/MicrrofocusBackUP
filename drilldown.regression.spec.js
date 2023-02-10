// <reference types="Cypress" />
const shared = require('../../shared/shared');

describe('Drill down via actions', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebApiData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiDrillDownTest*`
    }).as('getPagesData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiDrillDownTest?_s=1585287000000&_e=1585294200000&_tft=A');
    cy.wait(['@getPagesData', '@getTOC']);
  });

  it('drillDown via PageId', () => {
    cy.get('#PageId').click();
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.url().should('include', 'uiTestPage');
  });

  it('drillDown via Context', () => {
    cy.get('#Context').click();
    cy.wait('@getPagesMetadata');
    cy.url().should('include', 'uiDrillDownPredicate');
  });
});

describe('Drill down links enabled', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebApiData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestHasTimeCtx*`
    }).as('getPagesData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestHasTimeCtx?_m=hasTimeContextEntry');
    cy.wait(['@getPagesData', '@getWebApiData', '@getWebApiData', '@getTOC']);
  });

  it('Enabling the drill down links', () => {
    cy.get('[data-cy="drillDownButton"]').should('not.exist');
    cy.get('simple-list').contains('loadgen.mambo.net').click();
    cy.wait(['@getPagesMetadata', '@getWebApiData']);
    cy.get('[data-cy="drillDownButton"]');
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
    cy.get('[data-cy="context-tag-Host"] button.tag-remove').click();
    cy.wait(['@getWebApiData', '@getWebApiData']);
    cy.get('[data-cy="drillDownButton"]').should('not.exist');
    cy.get('simple-list').contains('loadgen.mambo.net').click();
    cy.wait(['@getPagesMetadata', '@getWebApiData']);
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy="drilldown-uiTestLocalization"]').click();
    cy.wait(['@getPagesMetadata', '@getWebApiData', '@getPagesMetadata']);
    cy.url().should('include', 'uiTestLocalization');
    cy.url().should('not.include', '_m=');
    cy.get('[data-cy="drillDownButton"]');
  });
});

describe('Drill down links disabled', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebApiData');
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

  after(() => {
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
      const appConfig = result.body.data.appConfig;
      if (appConfig.app.options.disableDrilldown) {
        appConfig.app.options.disableDrilldown = false;
        cy.getCookie('secureModifyToken').then(val => {
          cy.request({
            method: 'PUT',
            url: `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`,
            body: appConfig,
            headers: {
              'X-Secure-Modify-Token': val.value
            }
          });
        });
      }
    });
  });

  it('Disable the drill down icon', () => {
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
      const appConfig = result.body.data.appConfig;
      appConfig.app.options.disableDrilldown = true;
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'PUT',
          url: `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`,
          body: appConfig,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(() => {
          cy.visit('/uiTestWidgets');
          cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getTOC']);
          cy.get('simple-list').contains('loadgen.mambo.net').click();
          cy.wait(['@getPagesMetadata', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData']);

          if (Cypress.env('TestEnvironment') === 'development') {
            // in local test and build env we have one app config, so we will allow to disable the drill-down button
            cy.get('[data-cy="drillDownButton"]').should('not.exist');
          } else {
            // in system test environment we have 2 app configs, so we will NOT allow to disable the drill-down button
            cy.get('[data-cy="drillDownButton"]');
          }
          appConfig.app.options.disableDrilldown = false;
          cy.getCookie('secureModifyToken').then(value => {
            cy.request({
              method: 'PUT',
              url: `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`,
              body: appConfig,
              headers: {
                'X-Secure-Modify-Token': value.value
              }
            });
          }).then(() => {
            cy.visit('/uiTestWidgets');
            cy.wait(['@getTOC', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
            cy.get('simple-list').contains('loadgen.mambo.net').click();
            cy.wait(['@getPagesMetadata', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
            cy.get('[data-cy="drillDownButton"]');
          });
        });
      });
    });
  });
});

describe('Drill down by context type', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
  });

  it('Drill down to details page via context and page level actions', () => {
    cy.visit('/uiDrillDownOnLoadTest?_tft=A&_a=drillDown&_ctx=~(~(type~%27incident~id~%272191e727-13ea-47fb-971b-70c7038d5a37~name~%27NodeDown)~(type~%27node~id~%2772114710-036c-4c77-a75c-6d407ee9a449~name~%27nsntc-n3140-5)~(type~%27interface~id~%2727195f30-434e-48c1-948e-1bf9c22696d2~name~%27nsntc-n3140-5))');
    cy.wait(['@getPage', '@getTOC']);
    cy.url().should('include', 'nodeDrillDownPage');
  });
});

describe('Incorrect predicate regex', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebApiData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/nodeDrillDownPageWithRegexError*`
    }).as('getPageData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/nodeDrillDownPageWithRegexError');
    cy.wait(['@getPageData', '@getTOC']);
  });

  it('Show drill down on page with incorrect regex', () => {
    cy.url().should('include', 'nodeDrillDownPageWithRegexError');
    cy.get('[data-cy="drillDownButton"]').should('not.exist');
    cy.get('simple-list').contains('loadgen.mambo.net').click();
    cy.wait(['@getPagesMetadata', '@getWebApiData']);
    cy.get('[data-cy="drillDownButton"]').click();
  });
});
