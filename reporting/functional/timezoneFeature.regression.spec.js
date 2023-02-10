const shared = require('../../shared/shared');
import MainPage from '../../../../support/reporting/pageObjects/MainPage';
import PersonalSettingsPage from '../../../../support/reporting/pageObjects/PersonalSettingsPage';
import SystemSettingsPage from '../../../../support/reporting/pageObjects/SystemSettingsPage';
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';
import { dashboardDelete } from '../../../../support/reporting/restUtils/dashboard';
import { deleteAllQueries } from '../../../../support/reporting/restUtils/dataCollector';

describe('Param query default value tests', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/tenant/systemsettings`).as('loadSystemSettings');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/channel/state` }).as('channelState');
    cy.intercept({ method: 'PUT', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user` }).as('updateUserData');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/tenant/systemsettings` }).as('updateSystemSettings');
  });

  it('Import Dashboards', () => {
    uploadFileRequest('reporting/TimeZoneTextWidget.bvd', `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`);
  });

  it('Should set the system settings to Asia/Calcutta and check the time', () => {
    cy.bvdLogin();
    cy.visit('/#/show/TimeZoneTextWidget?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    MainPage.checkText('shape1', '10/22/2021, 8:30:00 AM');
    MainPage.navigateToSystemSettings();
    cy.wait('@loadSystemSettings');
    SystemSettingsPage.checkDefaultSystemSettings();
    SystemSettingsPage.changeRegion('Asia');
    SystemSettingsPage.changeCity('Calcutta');
    SystemSettingsPage.clickSaveSystemSettings();
    cy.wait('@updateSystemSettings');
    cy.reload();
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    MainPage.checkText('shape1', '10/22/2021, 2:00:00 PM');
  });

  it('Should change the user timezone settings to Europe/Berlin and should have no difference from the actual time', () => {
    cy.bvdLogin();
    cy.visit('/#/show/TimeZoneTextWidget?params=none');
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    MainPage.checkText('shape1', '10/22/2021, 2:00:00 PM');
    MainPage.navigateToPersonalSettings();
    cy.wait('@pageloadUser');
    PersonalSettingsPage.checkSystemDefaultTimezone('Asia/Calcutta');
    PersonalSettingsPage.selectMyTimezone();
    PersonalSettingsPage.changeMyTimezone('Europe/Berlin');
    PersonalSettingsPage.clickSavePersonalSettings();
    cy.wait('@updateUserData');
    cy.reload();
    cy.wait(['@pageloadSystem', '@pageloadUser', '@channelState']);
    MainPage.checkText('shape1', '10/22/2021, 10:30:00 AM');
  });

  after(() => {
    cy.bvdLogout();
    deleteAllQueries();
    dashboardDelete('TimeZoneTextWidget');
  });
});
