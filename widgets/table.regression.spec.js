// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('Table', shared.defaultTestOptions, () => {
  before(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestWidgets');
    cy.wait(['@getPage', '@getTOC']);
  });

  it('Table widget exist', () => {
    cy.contains('Table');
    cy.get('table-widget').find('thead').should('exist').and('contain', 'LOCATION');
  });

  it('Table widget has entries', () => {
    cy.get('table-widget').contains('Boeblingen');
  });
});

describe('Table - overwriting with page level config ', shared.defaultTestOptions, () => {
  before(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestTableWidget*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestTableWidget');
    cy.wait(['@getPage', '@getTOC']);
  });

  it('Table widget exist', () => {
    cy.contains('Table');
    cy.get('[data-cy="table-header-Place to be"]');
    cy.get('[data-cy="table-header-At the time"]');
  });
});

describe('Table widget should be rendered in the case where metadata is part of data API response', shared.defaultTestOptions, () => {
  before(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestTableDataInMetadata*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestTableDataInMetadata');
    cy.wait(['@getPage', '@getTOC']);
  });

  it('Table widget should exist', () => {
    cy.contains('Table');
    cy.get('[data-cy="table-header-Node Name"]');
    cy.get('[data-cy="table-header-App Name"]');
    cy.get('[data-cy="table-header-Interface IN Utilization"]');
  });

  it('Table has no Export to CSV action', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('.ux-menu').should('not.contain', 'Export to CSV');
  });

  it('Table widget should render data as it received', () => {
    cy.get('Table').should(tr => {
      // to find all td's
      const tds = tr.find('td');
      expect(tds[0].innerText).to.contain('N-1');
      expect(tds[9].innerText).to.contain('N-2');
    });
  });
});

describe('Table widget should combine data when more than one data section is configured', shared.defaultTestOptions, () => {
  before(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebApiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestTableMultipleData*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestTableMultipleData');
    cy.wait(['@getPage', '@getTOC']);
    cy.wait(['@getWebApiData', '@getWebApiData']);
  });
  it('Should contain table data of both the metric', () => {
    cy.get('Table').should(th => {
      const ths = th.find('th');
      expect(ths[0].innerText).to.contain('LOCATION');
      expect(ths[1].innerText).to.contain('AMOUNT');
    });

    cy.get('Table').should(tr => {
      const tds = tr.find('td');
      expect(tds[0].innerText).to.contain('Boeblingen');
      expect(tds[1].innerText).to.contain('5');
      expect(tds[2].innerText).to.contain('Bangalore');
      expect(tds[3].innerText).to.contain('8');
      expect(tds[4].innerText).to.contain('Berlin');
      expect(tds[5].innerText).to.contain('4');

      expect(tds[6].innerText).to.contain('Bangalore');
      expect(tds[7].innerText).to.contain('5');
      expect(tds[8].innerText).to.contain('Chennai');
      expect(tds[9].innerText).to.contain('8');
      expect(tds[10].innerText).to.contain('Mumbai');
      expect(tds[11].innerText).to.contain('4');
    });
  });
});

describe('Table widget should show no data message when the data is empty', shared.defaultTestOptions, () => {
  before(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebApiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestTableEmptyData*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestTableEmptyData');
    cy.wait(['@getPage', '@getTOC']);
    cy.wait(['@getWebApiData']);
  });

  it('Should contain no data message', () => {
    cy.get('[data-cy="notification-info-text"]').should('contain.text', 'No data');
  });
});
