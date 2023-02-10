// <reference types="Cypress" />
const shared = require('../../shared/shared');
const nonAdminUserName = 'test';
const nonAdminUserPwd = 'control@123D';

let data = {
  name: 'nonDefaultTestRole',
  description: 'For foundation tester'
};

describe('Non Default Actions', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgetsKeyValueWidget*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    shared.deleteRole(data);
  });

  it('No Actions on Page listed when logged in with a user without any permissions', () => {
    const roleWithNoPermissions = { ...data, permission: []};
    cy.visit('/uiTestActions');
    cy.wait(['@getWebapiData', '@getTOC']);
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('.ux-menu').find('button').should('have.length', 5);
    cy.get('[data-cy="action-button-drillDown"]').should('not.have.class', 'dropdown-item-hide');
    cy.get('[data-cy="action-button-removeWidget"]').should('not.have.class', 'dropdown-item-hide');
    cy.get('[data-cy="action-button-duplicateWidget"]').should('not.have.class', 'dropdown-item-hide');
    shared.testForRole(roleWithNoPermissions, () => {
      cy.visit('/uiTestActions');
      cy.wait(['@getWebapiData', '@getTOC']);
      cy.url().should('include', 'uiTestActions');
      cy.get('[data-cy="action-button"]').should('not.exist');
    });
  });

  it('Non default actions are available if all permissions for actions are specified', () => {
    const roleWithAllPermissions = { ...data,
      permission: [{
        // eslint-disable-next-line camelcase
        operation_key: 'exec',
        // eslint-disable-next-line camelcase
        resource_key: 'action<>All'
      },
      {
        // eslint-disable-next-line camelcase
        operation_key: 'View',
        // eslint-disable-next-line camelcase
        resource_key: 'default_action<>All'
      }]};
    cy.request('GET', `'/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp'`).then(result => {
      console.log(result);
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'POST',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: roleWithAllPermissions,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          expect(response.body.role.name).to.equal('nonDefaultTestRole');
          expect(response.body.role.description).to.equal('For foundation tester');
          cy.bvdLogout();
          cy.bvdLogin(nonAdminUserName, nonAdminUserPwd);
          cy.visit('/uiTestActions');
          cy.wait(['@getWebapiData', '@getTOC']);
          cy.get('[data-cy="action-button"]').first().click();
          cy.get('.ux-menu').find('button').should('have.length', 5);
          cy.get('[data-cy="action-button-drillDown"]').should('not.have.class', 'dropdown-item-hide');
          cy.get('[data-cy="action-button-removeWidget"]').should('not.have.class', 'dropdown-item-hide');
          cy.get('[data-cy="action-button-duplicateWidget"]').should('not.have.class', 'dropdown-item-hide');
        });
      });
    });
  });

  it('Specific Non Default actions verify', () => {
    const roleWithSpecificPermissions = { ...data,
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'exec', resource_key: 'action<>drillDown' },
        // eslint-disable-next-line camelcase
        { operation_key: 'exec', resource_key: 'action<>removeWidget' },
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'default_action<>All' }
      ]};// eslint-disable-line camelcase
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
      console.log(result);
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'POST',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: roleWithSpecificPermissions,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          expect(response.body.role.name).to.equal('nonDefaultTestRole');
          expect(response.body.role.description).to.equal('For foundation tester');

          cy.bvdLogout();
          cy.bvdLogin(nonAdminUserName, nonAdminUserPwd);
          cy.visit('/uiTestActions');
          cy.wait(['@getWebapiData', '@getTOC']);
          cy.get('[data-cy="action-button"]').first().click();
          cy.get('.ux-menu').find('button').should('have.length', 5);
          cy.get('[data-cy="action-button-drillDown"]').should('not.have.class', 'dropdown-item-hide');
          cy.get('[data-cy="action-button-removeWidget"]').should('not.have.class', 'dropdown-item-hide');
          cy.get('[data-cy="action-button-duplicateWidget"]').should('have.class', 'dropdown-item-hide');
        });
      });
    });
  });

  it('Specific custom action of key value widget verify', () => {
    const roleWithSpecificPermissions = { ...data,
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'exec', resource_key: 'action<>undo' },
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'default_action<>All' },
        // eslint-disable-next-line camelcase
        { operation_key: 'exec', resource_key: 'action<>delete' },
        // eslint-disable-next-line camelcase
        { operation_key: 'exec', resource_key: 'action<>removeWidget' }
      ]};
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
      console.log(result);
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'POST',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: roleWithSpecificPermissions,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          expect(response.body.role.name).to.equal('nonDefaultTestRole');
          expect(response.body.role.description).to.equal('For foundation tester');

          cy.bvdLogout();
          cy.bvdLogin(nonAdminUserName, nonAdminUserPwd);
          cy.visit('uiTestWidgetsKeyValueWidget');
          cy.wait(['@getWebapiData', '@getPage', '@getTOC', '@getTOC']);
          cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
          cy.get('[data-cy="key-value-action"] [data-cy="action-dropdown-button-wrapper"]').click();
          cy.on('window:alert', str => {
            expect(str).to.equal('For action delete\nBy executing a key-value action, these items will get passed to the action:- \n  key : This is a veeeeeeeeery very long key  value: 249 \n   Context : No context selected');
          });
          cy.get('[data-cy="action-button-delete"]').click();
        });
      });
    });
  });

  it('Verify no non-default actions for invalid permission set, update role with all permission and verify', () => {
    const roleWithInvalidPermissions = { ...data,
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'exec', resource_key: 'action<>invalidAction' },
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'default_action<>All' }
      ]};
    shared.testForRole(roleWithInvalidPermissions, roleId => {
      cy.visit('/uiTestActions');
      cy.wait(['@getWebapiData', '@getTOC']);
      cy.url().should('include', 'uiTestActions');
      cy.get('[data-cy="action-button"]').should('not.exist');
      cy.bvdLogout();
      cy.bvdLogin();
      cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
        console.log(result);
        cy.getCookie('secureModifyToken').then(val => {
          data = { ...data,
            permission: [
              // eslint-disable-next-line camelcase
              { operation_key: 'exec', resource_key: 'action<>All' },
              // eslint-disable-next-line camelcase
              { operation_key: 'View', resource_key: 'default_action<>All' }
            ]};
          cy.request({
            method: 'PUT',
            url: `/rest/${Cypress.env('API_VERSION')}/role/${roleId}`,
            body: data,
            headers: {
              'X-Secure-Modify-Token': val.value
            }
          }).then(putresponse => {
            expect(putresponse.body.role.name).to.equal('nonDefaultTestRole');
            expect(putresponse.body.role.description).to.equal('For foundation tester');
            cy.bvdLogout();
            cy.bvdLogin(nonAdminUserName, nonAdminUserPwd);
            cy.visit('/uiTestActions');
            cy.wait(['@getWebapiData', '@getTOC']);
            cy.get('[data-cy="action-button"]').first().click();
            cy.get('.ux-menu').find('button').should('have.length', 5);
            cy.get('[data-cy="action-button-drillDown"]').should('not.have.class', 'dropdown-item-hide');
            cy.get('[data-cy="action-button-removeWidget"]').should('not.have.class', 'dropdown-item-hide');
            cy.get('[data-cy="action-button-duplicateWidget"]').should('not.have.class', 'dropdown-item-hide');
          });
        });
      });
    });
  });

  afterEach(() => {
    cy.bvdLogout();
    cy.bvdLogin();
    shared.deleteRole(data);
  });
});
