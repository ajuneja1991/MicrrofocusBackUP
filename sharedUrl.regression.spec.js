const shared = require('../../shared/shared');
const moment = require('moment');

describe('Test for Shared Url with _m', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestHasTimeCtx*`
    }).as('pageWithTimeContext');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestPage*`
    }).as('pageWithoutTimeContext');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgets*`
    }).as('pageTestWidgets');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
  });

  it('Launching with menu entry it should highlight it', () => {
    cy.visit('/uiTestHasTimeCtx?_m=widgetWithContext');
    cy.wait(['@pageWithTimeContext', '@getData', '@getTOC']);
    cy.get('button.ux-side-menu-toggle').click();
    cy.location().should(loc => {
      const locSearchParams = loc.search.split('?')[1].split('&');
      expect(locSearchParams.length).to.eq(6);
      expect(loc.search).to.include('_m');
      expect(loc.search).to.include('_ctx');
      expect(loc.search).to.include('tenant');
    });
    cy.get('[data-cy="navigation-menuEntry-widgetWithContext"] button').should('have.class', 'ux-side-menu-item-active');
    cy.get('[data-cy="navigation-category-T3"] button').first().should('not.have.class', 'ux-side-menu-item-active');
  });

  it('Url with _m should highlight the menu entry', () => {
    cy.visit('/uiTestHasTimeCtx?_m=widgetWithContext');
    cy.wait(['@pageWithTimeContext', '@getData', '@getTOC']);
    cy.get('.ux-side-menu-toggle').click();
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu').find('[aria-expanded="true"]');
    cy.get('ux-side-menu .sideNavSearch');
    cy.get('[data-cy="navigation-category-T2"] button').should('have.class', 'ux-side-menu-item-expanded');
    cy.get('[data-cy="thirdLevelItem-widgetWithContext"]').parent().parent().should('have.class', 'ux-side-menu-item-active');
    cy.get('[data-cy="navigation-category-T2"] button').first().should('not.have.class', 'ux-side-menu-item-active');
  });

  it('Changing time range will not remove _m', () => {
    cy.visit('/uiTestHasTimeCtx?_m=widgetWithContext');
    cy.wait(['@pageWithTimeContext', '@getData', '@getTOC']);
    cy.get('[data-cy="zoomIn"]').click();
    cy.wait('@getData');
    cy.location().should(loc => {
      const locSearchParams = loc.search.split('?')[1].split('&');
      expect(locSearchParams.length).to.eq(6);
      expect(loc.search).to.include('_m');
      expect(loc.search).to.include('_ctx');
      expect(loc.search).to.include('_s');
      expect(loc.search).to.include('_e');
      expect(loc.search).to.include('_tft');
      expect(loc.search).to.include('tenant');
    });
  });

  it('Non existing menu entry launches the page in the url', () => {
    cy.visit(`/uiTestHasTimeCtx?_m=NOTEXISTING`);
    cy.wait(['@getData', '@getTOC']);
    cy.get('[data-cy="loadgen.mambo.net"]');
    cy.location().should(loc => {
      expect(loc.search).to.not.include('_m');
      expect(loc.href).to.include('uiTestHasTimeCtx');
    });
  });

  it('should apply menu entry context and uses time-range from URL', () => {
    const start = shared.getDateTimeLocalized('12 Nov 2021 02:30:00 UTC');
    const end = shared.getDateTimeLocalized('14 Nov 2021 06:30:00 UTC');
    cy.log('Localized  timeframe: '.concat(start, '-', end));
    const url = `/uiTestHasTimeCtx?_m=widgetWithContext&_s=${start}&_e=${end}&_tft=A`;
    cy.visit(url);
    cy.visit(url);
    cy.wait(['@pageWithTimeContext', '@getData', '@getTOC']);
    cy.get('[data-cy="contextLabelType-Host"]').contains('loadgen.mambo.net');
    cy.get('[data-cy=timeSelectorStartDate]').contains(moment(parseInt(start, 10)).format('MM/DD/YYYY'));
    cy.get('[data-cy=timeSelectorStartTime]').contains(moment(parseInt(start, 10)).format('LTS'));
    cy.get('[data-cy=timeSelectorEndDate]').contains(moment(parseInt(end, 10)).format('MM/DD/YYYY'));
    cy.get('[data-cy=timeSelectorEndTime]').contains(moment(parseInt(end, 10)).format('LTS'));
  });

  it('Remove _m if context is changed', () => {
    cy.visit('/uiTestHasTimeCtx?_m=widgetWithContext');
    cy.wait(['@pageWithTimeContext', '@getData', '@getTOC']);
    cy.get('simple-list').contains('obac.mambo.net');
    cy.get('[data-cy="obac.mambo.net"]').click();
    cy.wait(['@getData']);
    cy.get('[data-cy="contextLabelType-Host"]').contains('obac.mambo.net');
    cy.location().should(loc => {
      const locSearchParams = loc.search.split('?')[1].split('&');
      expect(locSearchParams.length).to.eq(6);
      expect(loc.search).to.include('_m');
      expect(loc.search).to.include('_s');
      expect(loc.search).to.include('_e');
      expect(loc.search).to.include('_tft');
      expect(loc.search).to.include('_ctx');
      expect(loc.search).to.include('tenant');
    });
  });

  it('Loading page with _m and context, the context is ignored', () => {
    cy.visit(`/uiTestHasTimeCtx?_m=widgetWithContext&_ctx=~(~(type~%27host~id~%27obac.mambo.net~name~%27obac.mambo.net))&_s=1626266580000&_e=1626273780000&_tft=A`);
    cy.wait(['@getData', '@getTOC']);
    cy.get('simple-list').contains('loadgen.mambo.net');
  });

  it('Drilldown from no time context page to page with time context', () => {
    cy.visit('/uiTestPage?_ctx=~(~(type~%27host~id~%27oba.mambo.net~name~%27oba.mambo.net))');
    cy.wait(['@getData', '@pageWithoutTimeContext', '@getTOC']);
    cy.url().should('not.include', '_s');
    cy.url().should('not.include', '_e');
    cy.url().should('not.include', '_tft');
    cy.get('simple-list').contains('oba.mambo.net');
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('[data-cy="drilldown-uiTestLongPageName"]').click();
    cy.url().should('include', 'uiTestLongPageName');
    cy.url().should('include', '_s');
    cy.url().should('include', '_e');
    cy.url().should('include', '_tft');
  });

  it('Menu-entry with relative time should load correct time', () => {
    cy.visit('/uiTestHasTimeCtx?_m=lastHour');
    cy.wait(['@pageWithTimeContext', '@getData', '@getTOC']);
    cy.url().then($url => {
      const ONE_MIN = 60;
      const ONE_HOUR = 3600;
      const params = $url.split('?')[1].split('&').reduce((prev, curr) => {
        const param = curr.split('=');
        prev[param[0]] = param[1];
        return prev;
      }, {});
      // using value save in menu-entry for end time
      expect(Number(params._e)).not.to.equal(new Date('2022-04-20T07:39:41.920Z').getTime());
      const systemTimeDiff = new Date().getTime() - Number(params._e);
      // check if end time and system time diffrence is less than 1 min
      expect(systemTimeDiff / 1000).to.be.lessThan(ONE_MIN);
      // check if url has 1 hour time difference between start and end
      const timediff = Number(params._e) - Number(params._s);
      expect(timediff / 1000).to.equal(ONE_HOUR);
    });
  });

  after(() => {
    cy.bvdLogout();
  });
});
