const shared = require('../../../shared/shared');

describe('Side navigation filter on search', () => {
  beforeEach(() => {
    cy.intercept({ method: 'POST', path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data` }).as('getData');
    cy.intercept({ method: 'GET', path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*` }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestWidgets?_m=testWidgetsEntry');
    cy.wait(['@getPage', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getTOC']);
  });

  it('Search for a matching menu', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus').clear().type('Chart');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-category-T3"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="thirdLevelItem-testChartErrorsEntry"] > span').should('have.class', 'highlight');
    cy.get('[id^=thirdLevelItem_]').should('have.length', 9);
    cy.get('[id^=secondLevelItem_]').should('have.length', 3);
    cy.get('[id^=firstLevelItem_]').should('have.length', 1);
  });

  it('Search for a matching parent category', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus').clear().type('FullPages');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-category-T8"] button').should('have.attr', 'aria-expanded').and('eq', 'false');
    cy.get('[data-cy="secondLevelItem-T8"] > span').should('have.class', 'highlight');
    cy.get('[id^=firstLevelItem_]').should('have.length', 1);
    cy.get('[id^=secondLevelItem_]').should('have.length', 1);
  });

  it('Search for a matching grand parent category', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus').clear().type('Category without icon');
    cy.get('[data-cy="firstLevelItem-T6"] > span').should('have.class', 'highlight');
  });

  it('When search matches both a menu entry and its parent category', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus').clear().type('Widgets');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-category-T4"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[id="secondLevelItem_Widgets"] > span').should('have.class', 'highlight');
    cy.get('[id^=secondLevelItem_]').should('have.length', 2);
    cy.get('[id^=firstLevelItem_]').should('have.length', 1);
  });

  it('When search matches both a menu entry and its grand parent category', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    // Here search string 'Test' is included in 'Chart error test' which is a menu entry and 'UI Testing' grand parent category
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus').clear().type('Test');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-category-T3"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="thirdLevelItem-testChartErrorsEntry"]');
    cy.get('[data-cy="thirdLevelItem-testChartErrorsEntry"] > span').should('have.class', 'highlight');
    cy.get('[data-cy="firstLevelItem-T2"] > span').should('have.class', 'highlight');
  });

  it('When search matches both a parent category and its grand parent category', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus').clear().type('UI testing');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="secondLevelItem-T11"] > span').should('have.class', 'highlight');
    cy.get('[data-cy="firstLevelItem-T2"] > span').should('have.class', 'highlight');
  });

  it('When search matches menu entry, its parent category and its grand parent category', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus').clear().type('test');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-category-T11"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="thirdLevelItem-uitesting"] > span').should('have.class', 'highlight');
    cy.get('[data-cy="secondLevelItem-T11"] > span').should('have.class', 'highlight');
    cy.get('[data-cy="firstLevelItem-T2"] > span').should('have.class', 'highlight');
  });

  it('When there is no match found', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus').clear().type('xyz');
    cy.get('input[data-cy="sideNavigation-search-input"]').invoke('val').then(searchText => expect(searchText).to.eq('xyz'));
    cy.get('[data-cy="no-entries-found-message"]').should('contain', 'No menu entries found that contain');
    cy.get('div.ux-side-menu-item-content').should('have.length', 0);
    cy.get('[data-cy="sideNavigation-reset-search-button"]').click();
    cy.get('input[data-cy="sideNavigation-search-input"]').invoke('val').then(searchText => expect(searchText).to.eq(''));
  });

  after(() => {
    cy.bvdLogout();
    cy.bvdLogin();
  });
});

describe('Side navigation filter reset behaviour', () => {
  beforeEach(() => {
    cy.intercept({ method: 'POST', path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data` }).as('getData');
    cy.intercept({ method: 'GET', path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*` }).as('getPage');
    cy.intercept({ method: 'GET', path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/newPageSaved*` }).as('getNewPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestWidgets?_m=testWidgetsEntry');
    cy.wait(['@getPage', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getData', '@getTOC']);
  });

  it('Menu structure is same as before searching', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    // should open pages
    cy.get('[data-cy="secondLevelItem-T7"]').click();
    cy.get('[data-cy="navigation-category-T2"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-category-T7"] button').should('have.attr', 'aria-expanded').and('eq', 'true');

    // enter text to change menu
    cy.get('[data-cy="sideNavigation-search-input"]').type('Chart');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-category-T3"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="thirdLevelItem-testChartErrorsEntry"] > span').should('have.class', 'highlight');
    cy.get('[id^=thirdLevelItem_]').should('have.length', 9);
    cy.get('[id^=secondLevelItem_]').should('have.length', 3);
    cy.get('[id^=firstLevelItem_]').should('have.length', 1);
    // reset search --> old menu structure with pages should be open
    cy.get('[data-cy="sideNavigation-reset-search-button"]').click();
    cy.get('[data-cy="navigation-category-T2"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-category-T7"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-category-T3"] button').should('have.attr', 'aria-expanded').and('eq', 'false');

    // rerun the same steps again
    // enter text to change menu
    cy.get('[data-cy="sideNavigation-search-input"]').type('Chart');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-category-T3"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="thirdLevelItem-testChartErrorsEntry"] > span').should('have.class', 'highlight');
    cy.get('[id^=thirdLevelItem_]').should('have.length', 9);
    cy.get('[id^=secondLevelItem_]').should('have.length', 3);
    cy.get('[id^=firstLevelItem_]').should('have.length', 1);
    // reset search --> old menu structure with pages should be open
    cy.get('[data-cy="sideNavigation-reset-search-button"]').click();
    cy.get('[data-cy="navigation-category-T2"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-category-T7"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-category-T3"] button').should('have.attr', 'aria-expanded').and('eq', 'false');
  });

  it('Applying the search resets the search input', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="sideNavigation-search-input"]').type('Renderer');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-category-T3"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="thirdLevelItem-menuRenderer"] > span').should('have.class', 'highlight');
    cy.get('[id^=thirdLevelItem_]').should('have.length', 2);
    cy.get('[id^=secondLevelItem_]').should('have.length', 2);
    cy.get('[id^=firstLevelItem_]').should('have.length', 1);
    // select search result
    cy.intercept({ method: 'GET', path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*` }).as('getToc');
    cy.get('[data-cy="thirdLevelItem-menuRenderer"]').click();
    // search should be empty and highlighting gone
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.value', '');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-category-T3"] button').should('have.attr', 'aria-expanded').and('eq', 'true');
    cy.get('[data-cy="navigation-menuEntry-menuRenderer"] > button').should('have.class', 'ux-side-menu-item-active');
  });

  it('Selected menu entry should be in view from the search results', () => {
    cy.get('[data-cy="side-nav-search-button"]').click();
    cy.get('[data-cy="sideNavigation-search-input"]').should('have.focus').clear().type('chart');
    cy.get('[data-cy=navigation-menuEntry-testAllChartsEntry] > .ux-side-menu-item').click();
    cy.wait(['@getData', '@getTOC']);
    cy.get('[data-cy=navigation-menuEntry-testAllChartsEntry] > .ux-side-menu-item').should('be.visible');
    cy.get('[data-cy=navigation-menuEntry-testAllChartsEntry] > .ux-side-menu-item').should('have.class', 'ux-side-menu-item-active');
  });

  after(() => {
    shared.deletePages(['newPageSaved']);
  });
});
