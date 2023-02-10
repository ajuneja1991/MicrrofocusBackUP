// <reference types="Cypress" />
import 'cypress-iframe';
const dayjs = require('dayjs');
const shared = require('../../shared/shared');

const checkIfInputsAreDisable = (selector = '') => {
  cy.get(`[data-cy="${selector}"]`);
  cy.get('[data-cy="submit-button"]').should('be.disabled');
};

const openSchedulePanel = () => {
  cy.get('[data-cy="action-button"]').click();
  cy.get('[data-cy="action-button-new_schedule"]').click();
  cy.wait(['@getWidget', '@getUser']);
  cy.get('[data-cy="schedule-label-input"]').should('have.focus');
  cy.get('[data-cy="schedule-label-input"]').invoke('val').then(text => {
    expect(text).to.be.equal('Welcome');
  });
};

describe('PDF Schedule Panel', () => {
  beforeEach(() => {
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('foundationPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/dashboard/*`).as('dashboardLoad');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/BVDREPPAGE*`
    }).as('getPage');
    cy.intercept({
      method: 'PUT',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('updateUser');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/*`
    }).as('getWidget');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('getUser');
    cy.intercept({
      method: 'POST',
      path: `${shared.webtopdfContextRoot}/${Cypress.env('API_VERSION')}/jobs`
    }).as('createJob');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/authtoken`
    }).as('getXAuthToken');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/ui/dashboard/?*`).as('svgDashboardLoad');
    cy.bvdLogin();
    cy.visit('/BVDREPPAGE?_m=Welcome_0_L2_SA_StakeHolderDashboards&menuTitle=Welcome');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getUser', '@getTOC', '@getPage']);
    cy.frameLoaded('[data-cy="mondrian-iframe-bvdReporting"]');
    cy.wait(['@reportingPageloadSystem', '@pageloadUser', '@pageloadUser', '@pageloadUser', '@svgDashboardLoad', '@dashboardLoad']);
  });

  it('should check for if the submit button is disabled and schedule label, filename and subject are pre populated with report title when opening the schedule UI for very first time', () => {
    openSchedulePanel();
    cy.get('pdf-settings-box');
    cy.get('schedule-ui');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('[data-cy="schedule-label-input"]').invoke('val').then(text => {
      expect(text).to.be.equal('Welcome');
    });
    cy.get('[data-cy="file-name-input"]').invoke('val').then(text => {
      expect(text).to.be.equal('Welcome');
    });
    cy.get('[data-cy="email-subject-input"]').invoke('val').then(text => {
      expect(text).to.be.equal('Welcome');
    });
  });

  it('if file name and subject are not dirty then they should be in sync with schedule label', () => {
    openSchedulePanel();
    cy.get('pdf-settings-box');
    cy.get('schedule-ui');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('[data-cy="schedule-label-input"]').type('{selectall}{backspace}checkValue');
    cy.get('[data-cy="file-name-input"]').invoke('val').then(text => {
      expect(text).to.be.equal('checkValue');
    });
    cy.get('[data-cy="email-subject-input"]').invoke('val').then(text => {
      expect(text).to.be.equal('checkValue');
    });
    cy.get('[data-cy="email-subject-input"]').type('{selectall}{backspace}abcd');
    cy.get('[data-cy="schedule-label-input"]').type('{selectall}{backspace}checkValueAgain');
    cy.get('[data-cy="file-name-input"]').invoke('val').then(text => {
      expect(text).to.be.equal('checkValueAgain');
    });
    cy.get('[data-cy="email-subject-input"]').invoke('val').then(text => {
      expect(text).to.be.equal('abcd');
    });
  });

  it('Checking for error messages when removing focus and entering wrong inputs for the schedule label input', () => {
    openSchedulePanel();
    cy.get('[data-cy="empty-schedule-label-error"]').should('not.exist');
    cy.get('[data-cy="schedule-label-input"]').type('{selectall}{backspace}');
    checkIfInputsAreDisable('empty-schedule-label-error');
    cy.get('[data-cy="schedule-label-input"]').type('{selectall}{backspace}<abcd>');
    checkIfInputsAreDisable('invalid-schedule-label-error');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
  });

  it('Checking crontab expression against wrong inputs', () => {
    openSchedulePanel();
    cy.get('[data-cy="next-run"]').should('not.exist');
    cy.get('[data-cy="cron-expression-input"]').type('abcd');
    checkIfInputsAreDisable('invalid-cron-error');
    cy.get('[data-cy="next-run"]').should('not.exist');
    cy.get('[data-cy="cron-expression-input"]').type('{selectall}{backspace}');
    cy.get('[data-cy="cron-expression-input"]').type('5 4 * * ');
    checkIfInputsAreDisable('invalid-cron-error');
    cy.get('[data-cy="next-run"]').should('not.exist');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
  });

  it('Check the next run is displayed correctly when entering a valid cron expression', () => {
    openSchedulePanel();
    cy.get('[data-cy="cron-expression-input"]').type('5 4 * * *');
    cy.get('[data-cy="next-run"]');
  });

  it('Check hide and show advanced options in pdf settings', () => {
    openSchedulePanel();
    cy.get('[data-cy="pdf-format-radio-button"]').click();
    cy.get('[data-cy="show-advanced-options"]').click();
    cy.get('[data-cy="select-specific-pages"]');
    cy.get('[data-cy="pdf-header"]');
    cy.get('[data-cy="pdf-background"]');
    cy.get('[data-cy="hide-advanced-options"]').click();
    cy.get('[data-cy="select-specific-pages"]').should('not.exist');
    cy.get('[data-cy="pdf-header"]').should('not.exist');
    cy.get('[data-cy="pdf-background"]').should('not.exist');
  });

  it('Checking for error messages when removing focus and entering wrong inputs for the file name', () => {
    openSchedulePanel();
    cy.get('[data-cy="file-name-input"]').type('{selectall}{backspace}');
    cy.get('[data-cy="file-name-label-container"]').click();
    checkIfInputsAreDisable('empty-file-name-error');
    cy.get('[data-cy="file-name-input"]').type('<>');
    cy.get('[data-cy="append-time-to-report-name"] input').should('be.disabled');
    checkIfInputsAreDisable('invalid-file-name-error');
    cy.get('[data-cy="file-name-input"]').type('{selectall}{backspace}');
    cy.get('[data-cy="file-name-input"]').type('test.pdf');
    cy.get('[data-cy="append-time-to-report-name"] input').should('be.disabled');
    checkIfInputsAreDisable('invalid-file-name-error');
  });

  it('Check the functionality of attaching time to file name and check if the file name is up to date on changing the file name input', () => {
    openSchedulePanel();
    cy.get('[data-cy="file-name-input"]').type('{selectall}{backspace}WelcomeDashboard');
    cy.get('[data-cy="file-name"]').should('contain', 'WelcomeDashboard.pdf');
    cy.get('[data-cy="invalid-file-name-error"]').should('not.exist');
    cy.get('[data-cy="append-time-to-report-name"]').click();
    const fileNameWithTime = dayjs().format('YYYY-MM-DD_HH-mm');
    cy.get('[data-cy="file-name"]').should('contain', `WelcomeDashboard - ${fileNameWithTime}.pdf`);
  });

  it('Check the inputs for email configurations', () => {
    openSchedulePanel();
    cy.get('[data-cy="email-to-input"]').click('');
    cy.get('[data-cy="email-cc-input"]').type('test');
    cy.get('[data-cy="empty-email-to-error"]');
    cy.get('[data-cy="email-to-input"]').type('{selectall}{backspace}test@ffff');
    cy.get('[data-cy="invalid-email-to-error"]');
    cy.get('[data-cy="email-to-input"]').type('{selectall}{backspace}test123@test.com');
    cy.get('[data-cy="invalid-email-to-error"]').should('not.exist');
    cy.get('[data-cy="email-to-input"]').type('{selectall}{backspace}test123@test.com, ');
    cy.get('[data-cy="email-to-input"]').type('test123@test.com,');
    cy.get('[data-cy="invalid-email-to-error"]').should('not.exist');
    cy.get('[data-cy="email-to-input"]').type('{selectall}{backspace}test123@test.com,test12@test2.com, abcd@');
    cy.get('[data-cy="invalid-email-to-error"]');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('[data-cy="invalid-email-cc-error"]');
    cy.get('[data-cy="email-subject-input"]').type('{selectall}{backspace}');
    cy.get('[data-cy="empty-subject-error"]');
    cy.get('[data-cy="email-subject-input"]').type('{selectall}{backspace}<>');
    cy.get('[data-cy="invalid-subject-error"]');
    cy.get('[data-cy="email-subject-input"]').type('{selectall}{backspace}Report Generation');
    cy.get('[data-cy="invalid-subject-error"]').should('not.exist');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
  });

  it('Check for "successfully scheduled the job" after giving all the correct inputs', () => {
    openSchedulePanel();
    cy.get('[data-cy="cron-expression-input"]').type('5 4 * * *');
    cy.get('[data-cy="email-to-input"]').type('{selectall}{backspace}test1@test.com');
    cy.get('[data-cy="email-cc-input"]').type('{selectall}{backspace}test@test.com');
    cy.get('[data-cy="email-bcc-input"]').type('{selectall}{backspace}test@test.com');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@updateUser', '@getXAuthToken', '@createJob']);
    cy.bvdCheckToast('Successfully scheduled the job');
  });
});
