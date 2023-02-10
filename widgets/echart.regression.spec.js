// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('EChart', shared.defaultTestOptions, () => {
  function interceptIndefinite(urlObject) {
    let sendResponse;
    const trigger = new Promise(resolve => {
      sendResponse = resolve;
    });
    cy.intercept(urlObject, request => trigger.then(() => {
      request.reply();
    }));
    return sendResponse;
  }
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/testVisiblePage*`
    }).as('getTestVisiblePage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestWidgets');
    cy.wait(['@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getWebapiData', '@getTOC']);
  });

  it('widget exist', () => {
    cy.contains('Chart');
    cy.get('echarts-chart');
  });

  it('widget has entries', () => {
    cy.get('echarts-chart').find('svg');
    cy.get('echarts-chart').find('uis-spinner-overlay').find('.spinner-overlay').should('be.hidden');
  });

  // skipped because resolution size differs in build, causing snapshots to not match
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('widget has graph', () => {
    cy.get('echarts-chart').find('svg');
    cy.get('echarts-chart').scrollIntoView();
    cy.get('echarts-chart').toMatchImageSnapshot(
      {
        createDiffImage: true,
        threshold: 0.01,
        name: 'echart_simple',
        thresholdType: 'percent'
      }
    );
  });

  it('graph should throw error and show it as a notification if there is any api error', () => {
    cy.visit('/uiTestChartErrors');
    cy.wait(['@getWebapiData', '@getTOC']);
    cy.get('[id="ui-chart"]').find('[data-cy="notification-error-text"]').contains('Failed to load data');
  });

  it('graph should throw error if it is missing with mandatory properties', () => {
    cy.visit('/uiTestChartErrors');
    cy.wait(['@getWebapiData', '@getTOC']);
    cy.get('[id="ui-test-chart-config"]').find('[data-cy="notification-error-text"]').contains('Widget config is missing the following mandatory properties');
  });

  it('Loading indicator on refresh and Id persistance', () => {
    const sendResponse = interceptIndefinite({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    });
    let id;
    cy.get('mondrian-widget').eq(3)
      .then(value => {
        id = value.prop('id');
      });
    cy.get('[data-cy="action-button"]').eq(3).click();
    cy.get('[data-cy="action-button-refreshWidget"]').click();
    cy.get('echarts-chart [data-cy="spinnerOverlay"]').should('be.visible').then(() => {
      sendResponse();
      cy.get('echarts-chart [data-cy="spinnerOverlay"]').should('be.hidden');
      cy.get('mondrian-widget').eq(3).should('have.attr', 'id', id);
    });
  });

  it('Widget has no Export to CSV action', () => {
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('.ux-menu').should('not.contain', 'Export to CSV');
  });
});

describe('EChart Partial Load', shared.defaultTestOptions, () => {
  it('graph when partial data is available', () => {
    cy.bvdLogin();
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/chartErrorStillLoadData*`
    }).as('getPage');
    cy.visit('/chartErrorStillLoadData');
    cy.wait(['@getTOC', '@getPage']);
    // Page has totally 7 xhr request for webapi datasource
    // this sometimes fails when a xhr request returns before the wait started to wait
    // https://github.com/cypress-io/cypress/issues/5999
    cy.wait(['@getWebapiData', '@getWebapiData', '@getWebapiData',
      '@getWebapiData', '@getWebapiData', '@getWebapiData',
      '@getWebapiData'])
      .then(xhrs => {
        const failedReq = xhrs.filter(xhr => xhr.response.statusCode === 500).length;
        const passedReq = xhrs.filter(xhr => xhr.response.statusCode === 200).length;
        assert.equal(failedReq, 2, 'Totally 2 calls failed');
        assert.equal(passedReq, 5, 'Totally 5 calls passed');
      });
    cy.get('echarts-chart');
    cy.get('notification').find('.alert-content');
  });
});

describe('Echarts Legends', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/legendAction*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/legendAction');
    cy.wait(['@getPage', '@getData', '@getTOC']);
  });

  it('Should show dropdown in case of multiple actions and a single icon in case of a single action (plus triggered it)', () => {
    cy.url().should('include', 'legendAction');
    cy.get('simple-list').contains('loadgen.mambo.net');
    cy.get('[data-cy="loadgen.mambo.net"]').find('ux-checkbox').invoke('show').click();
    cy.wait(['@getData']);
    cy.get('simple-list').contains('obac.mambo.net');
    cy.get('[data-cy="obac.mambo.net"]').find('ux-checkbox').invoke('show').click();
    cy.wait(['@getData', '@getTOC']);
    cy.get('#ui-test-cpu-utilization-with-two-legend-actions').find('echarts-chart').find(`[data-cy="echarts-legend-CPU Utilization (avg): host_name: obac.mambo.net"]`).trigger('mouseenter').find('app-action-dropdown').find('span')
      .should('have.class', 'qtm-icon-context-menu');
    cy.get('#ui-test-cpu-utilization')
      .find('echarts-chart')
      .find(`[data-cy="echarts-legend-CPU Utilization (avg): host_name: obac.mambo.net"]`)
      .trigger('mouseenter')
      .find('app-action-dropdown')
      .find('[data-cy="popupLegendAction_id-action-button"]')
      .should('have.class', 'qtm-icon-duplicate')
      .click();
    cy.on('window:alert', alertText => {
      expect(alertText).to.contains(`legendName : CPU Utilization (avg): host_name: obac.mambo.net`);
      expect(alertText).to.contains('{ id : obac.mambo.net,');
      expect(alertText).to.contains('name : obac.mambo.net,');
      expect(alertText).to.contains('type : host }');
      expect(alertText).to.contains('{ id : loadgen.mambo.net,');
      expect(alertText).to.contains('name : loadgen.mambo.net,');
      expect(alertText).to.contains('type : host }');
      expect(alertText).to.contains('Time range : "Sat May 01 2021 - Mon May 31 2021"');
    });
  });

  it('Should not show dropdown since there is no action of source type legend', () => {
    cy.url().should('include', 'legendAction');
    cy.get('#ui-test-chart-selection').find('echarts-chart').find('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseenter')
      .find('app-action-dropdown').should('not.exist');
  });

  it('Should show No data message when data is not present and show echarts svg when data is present', () => {
    cy.url().should('include', 'legendAction');
    cy.get('#ui-test-cpu-utilization-with-two-legend-actions').scrollIntoView();
    cy.get('#ui-test-cpu-utilization-with-two-legend-actions').find('[data-cy="notification-info-text"]').should('contain.text', 'No data');
    cy.get('#ui-test-cpu-utilization-with-two-legend-actions').find('echarts-chart').find('.leftAxisLabel').should('exist').should('have.text', '');
    cy.get('simple-list').contains('loadgen.mambo.net');
    cy.get('[data-cy="loadgen.mambo.net"]').find('ux-checkbox').invoke('show').click();
    cy.wait(['@getData']);
    cy.get('simple-list').contains('obac.mambo.net');
    cy.get('[data-cy="obac.mambo.net"]').find('ux-checkbox').invoke('show').click();
    cy.wait(['@getData', '@getTOC']);
    cy.get('#ui-test-cpu-utilization-with-two-legend-actions').find('svg');
    cy.get('#ui-test-cpu-utilization-with-two-legend-actions').find('echarts-chart').find(`[data-cy="echarts-legend-CPU Utilization (avg): host_name: obac.mambo.net"]`);
    cy.get('#ui-test-cpu-utilization-with-two-legend-actions').find('echarts-chart').find('.leftAxisLabel').should('exist').should('have.text', 'percentage');
  });
});

describe('Echarts Legend Order', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/legendOrderTest*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/legendOrderTest');
    cy.wait(['@getPage', '@getData', '@getData', '@getData', '@getData', '@getData', '@getTOC']);
  });

  it('should retain the order of legend items on widget refresh', () => {
    cy.url().should('include', 'legendOrderTest');
    cy.get('ux-dashboard-widget').eq(0).find('.selection-legend').eq(0).find('.legend-button').should('have.length', 4);
    cy.get('ux-dashboard-widget').eq(0).find('.selection-legend').find('.legend-button').eq(0).contains('if1');
    cy.get('ux-dashboard-widget').eq(0).find('.selection-legend').find('.legend-button').eq(1).contains('if2');
    cy.get('ux-dashboard-widget').eq(0).find('.selection-legend').find('.legend-button').eq(2).contains('if3');
    cy.get('ux-dashboard-widget').eq(0).find('.selection-legend').find('.legend-button').eq(3).contains('if4');

    cy.get('ux-dashboard-widget').eq(0).get('[data-cy="action-button"]').eq(0).click();
    cy.get('[data-cy="action-button-refreshWidget"]').click();
    cy.wait(['@getData', '@getData', '@getData', '@getData']);

    cy.get('ux-dashboard-widget').eq(0).find('.selection-legend').eq(0).find('.legend-button').should('have.length', 4);
    cy.get('ux-dashboard-widget').eq(0).find('.selection-legend').find('.legend-button').eq(0).contains('if1');
    cy.get('ux-dashboard-widget').eq(0).find('.selection-legend').find('.legend-button').eq(1).contains('if2');
    cy.get('ux-dashboard-widget').eq(0).find('.selection-legend').find('.legend-button').eq(2).contains('if3');
    cy.get('ux-dashboard-widget').eq(0).find('.selection-legend').find('.legend-button').eq(3).contains('if4');
  });

  it('should retain the order of legend items for pie and donut chart', () => {
    cy.url().should('include', 'legendOrderTest');
    cy.get('ux-dashboard-widget').eq(1).contains('Pie Chart');
    cy.get('ux-dashboard-widget').eq(1).find('.selection-legend').first().find('button').should('have.length', 3);
    cy.get('ux-dashboard-widget').eq(1).find('.selection-legend').find('button').eq(0).contains('HPUX');
    cy.get('ux-dashboard-widget').eq(1).find('.selection-legend').find('button').eq(1).contains('Linux');
    cy.get('ux-dashboard-widget').eq(1).find('.selection-legend').find('button').eq(2).contains('Windows');

    cy.get('ux-dashboard-widget').eq(2).contains('Donut Chart');
    cy.get('ux-dashboard-widget').eq(2).find('.selection-legend').first().find('button').should('have.length', 3);
    cy.get('ux-dashboard-widget').eq(2).find('.selection-legend').find('button').eq(0).contains('HPUX');
    cy.get('ux-dashboard-widget').eq(2).find('.selection-legend').find('button').eq(1).contains('Linux');
    cy.get('ux-dashboard-widget').eq(2).find('.selection-legend').find('button').eq(2).contains('Windows');
  });
});

