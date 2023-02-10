import 'cypress-iframe';
const getToken = require('../../../../support/reporting/restUtils/getXAuthToken');
const { getIDMroles, roleCreation, roleDeletion, deleteIDMRole } = require('../../../../support/reporting/restUtils/role');
const shared = require('../../shared/shared');

describe('Test IDM role sync', () => {
  let roleId;
  const roleName = 'IDMRole';
  const roleDesc = 'IDMRole';
  const categoryName = 'All';
  const accessType = 'full-control';
  it('check given role does not exist in IDM', shared.defaultIdmOptions, () => {
    getToken().then(xAuthToken => {
      getIDMroles(xAuthToken).then(res => {
        const filteredRole = res.body.roles.filter(role => role.name === roleName);
        expect(filteredRole.length).to.equal(0);
      });
    });
  });

  it('should create a role in BVD and IDM', () => {
    roleCreation(roleName, roleDesc, categoryName, accessType).then(newRoleId => {
      expect(newRoleId).to.not.be.undefined;
      roleId = newRoleId;
    });
  });

  it('check given role exist\'s in IDM', shared.defaultIdmOptions, () => {
    getToken().then(xAuthToken => {
      getIDMroles(xAuthToken).then(res => {
        const filteredRole = res.body.roles.filter(role => role.name === roleName);
        expect(filteredRole.length).to.equal(1);
        deleteIDMRole(filteredRole[0].id, xAuthToken).then(result => {
          cy.log(result);
          expect(result.status).to.eq(200, 200);
        });
      });
    });
  });

  it('delete BVD role', () => {
    roleDeletion(roleId);
  });
});

describe('Non admin role with predefined query edit permission', () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/role?format=json`).as('roleLoad');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/resource?format=json`).as('resourceLoad');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/l10n/*`).as('assetsLoad');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/opr-userMgmt/*`).as('userMgmtLoad');
  });

  it('Create and edit role with predefined query edit permission', () => {
    cy.bvdLogin();
    cy.visit('/opr-userMgmt/app/#/?hidemasthead=true');
    cy.wait(['@assetsLoad', '@roleLoad', '@resourceLoad']);

    cy.get('.oas-welcome-box');
    cy.get('#linkToCreateRolePage').should('be.visible').click();
    cy.get('#controls input').type('NonAdminWithDataCollectorPermission');
    cy.get('[data-cy="data-collector-checkbox"]').should('not.be.checked');
    cy.get('[data-cy="data-collector-checkbox"]').check();
    cy.get('#saveRoleButton').click();
    cy.get('[data-cy="data-collector-permission"]').contains('Enabled');
    cy.get('div[title="NonAdminWithDataCollectorPermission"]').should('be.visible').click();
    cy.get('#btnEditRole').click();
    cy.get('[data-cy="data-collector-checkbox"]').should('be.checked');
    cy.get('[data-cy="data-collector-checkbox"]').uncheck();
    cy.get('#saveRoleButton').click();
    cy.get('[data-cy="data-collector-permission"]').contains('Disabled');
    cy.get('div[title="NonAdminWithDataCollectorPermission"]').should('be.visible').click();
    cy.get('#btnEditRole').click();
    cy.get('[data-cy="data-collector-checkbox"]').should('not.be.checked');
    cy.get('#cancelEditorButton').click();
    // Cleanup (delete role)
    cy.get('div[title="NonAdminWithDataCollectorPermission"]').should('be.visible').click();
    cy.get('#btnDeleteRoles').click();
    cy.get('#btnDialogSubmit').click();
  });
});
