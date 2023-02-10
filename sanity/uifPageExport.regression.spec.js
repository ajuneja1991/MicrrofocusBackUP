/* eslint-disable cypress/no-force */
// eslint-disable-next-line spaced-comment
/// <reference types="Cypress" />
import 'cypress-iframe';
const shared = require('../../shared/shared');

describe('Export UIF Page', () => {
  beforeEach(() => {
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('foundationPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/ChartsPage*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
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
    cy.bvdLogin();
    cy.visit('/ChartsPage');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getTOC', '@getUser', '@getPage']);
    shared.waitForDataCalls({ name: '@getData', count: 13 });
  });

  it('Advanced PDF Export for page', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('#page-action-item-export').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('pdf-settings-box').should('be.visible');
    cy.get('[data-cy="pdf-exportMode"]').should('be.visible');
    cy.get('[data-cy="pdf-exportMode"]').find('label').invoke('attr', 'class').then(classes => {
      const isChecked = classes.includes('ux-checkbox-checked');
      if (isChecked) {
        cy.get('[data-cy="pdf-exportMode"]>label').click();
      }
    });
    cy.get('[data-cy=pdf-exportMode] > .ux-checkbox > .ux-checkbox-container').should('not.be.checked');
    cy.get('[data-cy="pdf-exportMode"]').find('label').invoke('attr', 'class').then(classes => {
      const isChecked = classes.includes('ux-checkbox');
      if (isChecked) {
        cy.get('[data-cy="pdf-exportMode"]>label').click();
      }
    });
    cy.get('[data-cy=pdf-exportMode] >label > .ux-checkbox-container>input').should('be.checked');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@getXAuthToken', '@updateUser', '@createJob']);
    cy.bvdCheckToast('PDF generation started. You will be notified.');
  });

  it('PDF export for All Charts ', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('#page-action-item-export').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('pdf-settings-box').should('be.visible');
    cy.get('[data-cy="pdf-exportMode"]').should('be.visible');
    cy.get('[data-cy="pdf-exportMode"]').find('label').invoke('attr', 'class').then(classes => {
      const isChecked = classes.includes('ux-checkbox-checked');
      if (isChecked) {
        cy.get('[data-cy="pdf-exportMode"]>label').click();
      }
    });
    cy.get('[data-cy=pdf-exportMode] > .ux-checkbox > .ux-checkbox-container').should('not.be.checked');
    cy.get('[data-cy="pdf-exportMode"]').find('label').invoke('attr', 'class').then(classes => {
      const isChecked = classes.includes('ux-checkbox');
      if (isChecked) {
        cy.get('[data-cy="pdf-exportMode"]>label').click();
      }
    });
    cy.get('[data-cy=pdf-exportMode] >label > .ux-checkbox-container>input').should('be.checked');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@getXAuthToken', '@updateUser', '@createJob']);
    cy.bvdCheckToast('PDF generation started. You will be notified.');
  });

  it('Schedule PDF export for All Charts ', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('#page-action-item-schedule').click();
    cy.wait(['@getWidget', '@getUser']);
    cy.get('[data-cy="pdf-exportMode"]').should('be.visible');
    cy.get('[data-cy="pdf-exportMode"]').find('label').invoke('attr', 'class').then(classes => {
      const isChecked = classes.includes('ux-checkbox-checked');
      if (isChecked) {
        cy.get('[data-cy="pdf-exportMode"]>label').click();
      }
    });
    cy.get('[data-cy=pdf-exportMode] > .ux-checkbox > .ux-checkbox-container').should('not.be.checked');
    cy.get('[data-cy="pdf-exportMode"]').find('label').invoke('attr', 'class').then(classes => {
      const isChecked = classes.includes('ux-checkbox');
      if (isChecked) {
        cy.get('[data-cy="pdf-exportMode"]>label').click();
      }
    });
    cy.get('[data-cy=pdf-exportMode] >label > .ux-checkbox-container>input').should('be.checked');
    cy.get('schedule-ui');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('[data-cy="schedule-label-input"]').invoke('val').then(text => {
      expect(text).to.be.equal('Charts Page');
    });
    cy.get('[data-cy="file-name-input"]').invoke('val').then(text => {
      expect(text).to.be.equal('Charts Page');
    });
    cy.get('[data-cy="email-subject-input"]').invoke('val').then(text => {
      expect(text).to.be.equal('Charts Page');
    });
    cy.get('[data-cy="cron-expression-input"]').type('5 4 * * *');
    cy.get('[data-cy="email-to-input"]').type('test123@test.com');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@updateUser', '@getXAuthToken', '@createJob']);
    cy.bvdCheckToast('Successfully scheduled the job');
  });
});
