// <reference types="Cypress" />
const shared = require('../../../shared/shared');

const clickOnSimpleListCheckbox = function(listId, item) {
  cy.get(`#${listId}`).find('simple-list').find(`[data-cy="${item}"]`).find('ux-checkbox')
    .invoke('show').click({ scrollBehavior: false });
  cy.wait(['@getPagesMetadata', '@getWebApiData']);
};

const urlWithManyContextItems = '/uiTestContextTypeLists?_ctx=~(~(type~\'host~id~\'loadgen.mambo.net~name~\'loadgen.mambo.net)' +
  '~(type~\'host~id~\'oba.mambo.net~name~\'oba.mambo.net)~(type~\'host~id~\'obac.mambo.net~name~\'obac.mambo.net)' +
  '~(type~\'testItem~id~\'BVD~name~\'BVD)~(type~\'testItem~id~\'OBA~name~\'OBA)~(type~\'testItem~id~\'OBM~name~\'OBM)' +
  '~(type~\'location~id~\'india~name~\'India)~(type~\'location~id~\'germany~name~\'Germany)~(type~\'location~id~\'america~name~\'America)' +
  '~(type~\'location~id~\'china~name~\'China)~(type~\'location~id~\'japan~name~\'Japan)~(type~\'location~id~\'uk~name~\'UK)' +
  '~(type~\'location~id~\'australia~name~\'Australia))';

describe('Context Types', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebApiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('getPagesData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
  });

  it('Suggest pages in drill-down must be based on selected context type ', () => {
    // 2 types of context list must be present in uiTestContextTypeLists page
    cy.visit('/uiTestContextTypeLists');
    cy.wait(['@getPagesData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getTOC']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('#hostList');
    cy.get('#projectList');
    // select context from host list
    cy.get('[data-cy="loadgen.mambo.net"]').click();
    cy.wait(['@getWebApiData', '@getWebApiData']);
    cy.get('#split-button-toggle').click();
    // uiTestProjectContext page must not be suggested as it is not activated for host context
    // uiTestTimeInterval page must be suggested as is of host context type
    cy.get('[data-cy="drilldown-uiTestProjectContext"]').should('not.exist');
    cy.get('[data-cy="drilldown-uiTestTimeInterval"]').click();
    cy.wait(['@getWebApiData', '@getPagesData']);
    cy.location('pathname').should('include', 'uiTestTimeInterval');
    // Navigate back to uiTestContextTypeLists to select different context type i.e project context list
    cy.get('[data-cy=breadcrumb-uiTestContextTypeLists]').click();
    // wait for simple list to be populated before clicking on the context
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData', '@getPagesData']);
    cy.get('[data-cy="loadgen.mambo.net"]');
    cy.get('.dashboard-widget-title-bar').first().click();
    cy.get('div.tooltip-inner').should('not.exist');
    cy.get('[data-cy="context-tag-Host"] button.tag-remove').click();
    cy.wait(['@getWebApiData', '@getWebApiData', '@getWebApiData']);
    cy.get('#projectList').click();
    cy.get('[data-cy="BVD"]').click();
    cy.wait(['@getWebApiData', '@getWebApiData']);
    cy.get('#split-button-toggle').click();
    // uiTestTimeInterval page must not be suggested as it is not activated for project context
    // uiTestProjectContext page must be suggested as is of projectList context type
    cy.get('[data-cy="drilldown-uiTestTimeInterval"]').should('not.exist');
    cy.get('[data-cy="drilldown-uiTestProjectContext"]').click();
    cy.get('[data-cy="mondrianModalDialogButton"]');
    cy.get('[data-cy="modal-title"]').contains('UNSAVED DEFINITION CHANGES');
    cy.get('[data-cy="mondrianModalDialogCancelButton"]');
    cy.get('[data-cy="mondrianModalDialogButton"]').click();
    cy.wait(['@getWebApiData']);
    cy.url().should('include', 'uiTestProjectContext');
  });

  it('If contexts are selected from 2 different context types, both context type related pages must be suggested', () => {
    cy.visit('/uiTestContextTypeLists');
    cy.wait(['@getPagesData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getTOC']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    // 2 types of context list must be present in uiTestContextTypeLists page
    cy.get('#hostList');
    cy.get('#projectList');
    // select context from both host and project context list
    cy.get('#hostList');
    cy.get('[data-cy="loadgen.mambo.net"]').click();
    cy.wait(['@getWebApiData', '@getWebApiData']);
    cy.get('#projectList').click();
    cy.get('[data-cy="BVD"]').click();
    cy.get('#split-button-toggle').click();
    // uiTestTimeInterval and uiTestProjectContext buth pages must be suggested as both the context are selected
    cy.get('[data-cy="drilldown-uiTestTimeInterval"]');
    cy.get('[data-cy="drilldown-uiTestProjectContext"]').click();
    cy.wait(['@getWebApiData']);
    cy.url().should('include', 'uiTestProjectContext');
  });

  it('long context names get truncated', () => {
    cy.visit('/uiTestContextTypeLists?_ctx=~(~(type~\'longContext~id~\'longContext~name~\'This_is_a_very_long_context_item_name))');
    cy.wait(['@getPagesData', '@getWebApiData', '@getWebApiData', '@getWebApiData', '@getTOC']);
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    cy.get('[data-cy="contextLabelType-LongContext"]').invoke('text').then(text => {
      expect(text.length).to.be.below(36);
    });
  });
});

describe('Context Omnibar responsivity', () => {
  beforeEach(() => {
    cy.bvdLogin();
    cy.viewport(1000, 800);
    cy.visit('/uiTestContextTypeLists?_ctx=~(~(type~\'host~id~\'loadgen.mambo.net~name~\'loadgen.mambo.net)' +
      '~(type~\'host~id~\'oba.mambo.net~name~\'oba.mambo.net)~(type~\'host~id~\'obac.mambo.net~name~\'obac.mambo.net)' +
      '~(type~\'testItem~id~\'BVD~name~\'BVD)~(type~\'testItem~id~\'OBA~name~\'OBA)~(type~\'testItem~id~\'OBM~name~\'OBM)' +
      '~(type~\'location~id~\'india~name~\'India)~(type~\'location~id~\'germany~name~\'Germany)~(type~\'location~id~\'america~name~\'America)' +
      '~(type~\'location~id~\'china~name~\'China)~(type~\'longContext~id~\'itemA~name~\'This_is_a_very_long_context_item_name)' +
      '~(type~\'longContext~id~\'itemB~name~\'This_is_another_long_context_item_name))');
  });

  it('Context items and context filter stay in one row', () => {
    cy.get('.context-item-container').then(contextItem => {
      cy.get('#context-filter-button').then(contextFilter => {
        expect(Math.floor(contextItem[0].getBoundingClientRect().y - 1)).to.equal(contextFilter[0].getBoundingClientRect().y);
      });
    });
  });

  it('scroll-right button is clickable', () => {
    cy.get('[data-cy="scrollContextItemsRight"]').click();
  });

  it('scroll-right button scrolls right', () => {
    cy.get('.context-item-container').then(el => {
      const initialX = el[0].getBoundingClientRect().x;
      cy.get('[data-cy="scrollContextItemsRight"]').click();
      cy.get('.context-item-container').then(el1 => {
        expect(initialX).to.not.equal(el1[0].getBoundingClientRect().x);
      });
    });
  });

  it('scroll-left button is not visible if not scrolled right', () => {
    cy.get('[data-cy="scrollContextItemsLeft"]').should('not.exist');
  });

  it('scroll-left button is clickable after scrolling right', () => {
    cy.get('[data-cy="scrollContextItemsRight"]').click();
    cy.get('[data-cy="scrollContextItemsLeft"]').click();
  });

  it('context items can be scrolled via mousewheel', () => {
    cy.get('.context-item-container').then(el => {
      const initialX = el[0].getBoundingClientRect().x;
      cy.get('[data-cy="context-items"]').trigger('wheel', { deltaY: 100 });
      cy.get('.context-item-container').then(el1 => {
        expect(initialX).to.equal(el1[0].getBoundingClientRect().x + 100);
      });
    });
  });

  it('context items can be scrolled via touch', () => {
    cy.get('.context-item-container').then(el => {
      const initialX = el[0].getBoundingClientRect().x;
      cy.get('[data-cy="context-items"]').trigger('touchmove', { changedTouches: [{ identifier: 1, pageX: 100 }]});
      cy.get('[data-cy="context-items"]').trigger('touchmove', { changedTouches: [{ identifier: 1, pageX: 0 }]});
      cy.get('.context-item-container').then(el1 => {
        expect(initialX).to.equal(el1[0].getBoundingClientRect().x + 100);
      });
    });
  });

  it('scroll-right button disappears when fully scrolled to the right', () => {
    cy.get('[data-cy="context-items"]').trigger('touchmove', { changedTouches: [{ identifier: 1, pageX: 10000 }]});
    cy.get('[data-cy="context-items"]').trigger('touchmove', { changedTouches: [{ identifier: 1, pageX: 0 }]});
    cy.get('[data-cy="scrollContextItemsRight"]').should('not.exist');
  });

  afterEach(() => {
    cy.viewport(1400, 800);
  });
});

describe('Context Grouping', () => {
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
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.viewport(800, 800);
  });

  it('Context gets grouped if not enough space', () => {
    cy.visit(urlWithManyContextItems);
    cy.wait(['@getPagesMetadata', '@getWebApiData', '@getTOC']);
    cy.get('[data-cy="contextLabelType-Host"]');
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net, oba.mambo.net, obac.mambo.net');
    cy.get('[data-cy="contextLabelType-Item"]');
    cy.get('[data-cy="contextLabelType-Location"]');
  });

  it('if many context items of one type are selected only the amount of selected items is shown', () => {
    cy.visit(urlWithManyContextItems);
    cy.wait(['@getPagesMetadata', '@getWebApiData', '@getTOC']);
    cy.get('[data-cy="contextLabelType-Location"]').contains('7 selected');
    cy.get('[data-cy="contextLabelType-Location"]')
      .trigger('mouseenter')
      .should('have.attr', 'aria-describedby')
      .and('match', /ux-tooltip-/);
  });

  it('long grouped context labels get truncated ', () => {
    cy.visit('/uiTestContextTypeLists?_ctx=~(~(type~\'longContext~id~\'itemA~name~\'This_is_a_very_long_context_item_name)' +
      '~(type~\'longContext~id~\'itemB~name~\'This_is_another_long_context_item_name)~(type~\'host~id~\'loadgen.mambo.net~name~\'loadgen.mambo.net)' +
      '~(type~\'host~id~\'oba.mambo.net~name~\'oba.mambo.net)~(type~\'host~id~\'obac.mambo.net~name~\'obac.mambo.net))');
    cy.wait(['@getPagesMetadata', '@getWebApiData', '@getTOC']);
    cy.get('[data-cy="contextLabelType-LongContext"]').invoke('text').then(text => {
      expect(text.length).to.be.below(61);
    });
  });

  it('if contexts are grouped and user adds/removes context it should remain grouped', () => {
    cy.visit('/uiTestContextTypeLists?_ctx=~(~(type~\'host~id~\'loadgen.mambo.net~name~\'loadgen.mambo.net)' +
      '~(type~\'testItem~id~\'BVD~name~\'BVD)~(type~\'testItem~id~\'OBA~name~\'OBA)~(type~\'testItem~id~\'OBM~name~\'OBM)' +
      '~(type~\'location~id~\'india~name~\'India))');
    cy.wait(['@getPagesMetadata', '@getWebApiData', '@getTOC']);
    clickOnSimpleListCheckbox('hostList', 'oba.mambo.net');
    cy.get('[data-cy="contextLabelType-Host"]');
    clickOnSimpleListCheckbox('hostList', 'obac.mambo.net');
    cy.get('[data-cy="contextLabelType-Host"]');
    clickOnSimpleListCheckbox('hostList', 'obac.mambo.net');
    cy.get('[data-cy="contextLabelType-Host"]');
  });

  afterEach(() => {
    cy.viewport(1400, 800);
  });
});

describe('No predefined time set', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/metricBrowserDemo*`
    }).as('getMetricBrowserPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestPage*`
    }).as('getUiTestPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/legendAction*`
    }).as('legendActionTestPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
  });

  it('Should check page loaded via url must have 2 hours time difference', () => {
    cy.visit('/metricBrowserDemo');
    cy.wait(['@getMetricBrowserPage', '@getTOC']);
    cy.url().then($url => {
      const parsedURL = new URL($url);
      const startTime = parsedURL.searchParams.get('_s');
      const endTime = parsedURL.searchParams.get('_e');
      const ONE_HOUR_IN_MS = 1000 * 60 * 60;
      const timeDiffInHour = (endTime - startTime) / ONE_HOUR_IN_MS;
      expect(timeDiffInHour).to.equal(2);
    });
  });

  it('Should check if no time context is set in menu entry the page should load with 2 hours time difference', () => {
    cy.visit('/uiTestPage');
    cy.wait(['@getUiTestPage', '@getTOC']);
    cy.get('.ux-side-menu-toggle').click();
    cy.get('[data-cy="navigation-category-T2"] > .ux-side-menu-item').click();
    cy.get('[data-cy="sideNavigation-search-input"]').click().type('metric browser demo');
    cy.get('[data-cy="navigation-menuEntry-metricBrowserDemoEntry"]').click();
    cy.wait(['@getMetricBrowserPage']);
    cy.get('[data-cy=context-filter-menu]').contains('LAST: 2 Hours');
  });

  it('Should check default context from page is set if menu entry does not have context', () => {
    cy.visit('/');
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="sideNavigation-search-input"]').type('Actions on legends-No Context');
    cy.get('[data-cy="navigation-category-T7"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-menuEntry-actionOnLegendsNoContext"]').click();
    cy.wait(['@legendActionTestPage', '@getTOC']);
    cy.location().should(loc => {
      expect(loc.search).contains('_s=1619807400000');
      expect(loc.search).contains('_e=1622485740000');
      expect(loc.search).contains('&_tft=A');
    });
  });
});
