// <reference types="Cypress" />
import { clone } from 'ramda';
const shared = require('../../shared/shared');

const data = {
  name: 'testRole',
  description: 'Test role for foundation'
};

describe('Filter pages by tags', () => {
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
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/uiTestWidgets*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    // Assign view permission for the pages uiTestWidgets and uiTestLocalization
    cy.bvdLogin();
    const roleWithMenuPermissions = { ...data,
      permission: [
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'menu<>Category-T5' },
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'menu<>Category-T4' },
        // eslint-disable-next-line camelcase
        { operation_key: 'View', resource_key: 'default_action<>All' }
      ]};
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
      console.log(result);
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'POST',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: roleWithMenuPermissions,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(response => {
          expect(response.body.role.name).to.equal('testRole');
          expect(response.body.role.description).to.equal('Test role for foundation');
          cy.bvdLogout();
          // Login as non-admin user
          cy.bvdLogin('test', 'control@123D');
        });
      });
    });
  });

  it('should fail to load the page with exclude tag', () => {
    // 'uiTestExcludeTags' page has atleast one tag mentioned in exclude tags
    cy.visit('/uiTestExcludeTags?_m=testExcludeTagsEntry');
    cy.get('[data-cy="mondrianModalDialog"]');
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="navigation-menuEntry-testExcludeTagsEntry"]').should('not.exist');
  });

  it('system should load the page when tag mentioned in page is not matching exclude tag', () => {
    // Localization page is mapped with tags and those are not excluded in app config
    cy.visit('/uiTestLocalization?_m=testLocalizationEntry');
    cy.wait(['@getWebApiData', '@getTOC']);
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="navigation-menuEntry-testLocalizationEntry"]');
  });

  it('system should load the pages when no tags are present page config', () => {
    // uiTestWidgets page has no tags
    cy.visit('/uiTestWidgets?_m=testWidgetsEntry');
    cy.wait(['@getWebApiData', '@getTOC']);
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]');
  });

  it('system should not load the page when all tags mentioned in page are matching with exclude tag', () => {
    // 'matchingExcludeTagsWithPageTag' page has all the tags mentioned in exclude tags
    cy.visit('/matchingExcludeTagsWithPageTags');
    // Page must not be loaded and proper error message must be displayed
    cy.get('[data-cy="mondrianModalDialog"]');
    cy.get('[data-cy="mondrianModalDialogButton"]');
  });

  it('LicenseBasedPage must not be listed if license is not installed', () => {
    // Below is the LicenseBasedPage, mapped license is not installed and not mentioned in appConfig
    cy.visit('/license_notExistInAppConfigAndSystem');
    // Page must not be loaded and proper error message must be displayed
    cy.get('[data-cy="mondrianModalDialog"]');
    cy.get('[data-cy="mondrianModalDialogButton"]');
    // Below is the LicenseBasedPage, mapped license is not installed but mentioned in appConfig
    cy.visit('/license_existInAppConfig_notInstalled');
    // Page must not be loaded and proper error message must be displayed
    cy.get('[data-cy="mondrianModalDialog"]');
    cy.get('[data-cy="mondrianModalDialogButton"]');
  });

  it('LicenseBasedPage must not be listed if same license is not mapped in appConfig', () => {
    // Below is the LicenseBasedPage, mapped license is not mentioned in appConfig and not installed
    cy.visit('/license_notExistInAppConfigAndSystem');
    // Page must not be loaded and proper error message must be displayed
    cy.get('[data-cy="mondrianModalDialog"]');
    cy.get('[data-cy="mondrianModalDialogButton"]');
    // Below page has installed license but not mapped in app config
    cy.visit('/license_notExistInAppConfig_installedInSystem');
    // Page must not be loaded and proper error message must be displayed
    cy.get('[data-cy="mondrianModalDialog"]');
    cy.get('[data-cy="mondrianModalDialogButton"]');
  });

  it('LicenseBasedPage must be listed if license is installed and included in appConfig', () => {
    // Below LicenseBasedPage has matching license in appConfig and license installed
    cy.visit('/licenseBasedPage');
    // Page must be loaded without any error message
    cy.wait(['@getWebApiData', '@getTOC']);
    cy.get('[data-cy="mondrianModalDialog"]').should('not.exist');
  });

  it('LicenseBasedPage must be listed if atleast one of its license matching with appConfig and that license is installed', () => {
    // Below LicenseBasedPage has one matching license with appConfig and license installed
    cy.visit('/licenseBasedPage_withSingleMatchingLicense');
    // Page must be loaded without any error message
    cy.wait(['@getWebApiData', '@getTOC']);
    cy.get('[data-cy="mondrianModalDialog"]').should('not.exist');
  });

  it('system should load the pages when no license are mentioned in page', () => {
    // uiTestWidgets page is not mapped to any license
    cy.visit('/uiTestWidgets?_m=testWidgetsEntry');
    cy.wait(['@getWebApiData', '@getTOC']);
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-T2"] > .ux-side-menu-item').click();
    cy.get('.ux-side-menu-drawer').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-menuEntry-testWidgetsEntry"]');
  });

  afterEach(() => {
    cy.bvdLogout();
    cy.bvdLogin();
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(result => {
      console.log(result);
      cy.getCookie('secureModifyToken').then(val => {
        const getdata = { ...data, permission: []};
        cy.request({
          method: 'GET',
          url: `/rest/${Cypress.env('API_VERSION')}/role`,
          body: getdata,
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
  });
});

describe('Exclude tags', () => {
  let appConfig;
  const roleWithPageOperationsViewAllPermissions = { ...data,
    permission: [
      // eslint-disable-next-line camelcase
      { operation_key: 'FullControl', resource_key: 'default_action<>All' },
      // eslint-disable-next-line camelcase
      { operation_key: 'FullControl', resource_key: 'menu<>All' },
      // eslint-disable-next-line camelcase
      { operation_key: 'exec', resource_key: 'action<>All' }
    ]};
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/pageWithExcludeTag*`
    }).as('getPageWithExcludeTag');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as('getUiTestWidgets');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages`
    }).as('savePage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.bvdLogin();
    shared.getAppConfig(appConfigRes => {
      appConfig = appConfigRes.body.data.appConfig;
    });
  });

  it('After excluding the page via exclude tags, page name must be removed from the breadcrumbs', () => {
    const tags = [
      {
        name: '__system',
        values: [
          'breadcrumbs'
        ]
      }
    ];
    const localAppConfig = clone(appConfig);
    shared.createNewPage('pageWithExcludeTag', 'pageWithExcludeTag', tags, null, pageCreatedRes => {
      cy.visit('/pageWithExcludeTag');
      cy.wait(['@getPageWithExcludeTag']);
      expect(pageCreatedRes.status).to.equal(200);
      Array.isArray(localAppConfig.app.excludeTags) ?
        localAppConfig.app.excludeTags.push('breadcrumbs') :
        localAppConfig.app.excludeTags = ['breadcrumbs'];
      shared.updateAppConfig(localAppConfig, () => {
        shared.testForRole(roleWithPageOperationsViewAllPermissions, () => {
          cy.visit('/pageWithExcludeTag');
          cy.wait(['@getPageWithExcludeTag']);
          cy.get('[data-cy=mondrianModalDialogButton]').click();
          cy.get('[data-cy="breadcrumb-pageWithExcludeTag"]').should('not.exist');
        });
      });
    });
  });

  afterEach(() => {
    cy.bvdLogout();
    cy.bvdLogin();
    shared.deletePages(['pageWithExcludeTag']);
    shared.updateAppConfig(appConfig, () => {
      shared.deleteRole(data);
      cy.bvdLogout();
    });
  });
});
