// <reference types="Cypress" />
const shared = require('../../shared/shared');

describe('Plugins page', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestPlugins*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.bvdLogin();
    const start = shared.getDateTimeLocalized('28 Nov 2019 12:30:00 UTC');
    const end = shared.getDateTimeLocalized('28 Nov 2019 12:35:00 UTC');
    cy.log('Localized  timeframe: '.concat(start, '-', end));
    const url = '/uiTestPlugins?_s='.concat(start, '&_e=', end, '&_tft=A');
    cy.visit(url);
    cy.wait('@getPage');
    cy.wait(['@getData']);
  });

  it('Simple list should get data using custom datasource plugin', () => {
    cy.get('simple-list').contains('loadgen.mambo.net');
  });

  it('Echart should throw error as required custom datasource plugin is not present and should not be dismissable', () => {
    cy.get('echarts-chart').should('not.exist');
    cy.get('ux-alert').find('span').contains('Failed to load data source plugin noproxy');
  });

  it('Should show component loaded via plugin', () => {
    cy.get('mondrian-external-widget').contains('This external widget is loaded via plugin.');
  });

  it('Should translate external component strings loaded via plugin', () => {
    cy.get('mondrian-external-widget').contains('Translation works!');
  });

  it('verify context and breadcrumbs loaded based on the context selected', () => {
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('simple-list').find('[data-cy="oba.mambo.net"]').click();
    cy.wait('@getPagesMetadata');
    cy.get('[data-cy="contextLabelType-Host"]').contains('oba.mambo.net');
    cy.get('#split-button-toggle').click();
    cy.get('[data-cy="drilldown-uiTestPage"]').click();
    cy.wait(['@getPagesMetadata', '@getData']);
    cy.get('[data-cy="contextLabelType-Host"]').contains('oba.mambo.net');
    cy.get('[data-cy="contextLabelType-Host"]').contains('oba.mambo.net');
    cy.get('[data-cy="breadcrumb-uiTestPlugins"]').click();
    cy.wait(['@getPagesMetadata', '@getData']);
    cy.get('[data-cy="contextLabelType-Host"]').contains('oba.mambo.net');
  });

  it('verify time context filter for plugins', () => {
    cy.get('[data-cy=timeSelectorStartDate]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('[aria-label="Nov 26, 2019"]').click();
    cy.get('ux-date-time-picker.end-date-picker').find('[aria-label="Nov 27, 2019"]').click();
    cy.get('context-view').find('.context-filter-menu')
      .should('contain', '11/26/2019')
      .and('contain', '11/27/2019');
    cy.get('.context-filter-apply').contains('Apply').click();
    cy.wait('@getData');
    cy.get('[data-cy=timeSelectorStartDate]').should('contain', '11/26/2019');
    cy.get('[data-cy=timeSelectorEndDate]').should('contain', '11/27/2019');

    const start = shared.getDateTimeLocalized('26 Nov 2019 12:30:00 UTC');
    const end = shared.getDateTimeLocalized('27 Nov 2019 12:35:00 UTC');
    cy.location().should(loc => {
      expect(loc.search).contains('_s='.concat(start));
      expect(loc.search).contains('_e='.concat(end));
      expect(loc.search).contains('&_tft=A');
    });
  });

  it('Should throw an error in case of non existing custom component plugin', () => {
    cy.visit('/uiTestPluginsNonExisting');
    cy.get('[data-cy="mondrianModalDialog"]').contains('Failed to load bundle URL externalComponentPluginNonExisting');
    cy.get('[data-cy="mondrianModalDialog"]').contains('Please contact your administrator if you believe that this should not happen.');
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.url().should('include', 'uiTestPluginsNonExisting');
  });

  it('Should throw an error in case of non existing custom component moduleName', () => {
    cy.visit('/uiTestPluginsNonExistingModuleName');
    cy.get('[data-cy="mondrianModalDialog"]').contains('An internal software configuration error occurred. Please contact support.');
    cy.get('[data-cy="mondrianModalDialog"]').contains('External component could not be loaded. Module not found: ExternalComponentsPluginModuleNonExisting.');
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.url().should('include', 'uiTestPluginsNonExistingModuleName');
  });

  it('Should throw an error in case of non existing custom component selector', () => {
    cy.visit('/uiTestPluginsNonExistingCompSelector');
    cy.get('[data-cy="mondrianModalDialog"]').contains('An internal software configuration error occurred. Please contact support.');
    cy.get('[data-cy="mondrianModalDialog"]').contains('Component with name mondrian-test-plugin-nonexisting is not part of external module');
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.url().should('include', 'uiTestPluginsNonExistingCompSelector');
  });
});
