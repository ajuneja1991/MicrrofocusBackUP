const shared = require('../../../shared/shared');
const appConfigNOM = {
  app: {
    id: 'NOM',
    title: 'NOM'
  },
  context: [],
  about: {
    title: 'Network Operations Manager',
    description: 'NOM description',
    icon: 'M0 0 L0 32 L32 32 Z',
    details: '### Licenses\nLicense details',
    capabilities: ['PT', 'Network_Node_Manager', 'Reporting'],
    release: '2021.08',
    copyright: {
      fromYear: '2006',
      toYear: '2022'
    }
  }
};

const appConfigPT = {
  app: {
    id: 'PT',
    title: 'Performance Troubleshoot'
  },
  context: [],
  about: {
    title: 'Performance troubleshooting',
    description: 'Next generation performance troubleshooting',
    icon: 'M0 0 L0 32 L32 32 Z',
    copyright: {
      fromYear: '2005',
      toYear: '2021'
    }
  }
};

describe('Single suite About dialog', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/system`
    }).as('getSystemData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('getUserData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
  });

  it('Check the dialog content in case of single suite and no children', () => {
    if (Cypress.env('TestEnvironment') === 'development') {
      shared.createAppConfig(appConfigNOM);
    }
    cy.visit('/');
    cy.wait(['@getSystemData', '@getUserData', '@getTOC']);
    cy.get('[data-cy="help-button"]').click();
    cy.get('[data-cy="aboutDialog"]').click();
    cy.get('[data-cy="aboutDialogModal"]');
    cy.get('[data-cy="suitePanel"]');
    if (Cypress.env('TestEnvironment') === 'development') {
      cy.get('[data-cy="suiteName"]').contains('Network Operations Manager');
      cy.get('[data-cy="suiteRelease"]').contains('2021.08');
    } else {
      cy.get('[data-cy="suiteName"]').contains('OPERATIONS BRIDGE (OPSBRIDGE)');
      cy.get('[data-cy="suiteRelease"]').contains('2022.05');
    }
    cy.get('[data-cy="suiteAboutLogo"]').invoke('attr', 'src').then(suiteAboutIcon => {
      cy.get('[data-cy="suiteLogo"]').invoke('attr', 'src').should('eq', suiteAboutIcon);
    });
    cy.get('[data-cy="detailsPageHeading"]').should('not.exist');
    cy.get('[data-cy="capabilities"]').should('not.exist');
    if (Cypress.env('TestEnvironment') === 'development') {
      cy.get('[data-cy="appDescription"]').contains('NOM description');
      cy.get('[data-cy="appDetails"]').find('p > h3').contains('Licenses');
      cy.get('[data-cy="copyright"]').contains('© 2006 -2022 Micro Focus or one of its affiliates');
    } else {
      cy.get('[data-cy="appDescription"]').contains('OPERATIONS BRIDGE (OPSBRIDGE)');
      cy.get('[data-cy="appDetails"]').find('p > h2').contains('Containerized Operations Bridge Manager');
      cy.get('[data-cy="copyright"]').contains('© 2021 -2022 Micro Focus or one of its affiliates');
    }
    cy.get('body').click(0, 0);
  });

  it('Check the dialog content in case of single suite and a capability of the suite', () => {
    if (Cypress.env('TestEnvironment') === 'development') {
      shared.createAppConfig(appConfigPT);
      cy.visit('/');
      cy.wait(['@getSystemData', '@getUserData', '@getTOC']);
      cy.get('[data-cy="help-button"]').click();
      cy.get('[data-cy="aboutDialog"]').click();
      cy.get('[data-cy="aboutDialogModal"]');
      /* Check suite content */
      cy.get('[data-cy="suitePanel"]');
      cy.get('[data-cy="suiteName"]').contains('Network Operations Manager');
      cy.get('[data-cy="suiteRelease"]').contains('2021.08');
      cy.get('[data-cy="detailsPageHeading"]').should('not.exist');
      cy.get('[data-cy="appDescription"]').contains('NOM description');
      cy.get('[data-cy="appDetails"]').find('p > h3').contains('Licenses');
      cy.get('[data-cy="copyright"]').contains('© 2006 -2022 Micro Focus or one of its affiliates');

      /* Check the capability content when user drillsdown into it*/
      cy.get('[data-cy="capabilities"] .capability-name').contains('Performance troubleshooting').click();
      cy.get('[data-cy="appDescription"]').contains('Next generation performance troubleshooting');
      cy.get('[data-cy="suiteName"]').contains('Network Operations Manager');
      cy.get('[data-cy="detailsPageHeading"] [data-cy="parentTitle"]').contains('Network Operations Manager');
      cy.get('[data-cy="detailsPageHeading"] [data-cy="capabilityTitle"]').contains('Performance troubleshooting');
      cy.get('[data-cy="release"]').should('not.exist');
      cy.get('[data-cy="copyright"]').contains('© 2005 -2021 Micro Focus or one of its affiliates');

      /* Check suite content when user goes back */
      cy.get('[data-cy="detailsPageHeading"]').click();
      cy.get('[data-cy="appDescription"]').contains('NOM description');
      cy.get('[data-cy="appDetails"]').find('p > h3').contains('Licenses');
      cy.get('[data-cy="copyright"]').contains('© 2006 -2022 Micro Focus or one of its affiliates');
    }
  });

  it('Closing the dialog when user is in the capability dialog and reopening it displays the suite info again', () => {
    if (Cypress.env('TestEnvironment') === 'development') {
      cy.visit('/');
      cy.wait(['@getSystemData', '@getUserData', '@getTOC']);
      cy.get('[data-cy="help-button"]').click();
      cy.get('[data-cy="aboutDialog"]').click();
      cy.get('[data-cy="aboutDialogModal"]');
      cy.get('[data-cy="capabilities"] .capability-name').contains('Performance troubleshooting').click();
      cy.get('[data-cy="closeButton"]').click();
      cy.get('[data-cy="help-button"]').click();
      cy.get('[data-cy="aboutDialog"]').click();
      cy.get('[data-cy="aboutDialogModal"]');
      cy.get('[data-cy="appDescription"]').contains('NOM description');
      cy.get('[data-cy="appDetails"]').find('p > h3').contains('Licenses');
      cy.get('[data-cy="copyright"]').contains('© 2006 -2022 Micro Focus or one of its affiliates');
    }
  });

  it('Order of posting app configs doesn\'t display the capabilities and the details section incorrectly', () => {
    shared.deleteAppConfig(appConfigNOM.app.id);
    shared.deleteAppConfig(appConfigPT.app.id);
    shared.createAppConfig(appConfigPT);
    shared.createAppConfig(appConfigNOM);
    cy.visit('/');
    cy.wait(['@getSystemData', '@getUserData', '@getTOC']);
    cy.get('[data-cy="help-button"]').click();
    cy.get('[data-cy="aboutDialog"]').click();
    cy.get('[data-cy="aboutDialogModal"]');
    cy.get('[data-cy="suitePanel"]');
    if (Cypress.env('TestEnvironment') === 'development') {
      cy.get('[data-cy="suiteName"]').contains('Network Operations Manager');
      cy.get('[data-cy="capabilities"] .capability-name').contains('Performance troubleshooting');
      cy.get('[data-cy="appDescription"]').contains('NOM description');
    } else {
      cy.get('[data-cy="suiteName"]').contains('OPTIC One');
      cy.get('[data-cy="appListTitle"]').eq(0).contains('Network Operations Manager');
      cy.get('[data-cy="appListTitle"]').eq(1).contains('OPERATIONS BRIDGE (OPSBRIDGE)');
    }
    shared.deleteAppConfig(appConfigNOM.app.id);
    shared.deleteAppConfig(appConfigPT.app.id);
    shared.createAppConfig(appConfigNOM);
    shared.createAppConfig(appConfigPT);
    cy.visit('/');
    cy.wait(['@getSystemData', '@getUserData', '@getTOC']);
    cy.get('[data-cy="help-button"]').click();
    cy.get('[data-cy="aboutDialog"]').click();
    cy.get('[data-cy="aboutDialogModal"]');
    cy.get('[data-cy="suitePanel"]');
    if (Cypress.env('TestEnvironment') === 'development') {
      cy.get('[data-cy="suiteName"]').contains('Network Operations Manager');
      cy.get('[data-cy="capabilities"] .capability-name').contains('Performance troubleshooting');
      cy.get('[data-cy="appDescription"]').contains('NOM description');
    } else {
      cy.get('[data-cy="suiteName"]').contains('OPTIC One');
      cy.get('[data-cy="appListTitle"]').eq(0).contains('Network Operations Manager');
      cy.get('[data-cy="appListTitle"]').eq(1).contains('OPERATIONS BRIDGE (OPSBRIDGE)');
    }
  });

  after(() => {
    shared.deleteAppConfig(appConfigNOM.app.id);
    shared.deleteAppConfig(appConfigPT.app.id);
  });
});
