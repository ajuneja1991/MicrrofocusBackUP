const shared = require('../../shared/shared');
const AVG_CPU_BASELINE_CHART = 0;
const CHANGE_MARKER_CHART = 1;
const PIE_CHART = 2;
const DONUT_CHART = 3;

describe('tooltip in echarts', shared.defaultTestOptions, () => {
  before(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/echartTooltip*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/echartTooltip');
    cy.wait(['@getPage',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getTOC']);
  });

  beforeEach(() => {
    cy.preserveSessionCookie();
  });

  it('tooltip should become persistent on right click and remove on click away', () => {
    cy.get('[data-cy="echart"]').eq(AVG_CPU_BASELINE_CHART).then(element => {
      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.wrap(element).trigger('mouseleave');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.wrap(element).trigger('mouseenter');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.wrap(element).trigger('mousemove', 'topRight');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').trigger('mouseenter');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').trigger('mousemove', 'center');
      cy.wrap(element).trigger('mousemove', 'topRight');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.wrap(element).trigger('mouseleave');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.get('[data-cy="echart"]').eq(CHANGE_MARKER_CHART).trigger('mouseenter');
      cy.get('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.wrap(element).trigger('mouseenter');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.wrap(element).trigger('mousemove', 'topRight').click();
    });
  });

  it('interactive tooltip should be closed on clicking close button', () => {
    cy.get('[data-cy="echart"]').eq(AVG_CPU_BASELINE_CHART).then(element => {
      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.wrap(element).find('[data-cy="close-tooltip"]').click();
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('not.be.visible');
      cy.wrap(element).trigger('mousemove', 'center');
      cy.wrap(element).find('[data-cy="echartTooltip"]').should('be.visible');
      cy.wrap(element).trigger('mouseout');
    });
  });

  it('tooltip should show message for right click and x more items', () => {
    cy.get('[data-cy="echart"]').eq(AVG_CPU_BASELINE_CHART).then(element => {
      cy.wrap(element).trigger('mousemove', 200, 10);
      cy.wrap(element).find('[data-cy="echartTooltip"]').should('be.visible');
      cy.wrap(element).find('[data-cy="more"]').contains('2 more').should('have.class', 'help-block');
      cy.wrap(element).find('[data-cy="right-click-to-interact"]').contains('Right-click to interact').should('have.class', 'help-block');
      cy.wrap(element).trigger('mouseout');
    });
  });

  it('Should check for scroll behavior and max height', () => {
    cy.get('[data-cy="echart"]').eq(AVG_CPU_BASELINE_CHART).then(element => {
      cy.wrap(element).trigger('mousemove', 'center');
      cy.wrap(element).find('[data-cy="more"]').contains('2 more');
      cy.wrap(element).find('div .hideChartTooltip').should('have.length', 5);
      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('div .hideChartTooltip').should('have.length', 7);
      cy.wrap(element).find('div .hideChartTooltip').parent().should('have.css', 'max-height', '184px');
      cy.wrap(element).find('div .hideChartTooltip').parent().should('have.css', 'height', '184px');
      cy.wrap(element).trigger('mousemove', 'topRight').click();
    });
  });

  it('Pie chart should not have help message', () => {
    cy.get('[data-cy="echart"]').eq(PIE_CHART).then(element => {
      /* The click event is not bringing tooltip here hence using hardcoded pointer */
      cy.wrap(element).trigger('mousemove', 200, 40);
      cy.wrap(element).get('[data-cy="echart-tooltip"]').parent().should('be.visible');
      cy.wrap(element).find('[data-cy="right-click-to-interact"]').should('not.exist');
      cy.wrap(element).trigger('mouseout');
    });
  });

  it('Donut chart should not have help message', () => {
    cy.get('[data-cy="echart"]').eq(DONUT_CHART).then(element => {
      /* The click event is not bringing tooltip here hence using hardcoded pointer */
      cy.wrap(element).trigger('mousemove', 200, 20);
      cy.wrap(element).find('[data-cy="echart-tooltip"]').parent().should('be.visible');
      cy.wrap(element).find('[data-cy="right-click-to-interact"]').should('not.exist');
      cy.wrap(element).trigger('mouseout');
    });
  });

  it('Opening persistance tooltip on other chart, should close previously open tooltip', () => {
    cy.get('[data-cy="echart"]').eq(AVG_CPU_BASELINE_CHART).then(element => {
      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.get('[data-cy="echart"]').eq(CHANGE_MARKER_CHART).rightclick('center');
      cy.get('[data-cy="echart"]').eq(CHANGE_MARKER_CHART).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('not.be.visible');
      cy.get('[data-cy="echart"]').eq(CHANGE_MARKER_CHART).trigger('mouse', 'topRight').click();
    });
  });

  it('click away apart from chart should close tooltip', () => {
    cy.get('[data-cy="echart"]').eq(AVG_CPU_BASELINE_CHART).then(element => {
      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.get('mondrian-page').trigger('mousemove', 'topRight').click();
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('not.be.visible');

      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.get('[data-cy="context-filter-menu"]').dblclick();
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('not.be.visible');

      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.get('[data-cy="user-button"]').click();
      cy.get('[data-cy="user-button"]').type('{esc}');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('not.be.visible');

      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.get('[data-cy="bell-button"]').click();
      cy.get('[data-cy="header-close-button"]').click();
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('not.be.visible');
      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('be.visible');
      cy.get('[data-cy="uxSideMenuContainer"]').find('.ux-side-menu-toggle').click();
      cy.wrap(element).find('[data-cy="interactive-tooltip"]').should('not.be.visible');
      cy.get('[data-cy="uxSideMenuContainer"]').find('.ux-side-menu-toggle').click();
    });
  });
});

describe('Tooltip Event click', shared.defaultTestOptions, () => {
  before(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/echartTooltip*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/echartTooltip');
    cy.wait(['@getPage',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getData',
      '@getTOC']);
  });

  beforeEach(() => {
    cy.preserveSessionCookie();
  });

  it('overlay action can be triggered from sticky tooltip', () => {
    cy.get('[data-cy="echart"]').eq(CHANGE_MARKER_CHART).then(element => {
      cy.wrap(element).rightclick('center');
      cy.wrap(element).find('[id="tooltipOverlayChange"]').click();
      cy.url().should('include', 'uiTestPage');
    });
  });
});
