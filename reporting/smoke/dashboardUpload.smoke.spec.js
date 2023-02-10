import 'cypress-file-upload';
const shared = require('../../shared/shared');
import DashBoardPage from '../../../../support/reporting/pageObjects/DashboardPage';
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';
import { dashboardDelete } from '../../../../support/reporting/restUtils/dashboard';
import { createDashboardMenuCategory } from '../../../../support/reporting/restUtils/category';

describe('Dashboard upload', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dashboard/*`).as('dashboard');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/ui/dashboard/MaliciousLink*`).as('dashboardUiLoad');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/categories?*`).as('categoriesLoad');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
    cy.intercept({ method: 'DELETE', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/categories` }).as('deleteCategory');
  });

  it('Perform dashboard upload with unsupported file format', () => {
    cy.bvdLogin();
    cy.visit('/#/config');
    cy.wait(['@pageloadUser', '@dashboard']);
    DashBoardPage.uploadDashboard(`reporting/obm_sample.vsdx`);
  });

  it('upload dashboard with External URL during svg creation', () => {
    uploadFileRequest('reporting/MaliciousLink.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
    cy.bvdLogin();
    cy.visit('/#/show/MaliciousLink?params=none');
    cy.wait(['@pageloadUser', '@dashboard']);
    cy.get('#load-spinner').should('not.be.visible');
    MainPage.resetExtBannerForever();
    MainPage.checkIfExternalLinkBannerIsPresent();
    MainPage.hideExternalBanner();
    cy.reload();
    cy.wait(['@pageloadUser', '@dashboard']);
    MainPage.checkIfExternalLinkBannerIsPresent();
    MainPage.removeExtBannerForEver();
    cy.reload();
    cy.wait(['@pageloadUser', '@dashboard']);
    MainPage.checkExternalLinkBannerIsNotPresent();
  });

  it('Should check for deleting the menu category from dashboard', () => {
    createDashboardMenuCategory('testMenuCategory', 'menu');
    cy.bvdLogin();
    cy.visit('/#/config/MaliciousLink?params=none');
    cy.wait(['@pageloadUser', '@dashboardUiLoad', '@categoriesLoad', '@categoriesLoad', '@dashboard']);
    cy.get('[data-cy="menu-category"] input').click();
    cy.get('[data-cy="delete-testMenuCategory"]').click();
    cy.get('div.modal-body').contains('Are you sure you want to delete menu category "testMenuCategory"?');
    cy.get('button#deleteCategory').click();
    cy.wait('@deleteCategory');
  });

  after(() => {
    MainPage.resetExtBannerForever();
    // Logout of session if test fails during execution and logout does not occur through UI
    cy.bvdLogout();
    dashboardDelete('MaliciousLink');
  });
});
