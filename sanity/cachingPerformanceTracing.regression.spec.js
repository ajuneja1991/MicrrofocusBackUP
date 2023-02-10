// <reference types="Cypress" />

const shared = require('../../shared/shared');
const dayjs = require('dayjs');

const metrics = {};

describe('Caching Performance', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as('getPageUiTestWidgets');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/allChartsPage*`
    }).as('getPageAllCharts');
  });

  it('Performance metric page load time', () => {
    cy.bvdLogin();
    const todayDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
    let totalTimetaken = 0;
    let avgTimeTakenToLoadPage = 0;
    let start;
    let end;
    const iterations = 5;
    let i = 0;
    const pageLoadTimeFnc = () => {
      start = Date.now();
      cy.visit('/uiTestWidgets');
      cy.get('[data-cy=breadcrumb-uiTestWidgets] > .mondrianBreadcrumbData').then(() => {
        end = Date.now() - start;
        totalTimetaken += end;
        i += 1;
        if (i < iterations) {
          pageLoadTimeFnc();
        } else {
          avgTimeTakenToLoadPage = totalTimetaken / iterations;
          cy.log('Date:', todayDate);
          cy.log('avgTimeTakenToLoadPageInMS:', avgTimeTakenToLoadPage);
          metrics.pageLoadTime = { timestamp: todayDate, value: avgTimeTakenToLoadPage };
        }
      });
    };
    pageLoadTimeFnc();
  });
  it('Performance metric page switch time', () => {
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
    let totalTimetaken = 0;
    let avgTimeTakenToSwitchPage = 0;
    let start;
    let end;
    const iterations = 5;
    let i = 0;
    cy.bvdLogin();
    const pageSwitchTime = () => {
      cy.visit('/uiTestWidgets?_m=testWidgetsEntry');
      cy.wait(['@getPageUiTestWidgets', '@getWebapiData']);
      start = Date.now();
      cy.bvdSideNavClick('navigation-category-T2', ['navigation-category-T7'], 'navigation-menuEntry-testAllChartsEntry');
      cy.wait(['@getWebapiData', '@getPageAllCharts']);
      cy.get('#avg_cpu_baseline_chart_component_ec').then(() => {
        end = Date.now() - start;
        totalTimetaken += end;
        i += 1;
        if (i < iterations) {
          pageSwitchTime();
        } else {
          avgTimeTakenToSwitchPage = totalTimetaken / iterations;
          cy.log('Date:', timestamp);
          cy.log('avgTimeTakenToSwitchPageInMillisecond:', avgTimeTakenToSwitchPage);
          metrics.pageSwitchTime = { timestamp, value: avgTimeTakenToSwitchPage };
        }
      });
    };
    pageSwitchTime();
  });

  after(() => {
    cy.writeFile('cachingPerformanceData.json', metrics);
  });
});

