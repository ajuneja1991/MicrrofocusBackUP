const shared = require('../../shared/shared');

describe('Putting graph elements into a parent/child relation', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/parentChildRelationPage*`
    }).as('getPage');
    cy.bvdLogin();
    cy.visit('/parentChildRelationPage');
    cy.wait(['@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getPage']);
  });

  it('Test parent to child property set to valid', () => {
    cy.get('#ui-test-chart-parent-set').find('echarts-chart').find('button').click();
    cy.get('[id="Memory Utilization (avg): host_name: vdb.mambo.net"]');
    cy.get('[id="CPU Utilization (avg): host_name: vdb.mambo.net"]').should('exist');
  });

  it('Test parent to child property not set', () => {
    cy.get('#ui-test-chart-parent-notset').find('echarts-chart').find('button').click();
    cy.get('[id="Memory Utilization (avg): host_name: vdb.mambo.net"]');
    cy.get('[id="CPU Utilization (avg): host_name: vdb.mambo.net"]');
  });

  it('Test parent to child property set to invalid', () => {
    cy.get('#ui-test-chart-parent-set-invalid').find('echarts-chart').find('button').click();
    cy.get('[id="Memory Utilization (avg): host_name: vdb.mambo.net"]');
    cy.get('[id="CPU Utilization (avg): host_name: vdb.mambo.net"]').should('exist');
  });

  it('Test parent to child property set to empty', () => {
    cy.get('#ui-test-chart-parent-set-empty').find('echarts-chart').find('button').click();
    cy.get('[id="Memory Utilization (avg): host_name: vdb.mambo.net"]');
    cy.get('[id="CPU Utilization (avg): host_name: vdb.mambo.net"]');
  });

  it('Legend should get checked when the Metric line is clicked in the chart', () => {
    cy.get('#baselineChartWithGrouping').find('echarts-chart').find('.legend-button').should('have.length', 2);
    cy.get('#baselineChartWithGrouping').find('echarts-chart').find('.legend-button').eq(0).contains('CiscoO');
    cy.get('#baselineChartWithGrouping').find('echarts-chart').find('.legend-button').eq(1).contains('lab-s1');
    cy.get('#baselineChartWithGrouping > echarts-chart').find('svg').find('g').eq(0).find('g')
      .eq(1)
      .then(gElement => {
        cy.wrap(gElement).invoke('attr', 'clip-path').should('contain', 'url(#zr4-c1)');
        cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
        cy.wrap(gElement).find('path').should('not.have.attr', 'stroke-width');

        cy.get('[data-cy="legend-title-backplane_util_avg_pct: nodeName: CiscoO"]').click();
        cy.wait('@getData');
        cy.get('#baselineChartWithGrouping > echarts-chart').find('svg').find('g').eq(0).find('g')
          .eq(2)
          .then(gElementNew => {
            cy.wrap(gElementNew).find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
            cy.wrap(gElementNew).find('path').invoke('attr', 'stroke-width').should('contain', '2');
            cy.get('[data-cy="backplane_util_avg_pct: nodeName: CiscoO"] input').should('be.checked');
            cy.get('[data-cy="backplane_util_avg_pct: nodeName: lab-s1"] input').should('not.be.checked');

            // Using force:true as it is covered by the other path element when clicking on the metric line in charts
            // eslint-disable-next-line cypress/no-force
            cy.get('[clip-path="url(#zr4-c2)"] > path').click({ ctrlKey: true, force: true });
            cy.get('#baselineChartWithGrouping > echarts-chart').find('svg').find('g').eq(0).find('g')
              .eq(1)
              .then(gElementLab => {
                cy.wrap(gElementLab).find('path').invoke('attr', 'stroke').should('contain', '#5470c6');
                cy.wrap(gElementLab).find('path').invoke('attr', 'stroke-width').should('contain', '2');
                cy.get('[data-cy="backplane_util_avg_pct: nodeName: CiscoO"] input').should('not.be.checked');
                cy.get('[data-cy="backplane_util_avg_pct: nodeName: lab-s1"] input').should('be.checked');
              });
          });
      });
  });
});

describe('Baseline Grouping', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      path: `${shared.exploreContextRoot}/assets/l10n/mondrian_en.json`
    }).as('getAsset');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/BaselineGrouping*`
    }).as('getPage');
    cy.bvdLogin();
    cy.visit('/BaseLineGrouping');
    cy.wait(['@getData', '@getAsset', '@getAsset']);
  });

  it('Test the Baseline Grouping', () => {
    cy.get('#baselineChart').find('echarts-chart').find('.legend-button').should('have.length', 2);
    cy.get('#baselineChart').find('echarts-chart').find('.legend-button').eq(0).contains('CiscoO');
    cy.get('#baselineChart').find('echarts-chart').find('.legend-button').eq(1).contains('lab-s1');
    cy.get('#baselineChart > echarts-chart').find('svg').find('g').eq(0).find('g')
      .eq(1)
      .then(gElement => {
        cy.wrap(gElement).invoke('attr', 'clip-path').should('contain', 'url(#zr0-c1)');
        cy.wrap(gElement).find('path').should('not.have.attr', 'stroke-width');
        cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('contain', '#3939C6');

        cy.get('[data-cy="legend-title-backplane_util_avg_pct: nodeName: CiscoO"]').click();
        cy.get('#baselineChart > echarts-chart').find('svg').find('g').eq(0).find('g')
          .eq(2)
          .then(gElementCisco => {
            cy.wrap(gElementCisco).find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
            cy.wrap(gElementCisco).find('path').invoke('attr', 'stroke-width').should('contain', '2');
            cy.get('[data-cy="backplane_util_avg_pct: nodeName: CiscoO"] input').should('be.checked');
            cy.get('[data-cy="backplane_util_avg_pct: nodeName: lab-s1"] input').should('not.be.checked');
          });
      });
    cy.get('#baselineChart > echarts-chart').find('svg').find('g').eq(0).find('g')
      .eq(0)
      .then(gElement => {
        cy.wrap(gElement).find('path').invoke('attr', 'fill').should('contain', '#3939C6');
      });
    cy.get('#baselineChart > echarts-chart').find('svg').find('g').eq(0).find('g')
      .eq(3)
      .then(gElement => {
        cy.wrap(gElement).invoke('attr', 'clip-path').should('contain', 'url(#zr0-c3)');
        cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('contain', '#E57828');
        cy.wrap(gElement).find('path').should('not.have.attr', 'stroke-width');

        cy.get('[data-cy="legend-title-backplane_util_avg_pct: nodeName: lab-s1"]').click();
        cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('contain', '#E57828');
        cy.wrap(gElement).find('path').invoke('attr', 'stroke-width').should('contain', '2');
        cy.get('[data-cy="backplane_util_avg_pct: nodeName: CiscoO"] input').should('not.be.checked');
        cy.get('[data-cy="backplane_util_avg_pct: nodeName: lab-s1"] input').should('be.checked');
      });
    cy.get('#baselineChart > echarts-chart').find('svg').find('g').eq(0).find('g')
      .eq(0)
      .then(gElement => {
        cy.wrap(gElement).find('path').invoke('attr', 'fill').should('contain', '#E57828');
      });
    cy.get('[data-cy="legend-title-backplane_util_avg_pct: nodeName: lab-s1"]').click();
    cy.get('[data-cy="backplane_util_avg_pct: nodeName: CiscoO"] input').should('not.be.checked');
    cy.get('[data-cy="backplane_util_avg_pct: nodeName: lab-s1"] input').should('not.be.checked');
    cy.get('#baselineChart > echarts-chart').find('svg').find('g').eq(0).find('g')
      .eq(0)
      .then(gElement => {
        cy.wrap(gElement).find('path').invoke('attr', 'fill').should('not.contain', '#E57828');
        cy.wrap(gElement).find('path').invoke('attr', 'fill').should('not.contain', '#3939C6');
        cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('not.contain', 'none');
      });
  });

  it('Verifying for the chart tooltip to be dispalyed', () => {
    cy.get('#baselineChart').find('echarts-chart').find('.legend-button').should('have.length', 2);
    cy.get('#baselineChart').find('echarts-chart').find('.legend-button').eq(0).contains('CiscoO');
    cy.get('#baselineChart').find('echarts-chart').find('.legend-button').eq(1).contains('lab-s1');
    cy.get('#baselineChart > echarts-chart').find('svg').find('g').eq(0).find('g')
      .eq(1)
      .then(gElement => {
        cy.wrap(gElement).invoke('attr', 'clip-path').should('contain', 'url(#zr0-c1)');
        cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('contain', '#3939C6');

        cy.get('[data-cy="legend-title-backplane_util_avg_pct: nodeName: CiscoO"]').click();
        cy.get('#baselineChart > echarts-chart').find('svg').find('g').eq(0).find('g')
          .eq(2)
          .then(gElementCisco => {
            cy.wrap(gElementCisco).find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
            cy.wrap(gElementCisco).find('path').invoke('attr', 'stroke-width').should('contain', '2');
            cy.get('[data-cy="backplane_util_avg_pct: nodeName: CiscoO"] input').should('be.checked');
            cy.get('[data-cy="backplane_util_avg_pct: nodeName: lab-s1"] input').should('not.be.checked');
            // eslint-disable-next-line cypress/no-force
            cy.get('[clip-path="url(#zr0-c2)"] > path').click({ force: true });
            cy.get('[data-cy="echartTooltip"] > b').then($data => {
              cy.log($data.text());
            });
            cy.get('.hideChartTooltip >div >span').then($data => {
              expect($data).contain.text('backplane_util_avg_pct: nodeName: CiscoObackplane_util_avg_pct_lower_normal:  nodeName: CiscoObackplane_util_avg_pct_upper_normal:  nodeName: CiscoO');
            });
          });
      });
  });
});
