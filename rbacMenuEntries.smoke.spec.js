// <reference types="Cypress" />
const shared = require('../../shared/shared');
const nonAdminuserName = 'test';
const nonAdminuserPwd = 'control@123D';

const data = {
  name: 'testRole',
  description: 'For foundation tester'
};

const pageIDs = [];
function addToPageIDs() {
  cy.url().then(url => {
    const urlObject = new URL(url);
    pageIDs.push(urlObject.pathname.split('/')[2]);
  });
}

// could be needed for fix later!
// eslint-disable-next-line no-unused-vars
function clickOutside() {
  cy.get('.modal-backdrop');
  // Workaround added: There is an issue currently that when side panel opens, the dropdown gets opened automatically, to avoid this, we are clicking somewhere outside after the side panel opens
  cy.get('body').click(0, 0);
}

describe('Menu Entries', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages`
    }).as('savePage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTocData');
    cy.intercept({
      method: 'GET',
      url: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries/*`
    }).as('getMenuEntry');
    cy.bvdLogin();
  });

  it('All Menu Entries listed for view permission', () => {
    const roleWithMenuViewAllPermissions = { ...data,
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'menu<>All' },
        // eslint-disable-next-line camelcase
        { operation_key: 'FullControl', resource_key: 'default_action<>All' }
      ]};
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
      console.log(result);
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'POST',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: roleWithMenuViewAllPermissions,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          expect(response.body.role.name).to.equal('testRole');
          expect(response.body.role.description).to.equal('For foundation tester');

          cy.bvdLogout();
          cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
          cy.visit('/uiTestWidgets?_m=testWidgetsEntry');
          cy.wait(['@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getTocData', '@getTocData']);
          cy.get('[data-cy="navigation-category-T2"] button').click();
          cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]');
          cy.get('[data-cy="navigation-menuEntry-testTimeIntervalEntry"]');
          cy.get('[data-cy="navigation-menuEntry-drillDownTestEntry"]');
          // search for a menu entry
          cy.get('[data-cy="sideNavigation-search-input"]').click().type('Alternative');
          cy.get('[data-cy="navigation-category-T4"] button').first().should('have.attr', 'aria-expanded').and('eq', 'true');
          cy.get('[data-cy="navigation-menuEntry-testWidgetsAlternativeEntry"] .ux-side-menu-item-content span span').should('have.class', 'highlight');
          // Save as panel disables saving on the instances
          cy.get('[data-cy="page-action-button"]').click();
          cy.get('[data-cy="page-action-item-saveAs"]').click();
          cy.get('[data-cy="pgmt-radiobox-instanceDefinition"] > label.ux-radio-button')
            .should('have.class', 'ux-radio-button-disabled');
          cy.get('[data-cy="pgmt-radiobox-definition"] > label.ux-radio-button')
            .should('not.have.class', 'ux-radio-button-disabled');
        });
      });
    });
  });

  // eslint-disable-next-line mocha/no-skipped-tests
  it('All Menu Entries listed for Full Control permission', () => {
    const roleWithMenuFullControlAllPermissions = { ...data,
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'FullControl', resource_key: 'menu<>All' },
        // eslint-disable-next-line camelcase
        { operation_key: 'FullControl', resource_key: 'default_action<>All' }
      ]};
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
      console.log(result);
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'POST',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: roleWithMenuFullControlAllPermissions,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          expect(response.body.role.name).to.equal('testRole');
          expect(response.body.role.description).to.equal('For foundation tester');

          cy.bvdLogout();
          cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
          cy.visit('/uiTestWidgets?_m=testWidgetsEntry');
          cy.wait(['@getWebapiData', '@getWebapiData', '@getTocData', '@getTocData']);
          cy.get('[data-cy="navigation-category-T2"] button').click();
          cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]');
          cy.get('[data-cy="navigation-menuEntry-testTimeIntervalEntry"]');
          cy.get('[data-cy="navigation-menuEntry-drillDownTestEntry"]');
          cy.get('[data-cy="sideNavigation-search-input"]').click().type('Alternative');
          cy.get('[data-cy="navigation-category-T4"] button').first().should('have.attr', 'aria-expanded').and('eq', 'true');
          cy.get('[data-cy="navigation-menuEntry-testWidgetsAlternativeEntry"] .ux-side-menu-item-content span span').should('have.class', 'highlight');
          cy.get('[data-cy="sideNavigation-reset-search-button"]').click();
          cy.get('[data-cy="page-action-button"]').click();
          cy.get('[data-cy="page-action-item-saveAs"]').click();
          // Below validates save-as panel allows saving on the instances
          cy.get('[data-cy="pgmt-radiobox-instanceDefinition"]').should('not.be.checked');
          cy.get('[data-cy="pgmt-radiobox-instance"]').should('not.be.checked');
          cy.get('[data-cy="pgmt-radiobox-definition"]').should('not.be.checked');
          cy.get('[data-cy=pgmt-radiobox-instance] > .ux-radio-button > .ux-radio-button-container').click();
          cy.get('[data-cy="categoryDropdownButton"]').click();
          cy.get('[data-cy="dropDownContainer"]').find('tree-node').its('length').should('be.above', 2);
        });
      });
    });
  });

  it('No Menu Entries displayed in case of role with no permission set assigned for menu but has permission for non-default actions', () => {
    // eslint-disable-next-line camelcase
    const roleWithNoMenuEntryPermissions = { ...data,
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'exec', resource_key: 'action<>All' },
        // eslint-disable-next-line camelcase
        { operation_key: 'FullControl', resource_key: 'default_action<>All' }
      ]};
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
      console.log(result);
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'POST',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: roleWithNoMenuEntryPermissions,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          expect(response.body.role.name).to.equal('testRole');
          expect(response.body.role.description).to.equal('For foundation tester');
          cy.bvdLogout();
          cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
          cy.visit('/uiTestWidgets');
          cy.wait(['@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getTocData', '@getTocData']);
          cy.get('[data-cy="action-button"]').should('exist');
          cy.get('.ux-side-menu-toggle').click();
          cy.get('ux-side-menu .sideNavSearch').click();
          cy.get('[data-cy="navigation-menuEntry-T4"]').should('not.exist');
        });
      });
    });
  });

  it('Menu Entries displayed in case of role with View permissions set to specific categories', () => {
    const roleWithT5ViewMenuEntryPermissions = { ...data,
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'menu<>Category-T5' },
        // eslint-disable-next-line camelcase
        { operation_key: 'FullControl', resource_key: 'default_action<>All' }
      ]};
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
      console.log(result);
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'POST',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: roleWithT5ViewMenuEntryPermissions,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          expect(response.body.role.name).to.equal('testRole');
          expect(response.body.role.description).to.equal('For foundation tester');
          cy.bvdLogout();
          cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
          cy.visit('/uiTestWidgets');
          cy.wait(['@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getTocData', '@getTocData']);
          cy.get('[data-cy="navigation-category-T4"]').should('not.exist');
          cy.get('[data-cy="navigation-category-T2"]').click();
          cy.get('[data-cy="navigation-category-T5"]').click();
          cy.get('[data-cy="navigation-menuEntry-testLocalizationEntry"]').click();
        });
      });
    });
  });

  it('Menu Entries displayed in case of role with FullControl permissions set to specific category', () => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries`
    }).as('saveMenuEntries');
    const roleWithT5FullControlMenuEntryPermissions = { ...data,
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'FullControl', resource_key: 'menu<>Category-T5' },
        // eslint-disable-next-line camelcase
        { operation_key: 'FullControl', resource_key: 'default_action<>All' }
      ]};
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
      console.log(result);
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'POST',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: roleWithT5FullControlMenuEntryPermissions,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          expect(response.body.role.name).to.equal('testRole');
          expect(response.body.role.description).to.equal('For foundation tester');
          cy.bvdLogout();
          cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
          cy.visit('/uiTestWidgets');
          cy.wait(['@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getTocData', '@getTocData']);
          cy.get('[data-cy="page-action-button"]').click();
          cy.get('[data-cy="page-action-item-saveAs"]').click();
          // id will be replaced by data cy later
          cy.get('#pgmt-radio-button-instanceDefinition > .ux-radio-button > .ux-radio-button-container').click();
          cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').clear().type('testPage3');
          cy.get('[data-cy="categoryDropdownButton"]').find('.ux-select-icons').click();
          cy.get('[data-cy="dropDownContainer"]');
          cy.get('[data-cy="category-T2"]');
          cy.get('tree-node-expander').click();
          cy.get('[data-cy="category-T5"]').click();
          cy.get('[data-cy="submit-button"]').click();
          cy.bvdCheckToast('Definition "testPage3-definition" and instance "testPage3" saved successfully');
          cy.wait('@savePage');
          cy.wait('@saveMenuEntries').then(responseMenuEntry => {
            const menuEntryId = responseMenuEntry.response.body.data[0].id;
            cy.url().should('not.include', 'testPage3');
            cy.get('[data-cy=breadcrumb-title-testPage3]');
            cy.get('[data-cy="spinnerOverlay"]').invoke('attr', 'hidden');
            cy.url().should('include', '_s');
            cy.get('[data-cy="navigation-category-T2"] button').click();
            cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
            cy.get(`[data-cy="navigation-menuEntry-${menuEntryId}"] > .ux-side-menu-item`);
            cy.get('[data-cy="navigation-category-T4"]').should('not.exist');
            cy.get('[data-cy="navigation-category-T5"]');
          });
          addToPageIDs();
        });
      });
    });
  });

  it('SaveAs fails to save with predefined menu category with no permission', () => {
    const roleWithT5FullControlMenuEntryPermissions = { ...data,
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'FullControl', resource_key: 'menu<>Category-T5' },
        // eslint-disable-next-line camelcase
        { operation_key: 'FullControl', resource_key: 'default_action<>All' }
      ]};
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
      console.log(result);
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'POST',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: roleWithT5FullControlMenuEntryPermissions,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          expect(response.body.role.name).to.equal('testRole');
          expect(response.body.role.description).to.equal('For foundation tester');
          cy.bvdLogout();
          cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
          cy.visit('/pageWithValidCategory');
          cy.wait(['@getTocData', '@getTocData']);
          cy.get('[data-cy="page-action-button"]').click();
          cy.get('[data-cy="page-action-item-saveAs"]').click();
          cy.get('[data-cy="pgmt-radiobox-instance"] > .ux-radio-button > .ux-radio-button-container').click();
          cy.get('[data-cy="categoryDropdownButton"]').click();
          cy.get('[data-cy="dropDownContainer"]').find('tree-node').first().find('i').should('have.class', 'qtm-icon-lock');
        });
      });
    });
  });

  it('Parent categories with no fullControl permission should come with a lock icon', () => {
    const roleWithT5FullControlMenuEntryPermissions = { ...data,
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'FullControl', resource_key: 'menu<>Category-T5' },
        // eslint-disable-next-line camelcase
        { operation_key: 'FullControl', resource_key: 'default_action<>All' }
      ]};
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
      console.log(result);
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'POST',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: roleWithT5FullControlMenuEntryPermissions,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          expect(response.body.role.name).to.equal('testRole');
          expect(response.body.role.description).to.equal('For foundation tester');
          cy.bvdLogout();
          cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
          cy.visit('/uiTestWidgets');
          cy.wait(['@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getTocData', '@getTocData']);
          cy.get('[data-cy="page-action-button"]').click();
          cy.get('[data-cy="page-action-item-saveAs"]').click();
          // id will be replaced by data cy later
          cy.get('#pgmt-radio-button-instanceDefinition > .ux-radio-button > .ux-radio-button-container').click();
          cy.get('[data-cy="pgmt-properties-instanceDefinition-instance-title"]').clear().type('testPage3');
          cy.get('[data-cy="categoryDropdownButton"]').find('.ux-select-icons').click();
          cy.get('[data-cy="dropDownContainer"]');
          cy.get('[data-cy="category-T2"]').parent().find('i').should('have.class', 'qtm-icon-lock');
          cy.get('tree-node-expander').click();
          cy.get('[data-cy="category-T5"]').parent().find('i').should('not.have.class', 'qtm-icon-lock');
        });
      });
    });
  });

  afterEach(() => {
    cy.bvdLogout();
    cy.bvdLogin();
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
      console.log(result);
      cy.getCookie('secureModifyToken').then(val => {
        const getData = { ...data, permission: []};
        cy.request({
          method: 'GET',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: getData,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          const roles = response.body.role_list.role;
          const tester = roles.find(item => item.name === 'testRole');
          cy.request({
            method: 'DELETE',
            url: `/rest/${Cypress.env('API_VERSION')}/role/${tester.id}`,
            headers: {
              'X-Secure-Modify-Token': val.value
            }
          });
        });
      });
    });
    pageIDs.push(['testPage', 'testPage1', 'testPage2', 'testPage3']);
    shared.deletePages(pageIDs);
  });
});
