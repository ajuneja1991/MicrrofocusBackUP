const shared = require('../../shared/shared');

import dataCollector from '../../../../support/reporting/restUtils/dataCollector';
import dashboard from '../../../../support/reporting/restUtils/dashboard';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import EditDashboardPage from '../../../../support/reporting/pageObjects/EditDashboardPage';

describe('Group widget test', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
  });

  it('Multiple group widget scroll', () => {
    // Added for defect 1360390: Group widget: Problems scrolling with two groups widgets on one dashboard
    uploadFileRequest('reporting/MultipleGroupWidget.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();
    cy.visit('/#/show/MultipleGroupWidget?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);

    // Scroll by click in the first group widget
    cy.get('#group24widgetGroupScroll').click(0, 100);
    cy.get('#group24widgetGroupScroll rect.st3').should('be.visible');
    cy.get('#group28widgetGroupScroll rect.st3').should('be.visible');

    // Scroll by click in the second group widget
    cy.get('#group28widgetGroupScroll').click(0, 150);
    cy.get('#group28widgetGroupScroll rect.st3').should('be.visible');
    cy.get('#group24widgetGroupScroll rect.st3').should('be.visible');
  });

  it('Last entry should not get cut', () => {
    // Added for defect 1378245: Last entry gets cut in group widget
    uploadFileRequest('reporting/Discos.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    uploadFileRequest('reporting/NOM_MPLS_LSP_TopN.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();

    cy.visit('/#/show/Discos?params=none');
    cy.wait(['@pageloadUser', '@channelState', '@pageloadSystem']);

    cy.get('#group226widgetGroupScroll').click(0, 140);
    cy.get('#instance-group226-9-shape211').should('not.exist');
    MainPage.checkText('instance-group226-10-shape211', 10);

    cy.visit('/#/show/Discos?params=none&page=4');
    cy.wait(['@pageloadUser']);
    MainPage.checkText('instance-group226-10-shape211', 10);

    cy.visit('/#/show/NOM_MPLS_LSP_TopN?params=none');
    cy.wait(['@pageloadUser', '@channelState']);
    cy.get('#group1101widgetGroupScroll').click(0, 190);
    cy.get('#instance-group1101-1-shape1079').should('not.exist');
    MainPage.checkText('instance-group1101-7-shape1079', 7);
  });

  it('Old Group Widgets should not have search Toggle', () => {
    // Defect 1449205 - Reporting: Hide search toggle in widget group if there is no magnifying glass in widget
    uploadFileRequest('reporting/NOM_MPLS_LSP_TopN.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();

    cy.visit('/#/show/NOM_MPLS_LSP_TopN?params=none');
    cy.wait(['@pageloadUser', '@channelState', '@pageloadSystem']);

    MainPage.clickDashboardEdit();
    EditDashboardPage.selectWidget('group1101');
    EditDashboardPage.checkSearchFieldNotVisible();
    cy.bvdLogout();
  });

  after(() => {
    // Logout of session if test fails during execution and logout does not occur through UI
    cy.bvdLogin();
    dashboard.dashboardDelete('MultipleGroupWidget');
    dashboard.dashboardDelete('Discos');
    dashboard.dashboardDelete('NOM_MPLS_LSP_TopN');
    dataCollector.deleteAllQueries();
    cy.bvdLogout();
  });
});
