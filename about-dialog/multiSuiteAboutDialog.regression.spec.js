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
    capabilities: ['PT', 'Network_Node_Manager'],
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

const appConfigOpsB = {
  app: {
    id: 'OpsB',
    title: 'OpsB'
  },
  context: [],
  about: {
    title: 'Operations Bridge',
    description: 'OpsB description',
    icon: 'M0 0 L0 32 L32 32 Z',
    copyright: {
      fromYear: '2008',
      toYear: '2021'
    }
  }
};

describe('Multi suite About dialog', shared.defaultTestOptions, () => {
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
    shared.createAppConfig(appConfigNOM);
    shared.createAppConfig(appConfigPT);
    shared.createAppConfig(appConfigOpsB);
  });

  it('Check that list exists and can be drilled forwards and backwards', () => {
    cy.visit('/');
    cy.wait(['@getSystemData', '@getUserData', '@getTOC']);
    cy.get('[data-cy="help-button"]').click();
    cy.get('[data-cy="aboutDialog"]').click();
    cy.get('[data-cy="aboutDialogModal"]');
    /* Check for content in suite panel */
    cy.get('[data-cy="suitePanel"]');
    cy.get('[data-cy="suiteName"]').contains('OPTIC One');
    cy.get('[data-cy="suiteAboutLogo"]').invoke('attr', 'src').then(suiteAboutIcon => {
      cy.get('[data-cy="suiteLogo"]').invoke('attr', 'src').should('eq', suiteAboutIcon);
    });
    cy.get('[data-cy="suiteRelease"]').should('not.exist');
    cy.get('[data-cy="suiteLogo"]').invoke('attr', 'src');
    cy.get('[data-cy="detailsPage"]').should('not.exist');

    /* Check for list contents*/
    cy.get('[data-cy="aboutList"]');
    if (Cypress.env('TestEnvironment') === 'development') {
      cy.get('.app-list-info-wrapper').should('have.length', 2);
    } else {
      cy.get('.app-list-info-wrapper').should('have.length', 3);
    }
    cy.get('[data-cy="appListTitle"]').eq(0).contains('Network Operations Manager');
    cy.get('[data-cy="appListTitle"]').eq(1).contains('Operations Bridge');
    cy.get('[data-cy="appListDescription"]').eq(0).contains('NOM description');
    cy.get('[data-cy="appListDescription"]').eq(1).contains('OpsB description');

    /* Check for app details when drilled into the list item */
    cy.get('[data-cy="appList"]').eq(0).click();
    cy.get('[data-cy="appDescription"]').contains('NOM description');
    cy.get('[data-cy="detailsPageHeading"]');
    cy.get('[data-cy="copyright"]').contains('© 2006 -2022 Micro Focus or one of its affiliates');
    cy.get('[data-cy="capabilities"] .capability-name').contains('Performance troubleshooting').click();
    cy.get('[data-cy="appDescription"]').contains('Next generation performance troubleshooting');
    cy.get('[data-cy="detailsPageHeading"] [data-cy="parentTitle"]').contains('Network Operations Manager');
    cy.get('[data-cy="detailsPageHeading"] [data-cy="capabilityTitle"]').contains('Performance troubleshooting');
    cy.get('[data-cy="copyright"]').contains('© 2005 -2021 Micro Focus or one of its affiliates');

    /* Navigating back to the list*/
    cy.get('[data-cy="detailsPageHeading"]').click();
    cy.get('[data-cy="detailsPageHeading"]').click();
    cy.get('[data-cy="aboutList"]');

    /* Close the dialog when in the detail page and reopen */
    cy.get('[data-cy="appList"]').eq(1).click();
    cy.get('[data-cy="capabilityTitle"]').contains('Operations Bridge ');
    cy.get('[data-cy="copyright"]').contains('© 2008 -2021 Micro Focus or one of its affiliates');
    cy.get('body').click(0, 0);
    cy.get('[data-cy="help-button"]').click();
    cy.get('[data-cy="aboutDialog"]').click();
    cy.get('[data-cy="aboutDialogModal"]');
    cy.get('[data-cy="aboutList"]');
  });

  after(() => {
    shared.deleteAppConfig(appConfigNOM.app.id);
    shared.deleteAppConfig(appConfigPT.app.id);
    shared.deleteAppConfig(appConfigOpsB.app.id);
  });
});
