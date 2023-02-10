const shared = require('../../shared/shared');

const clickOutside = function() {
  cy.get('.cdk-overlay-connected-position-bounding-box');
  cy.get('body').click(0, 0);
};

const chartLines = function() {
  cy.get('echarts-chart').find('svg').find('g').eq(0).find('g').eq(1)
    .as('blueline');
  cy.get('echarts-chart').find('svg').find('g').eq(0).find('g').eq(2)
    .as('orangeline');
};

describe('Select or unselect chart lines', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/chartLegendsPage*`
    }).as('getChartLegendsPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/allChartsPage*`
    }).as('getAllChartsPage');
    cy.bvdLogin();
  });

  it('Check legend selection', () => {
    cy.visit('/chartLegendsPage');
    cy.wait(['@getData', '@getChartLegendsPage']);
    cy.location().should(loc => {
      expect(loc.search).to.include('_s');
      expect(loc.search).to.include('_e');
    });
    cy.get('[id="ui-test-complex-chart"]').find('echarts-chart').within(() => {
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('not.be.checked');
      cy.get('[data-cy="echarts-legend-Memory Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="Memory Utilization (avg): host_name: vdb.mambo.net"] input').should('not.be.checked');
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('not.be.checked');

      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').click();
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('be.checked');
      cy.get('[data-cy="echarts-legend-Memory Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="Memory Utilization (avg): host_name: vdb.mambo.net"] input').should('not.be.checked');
      cy.get('[data-cy="echarts-legend-Memory Utilization (avg): host_name: vdb.mambo.net"]').click();
      cy.get('[data-cy="echarts-legend-Memory Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="Memory Utilization (avg): host_name: vdb.mambo.net"] input').should('be.checked');
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('not.be.checked');
    });

    cy.get('body').click();
    // cy.get('[id="ui-test-complex-chart"]').find('echarts-chart').find('button').click();
    cy.get('[id="ui-test-complex-chart"]').find('echarts-chart').within(() => {
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('not.be.checked');
      cy.get('[data-cy="echarts-legend-Memory Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="Memory Utilization (avg): host_name: vdb.mambo.net"] input').should('be.checked');
    });
  });

  it('Check that the action with only source `legend` appears as legend action', () => {
    // The 1st chart has actions registered with source "overlay_changes" and "onLegendStateSelectChange" but these should not appear as legend action when hovering on legends.
    cy.visit('/allChartsPage');
    cy.wait(['@getData', '@getAllChartsPage']);
    cy.get('[id="average_cpu_chart_component_with_Change_Marker"]').find('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="action-button"]')
      .should('not.exist');
  });

  it('Legend selection should persist after widget refresh', () => {
    cy.visit('/chartLegendsPage');
    cy.wait(['@getData', '@getChartLegendsPage']);
    cy.get('#ui-test-complex-chart').find('echarts-chart').within(() => {
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('not.be.checked');
      cy.get('[data-cy="echarts-legend-Memory Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="Memory Utilization (avg): host_name: vdb.mambo.net"] input').should('not.be.checked');
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').click();
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('be.checked');
    });
    cy.get('[data-cy="action-button"]').last().click();
    cy.get('#action-button-refreshWidget').click();
    cy.wait(['@getData', '@getData']);
    cy.get('#ui-test-complex-chart').find('echarts-chart').within(() => {
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('be.checked');
    });
  });

  it('Legend selection should not persist after loading a saved page', () => {
    cy.visit('/chartLegendsPage');
    cy.wait(['@getData', '@getChartLegendsPage']);
    cy.get('#ui-test-complex-chart').find('echarts-chart').within(() => {
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('not.be.checked');
      cy.get('[data-cy="echarts-legend-Memory Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="Memory Utilization (avg): host_name: vdb.mambo.net"] input').should('not.be.checked');
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').click();
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('be.checked');
    });
    // eslint-disable-next-line cypress/no-force
    cy.get('ux-dashboard-widget').first().find('.handle-right').trigger('mousedown', { which: 1 }, 'right').trigger('mousemove', 200, 300, { force: true }).click();
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-save"]').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.bvdCheckToast('Update of the definition was successful');
    cy.reload();
    cy.get('#ui-test-complex-chart').find('echarts-chart').find('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').trigger('mouseover').find('[data-cy="CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('not.be.checked');
  });

  it('Should show the translated legends', () => {
    cy.visit('/chartLegendsPage');
    cy.wait(['@getData', '@getChartLegendsPage']);
    cy.get('#ui-test-complex-chart').find('echarts-chart').within(() => {
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').should('contain', 'CPU Utilization (avg)');
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').should('not.contain', 'CPU(avg)');
      cy.get('[data-cy="echarts-legend-Memory Utilization (avg): host_name: vdb.mambo.net"]').should('contain', 'Memory Utilization (avg)');
      cy.get('[data-cy="echarts-legend-Memory Utilization (avg): host_name: vdb.mambo.net"]').should('not.contain', 'Memory(avg)');
    });
  });

  it('CTRL-Click on legend is the same as clicking the checkbox', () => {
    cy.visit('/chartLegendsPage');
    cy.wait(['@getData', '@getChartLegendsPage']);
    cy.get('#ui-test-complex-chart').find('echarts-chart').within(() => {
      cy.get('[data-cy="legend-title-Memory Utilization (avg): host_name: vdb.mambo.net"]').click();
      cy.get('[data-cy="legend-title-CPU Utilization (avg): host_name: vdb.mambo.net"]').click({ ctrlKey: true });
      cy.get('[data-cy="CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('be.checked');
      cy.get('[data-cy="Memory Utilization (avg): host_name: vdb.mambo.net"] input').should('be.checked');
      cy.get('[data-cy="legend-title-CPU Utilization (avg): host_name: vdb.mambo.net"]').click({ ctrlKey: true });
      cy.get('[data-cy="CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('not.be.checked');
      cy.get('[data-cy="Memory Utilization (avg): host_name: vdb.mambo.net"] input').should('be.checked');
    });
  });
  it('Shift-Click is selecting from the previously to the currently clicked', () => {
    cy.visit('/chartLegendsPage');
    cy.wait(['@getData', '@getChartLegendsPage']);
    cy.get('#ui-test-complex-chart').find('echarts-chart').within(() => {
      cy.get('[data-cy="legend-title-CPU Utilization (avg): host_name: vdb.mambo.net"]').click();
      cy.get('[data-cy="legend-title-Memory Utilization (avg): host_name: vdb.mambo.net"]').click({ shiftKey: true });
      cy.get('[data-cy="CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('be.checked');
      cy.get('[data-cy="Memory Utilization (avg): host_name: vdb.mambo.net"] input').should('be.checked');
    });
  });

  it('changed time to reflect in echart after clicking only on Apply button', () => {
    cy.visit('/chartLegendsPage');
    cy.wait(['@getData', '@getData', '@getChartLegendsPage']);
    cy.get('[data-cy=context-filter-menu]').click();
    cy.get('ux-date-time-picker.start-date-picker').find('ux-time-picker').find('[aria-label="hour"]').clear().type('7');
    cy.get('ux-date-time-picker.start-date-picker').find('ux-time-picker').find('[aria-label="minute"]').clear().type('5');
    cy.get('ux-date-time-picker.start-date-picker').find('ux-time-picker').find('[aria-label="PM"]').click();
    cy.get('ux-date-time-picker.end-date-picker').find('ux-time-picker').find('[aria-label="hour"]').clear().type('8');
    cy.get('ux-date-time-picker.end-date-picker').find('ux-time-picker').find('[aria-label="minute"]').clear().type('2');
    cy.get('ux-date-time-picker.start-date-picker').find('ux-time-picker').find('[aria-label="AM"]').click();
    cy.get('[data-cy=contextFilterApplyButton]').click();
    cy.wait(['@getData', '@getData']);
    cy.get('[data-cy=timeSelectorStartTime]').then($data => {
      const startTime = $data.text();
      cy.log(startTime)
        .should('include.text', startTime);
    });
    cy.get('[data-cy=timeSelectorEndTime]').then($data => {
      const endTime = $data.text();
      cy.log(endTime)
        .should('include.text', endTime);
    });
    cy.get('#ui-test-complex-chart > echarts-chart').find('svg').find('g').eq(0).find('g')
      .eq(1)
      .then(gElement => {
        cy.wrap(gElement).get('[text-anchor="middle"]').should('contain.text', '8:00:00 PM');
        cy.wrap(gElement).get('[text-anchor="middle"]').should('contain.text', '8:00:00 AM');
      });
  });

  it('Zoom in/Zoom out should not change the color of the line chart ', () => {
    cy.visit('/chartLegendsPage');
    cy.wait(['@getData', '@getData', '@getChartLegendsPage']);
    chartLines();
    cy.get('@blueline').invoke('attr', 'clip-path').should('contain', 'url(#zr0-c1)');
    cy.get('@blueline').find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
    cy.get('@orangeline').invoke('attr', 'clip-path').should('contain', 'url(#zr0-c2)');
    cy.get('@orangeline').find('path').invoke('attr', 'stroke').should('contain', '#E57828');
    cy.get('[data-cy=contextView]').find('[data-cy="context-filter-menu"]').as('contextFilterMenu');
    cy.get('@contextFilterMenu').find('[data-cy="zoomIn"]').click();
    chartLines();
    cy.get('@blueline').find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
    cy.get('@orangeline').find('path').invoke('attr', 'stroke').should('contain', '#E57828');
    cy.get('@contextFilterMenu').find('[data-cy="zoomOut"]').click();
    cy.wait(['@getData', '@getData']);
    chartLines();
    cy.get('@blueline').find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
    cy.get('@orangeline').find('path').invoke('attr', 'stroke').should('contain', '#E57828');
  });

  it('Clicking on a legend should highlight the metric line in the chart', () => {
    cy.visit('/chartLegendsPage');
    cy.wait(['@getData', '@getData', '@getChartLegendsPage']);
    cy.get('#ui-test-complex-chart > echarts-chart').find('svg').find('g').eq(0).find('g')
      .eq(1)
      .then(gElement => {
        cy.wrap(gElement).invoke('attr', 'clip-path').should('contain', 'url(#zr0-c1)');
        cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
        cy.wrap(gElement).find('path').should('not.have.attr', 'stroke-width');

        cy.get('[data-cy="legend-title-CPU Utilization (avg): host_name: vdb.mambo.net"]').click();

        cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
        cy.wrap(gElement).find('path').invoke('attr', 'stroke-width').should('contain', '2');
      });
  });

  it('To check for the Grid lines to present in chart', () => {
    cy.visit('/chartLegendsPage');
    cy.wait(['@getData', '@getData', '@getChartLegendsPage']);
    cy.get('#ui-test-complex-chart > echarts-chart').find('svg').find('g').eq(0).then(gElement => {
      cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('contain', '#E0E6F1');
    });
  });

  it('should not display overlays and config change after select a legend and duplicate the widget', () => {
    cy.visit('/chartLegendsPage');
    cy.wait(['@getData', '@getChartLegendsPage']);

    cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('not.be.checked');
    cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]').click();
    cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('be.checked');
    cy.get('[data-cy="action-button"]').first().click();
    cy.get('[data-cy="action-button-duplicateWidget"]').click();

    cy.get('ux-dashboard-widget:nth-child(2)').find('echarts-chart').within(() => {
      cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"] input').should('not.be.checked');
    });
  });
});

describe('Validate legend if not in dropdown', () => {
  // It is an other page needed, due to special problems in that page in the legend
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/ChartsPage*`
    }).as('getChartLegendsPage');
    cy.bvdLogin();
    cy.visit('/ChartsPage');
    cy.wait('@getChartLegendsPage');
    // inside the page there are 8 calls to /v2/datasource/ws/data
    cy.wait('@getData');
    cy.wait('@getData');
    cy.wait('@getData');
    cy.wait('@getData');
    cy.wait('@getData');
    cy.wait('@getData');
    cy.wait('@getData');
    cy.wait('@getData');
  });

  it('Check legend selection', () => {
    cy.get('#avg_cpu_baseline_chart_component_ec')
      .within(() => {
        cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]');
        cy.get('[data-cy="chart-legend-dropdown-button"]').should('not.exist');
      });

    cy.get('#average_cpu_chart_component_with_Change_Marker')
      .within(() => {
        cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]');
        cy.get('[data-cy="chart-legend-dropdown-button"]').should('not.exist');
      });

    cy.get('#average_cpu_chart_threshold_component_1')
      .within(() => {
        cy.get('[data-cy="echarts-legend-CPU Utilization (avg): host_name: vdb.mambo.net"]');
        cy.get('[data-cy="chart-legend-dropdown-button"]').should('not.exist');
      });
  });
});

describe('Metric Browser Demo Page', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebApiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/metricBrowserDemo*`
    }).as('getTestPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/SavedMetricsPage*`
    }).as('getNewSavedPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/metric_browser_mockdsproxy`
    }).as('getWidget');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      method: 'PUT',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('putPages');
    cy.bvdLogin();
    cy.visit('/metricBrowserDemo?_tft=A&_a=open_metric_browser&_ctx=~(~(id~%278553d044-6e7b-46a0-aee3-ffcc24615ed6~name~%27CiscoO~type~%27node)~(id~%272553d044-6e7b-46a0-aee3-ffcc24615ed7~name~%27lab-s1~type~%27node))', {
      onBeforeLoad(win) {
        win.sessionStorage.clear();
      }
    });
    cy.get('[data-cy=app-spinnerOverlay]').should('not.exist');
    cy.wait(['@getTestPage', '@getTOC', '@getWidget']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.wait(['@getWebApiData']);
    cy.get('ux-side-panel').find('[data-cy="dataExplorer"]');
    cy.get('[data-cy="TargetTypesDropdown"]').contains('Node');
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('[data-cy="selected-option-CiscoO"]');
    cy.get('[data-cy="selected-option-lab-s1"]');
    cy.wait(['@getWebApiData', '@getWebApiData']);
    cy.get('.metric-browser-spinner > [data-cy="spinnerOverlay"]').should('not.be.visible');
  });

  it('should add metrics and verify the tooltip', () => {
    cy.get('[title="Clear all"]').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('mpls2950-1.ftc.hpeswlab.net').click();
    cy.wait('@getWebApiData');
    cy.get('[data-cy="advanced-select-dropdown"]').find('[data-cy="optionName"]').contains('mplsce03.ftc.hpeswlab.net').click();
    cy.wait('@getWebApiData');
    cy.get('[data-cy="advanced-select-dropdown"]').find('.ng-arrow-wrapper').click();
    cy.wait(['@getWebApiData', '@getWebApiData']);
    cy.get('.metric-browser-spinner > [data-cy="spinnerOverlay"]').should('not.be.visible');
    cy.get('[data-cy="field-group-component_health"]').should('be.visible');
    cy.get('[data-cy="dataExplorer"]').find('ux-toolbar-search> input').first().click().type('snmp');
    cy.get('[data-cy="metricName"] > div').contains('SNMP Response Time (avg)');
    cy.get('[data-cy="metricContainer"]').should('be.visible');
    cy.get('[data-cy="metricContainer"]').first().click();
    cy.get('[data-cy="metricContainer"]').find('button').first().invoke('show').click();
    cy.wait('@getWebApiData');
    cy.get('[data-cy="btn-side-panel-close"]').click();
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('echarts-chart svg').find('g').eq(0).find('g')
      .eq(1)
      .then(gElement => {
        cy.wrap(gElement).invoke('attr', 'clip-path').should('contain', 'url(#zr0-c1)');
        cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
        cy.wrap(gElement).find('path').should('not.have.attr', 'stroke-width');
        cy.get('[data-cy=chart-legend-dropdown-button]').click();
        cy.get('[data-cy="legend-SNMP Response Time (avg): nodeName: mpls2950-1.ftc.hpeswlab.net"] > .legend-button > .legend-name > .legend-svg').click();
        cy.wait(['@getWebApiData']);
        cy.wrap(gElement).find('path').invoke('attr', 'stroke-width').should('contain', '2');
        cy.get('[data-cy="checkbox-SNMP Response Time (avg): nodeName: mpls2950-1.ftc.hpeswlab.net"] input').should('be.checked');
        clickOutside();
        // clickOutside() does not work here and hence using force click
        // eslint-disable-next-line cypress/no-force
        cy.get('[clip-path="url(#zr0-c2)"] > path').click({ ctrlKey: true, force: true });
        cy.get('[data-cy="echartTooltip"] > b').then($data => {
          cy.log($data.text());
        });
        cy.get('.hideChartTooltip >div >span').then($data => {
          expect($data).contain.text('SNMP Response Time (avg): nodeName: mpls2950-1.ftc.hpeswlab.net');
        });
      });
  });

  it('legend selection should not change after moving to widget actions button', () => {
    cy.get('[data-cy="field-group-component_health"]').click();
    cy.get('[data-cy="metricContainer"]').first().click();
    cy.get('[data-cy="metricContainer"]').find('button').first().invoke('show').click();
    cy.wait(['@getWebApiData', '@getWebApiData']);
    cy.get('.dashboard-widget-title span').contains('Backplane Utilization (avg)');
    cy.get('[data-cy="btn-side-panel-close"]').click();
    cy.get('echarts-chart svg').find('g').eq(0).find('g')
      .eq(1)
      .then(gElement => {
        cy.wrap(gElement).invoke('attr', 'clip-path').should('contain', 'url(#zr0-c1)');
        cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
        cy.wrap(gElement).find('path').should('not.have.attr', 'stroke-width');
        cy.get('[data-cy=chart-legend-dropdown-button]').click();
        cy.get('[data-cy="legend-Backplane Utilization (avg): nodeName: CiscoO"] > .legend-button > .legend-name > .legend-svg').click();
        cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getWebApiData']);
        clickOutside();
        cy.get('echarts-chart svg').find('g').eq(0).find('g')
          .eq(2)
          .then(gElementNew => {
            cy.wrap(gElementNew).find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
            cy.wrap(gElementNew).find('path').invoke('attr', 'stroke-width').should('contain', '2');
            cy.get('[data-cy="action-button"]').should('be.visible').click();
            clickOutside();
            cy.wrap(gElementNew).invoke('attr', 'clip-path').should('contain', 'url(#zr0-c2)');
            cy.wrap(gElementNew).find('path').invoke('attr', 'stroke').should('contain', '#3939C6');
            cy.get('[data-cy=chart-legend-dropdown-button]').click();
            cy.get('[data-cy="checkbox-Backplane Utilization (avg): nodeName: CiscoO"] input').should('be.checked');
          });
      });
  });
});

describe('Chart selection Decoupling', () => {
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
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/toggleChildMetricsPage*`
    }).as('getPage');
    cy.bvdLogin();
    cy.visit('/toggleChildMetricsPage');
    cy.wait(['@getData', '@getAsset', '@getPage']);
  });

  it('Verify chart selection is decoupled from show/hide of child metrics', () => {
    cy.get('[data-cy="legend-title-backplane_util_avg_pct: nodeName: CiscoO"]').eq(0).click();
    cy.wait('@getData');
    cy.get('[data-cy="echart"]').eq(0).then(element => {
      cy.wrap(element).trigger('mousemove', 200, 10);
      cy.get('#tooltipDataHostName > span').then($data => {
        expect($data).not.contain.text('backplane_util_avg_pct_lower_normal:  nodeName: CiscoO');
      });
      cy.wrap(element).trigger('mouseout');
    });

    cy.get('[data-cy="echarts-legend-backplane_util_avg_pct: nodeName: CiscoO"]').eq(0).find('[data-cy="child-metric"]').click();
    cy.wait('@getData');
    cy.get('[data-cy="echart"]').eq(0).then(element => {
      cy.wrap(element).trigger('mousemove', 50, 10);
      cy.get('#tooltipDataHostName > span').eq(1).then($data => {
        expect($data).contain.text('backplane_util_avg_pct_lower_normal:  nodeName: CiscoO');
      });
      cy.get('#tooltipDataHostName > span').eq(2).then($data => {
        expect($data).contain.text('backplane_util_avg_pct_upper_normal:  nodeName: CiscoO');
      });
      cy.wrap(element).trigger('mouseout');
    });
    cy.get('[data-cy="echarts-legend-backplane_util_avg_pct: nodeName: lab-s1"]').eq(0).find('[data-cy="child-metric"]').click();
    cy.wait('@getData');
    cy.get('[data-cy="echart"]').eq(0).then(element => {
      cy.wrap(element).trigger('mousemove', 100, 10);
      cy.get('#tooltipDataHostName > span').eq(1).then($data => {
        expect($data).contain.text('backplane_util_avg_pct_lower_normal:  nodeName: lab-s1');
      });
      cy.get('#tooltipDataHostName > span').eq(2).then($data => {
        expect($data).contain.text('backplane_util_avg_pct_upper_normal:  nodeName: lab-s1');
      });
      cy.wrap(element).trigger('mouseout');
    });
  });

  it('Verify children is automatically enabled , if there is only one parent in the chart and toggling of overlays', () => {
    cy.get('span').contains('Overlays with single parent').parents('mondrian-widget').find('[data-cy="echart"]').then(element => {
      cy.wrap(element).scrollIntoView();
      cy.get('echarts-chart').eq(5).find('g').eq(0).find('g')
        .eq(0)
        .then(gElement => {
          cy.wrap(gElement).invoke('attr', 'clip-path').should('contain', 'url(#zr5-c0)');
          cy.wrap(gElement).find('path').invoke('attr', 'stroke').should('contain', '#5470c6');
          cy.wrap(gElement).find('path').should('not.have.attr', 'stroke-width');
        });
    });
    cy.get('echarts-chart').eq(5).find('g').eq(0).find('image')
      .eq(0)
      .then(gElement => {
        cy.wrap(gElement).rightclick().then(() => {
          cy.get('#tooltipBody >div span').should('contain.text', 'Config changes: mpls2950-1.ftc.hpeswlab.net');
        });
      });
    cy.get('[data-cy="echarts-legend-Backplane Utilization (avg): nodeName: mpls2950-1.ftc.hpeswlab.net"]').eq(1).find('[data-cy="child-metric"]').click();
    cy.wait('@getData');
    cy.get('echarts-chart').eq(5).find('g').eq(0).find('image').should('not.exist');
  });
});
