// <reference types="Cypress" />
const shared = require('../../../../shared/shared');

describe('Infinite Data table', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestInfiniteScrolling*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebApiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestInfiniteScrolling');
    cy.wait(['@getPage', '@getWebApiData', '@getTOC']);
  });

  it('Data table  with editable field , Search input & pagination test', () => {
    cy.get('[data-cy=widget-title]').contains('Data Table with backend Pagination');
    cy.get('[data-cy=action-button] > .qtm-font-icon').click();
    cy.get('[data-cy=action-button-edit]').click();
    cy.get('[data-cy=widgetNameInput]').clear().type('Updated name');
    cy.get('[data-cy=cancel-button]').click();
    cy.get('[data-cy=widget-title]').should('have.text', 'Updated name');
    cy.get('[data-cy=undefined-data-table-search-input]').should('have.attr', 'placeholder', 'Search');
    cy.get('[data-cy=undefined-data-table-search-input]').clear().type('xyz');
    cy.get('[data-cy=undefined-data-table-reset-search-button] > .qtm-font-icon').click();
    cy.get('[data-cy=undefined-data-table-search-input]').clear();
    cy.get('[data-cy=undefined-data-table-search-input]').clear().type('xyz');
    cy.get('.alert-content').find('.notification-text');
    cy.contains('No data');

    cy.get('[data-cy=action-button] > .qtm-font-icon').click();
    cy.get('[data-cy=action-button-refreshWidget]').click();
    cy.wait('@getWebApiData').then(intercept => {
      const { statusCode, body } = intercept.response;
      expect(statusCode).to.eq(200);
      cy.log(body.total);
    });
    cy.get('.ag-body-viewport').scrollTo('bottom');
    cy.wait('@getWebApiData').then(intercept => {
      const { statusCode, body } = intercept.response;

      expect(statusCode).to.eq(200);
      const maxRecordToBeLoad = 57;
      const checkNumberOfScroll = 2;
      for (let i = 1; i < checkNumberOfScroll; i++) {
        if (i < checkNumberOfScroll) {
          expect(body.data.length).to.eq(maxRecordToBeLoad);
          cy.get('.ag-body-viewport').scrollTo('bottom');
          cy.get('@getWebApiData').then(xhr => {
            const endPos = xhr.request.body.params.end_pos;
            const startPos = xhr.request.body.params.start_pos;
            expect(Number(endPos)).to.be.greaterThan(Number(startPos));
          });
          cy.wait('@getWebApiData');
        }
      }
    });
  });

  it('Table column Sort by column name and also with all ', () => {
    cy.get('.ag-header-cell-label').eq(0).find('span.ag-header-cell-text').should('include.text', 'ID');
    cy.get('.ag-header-cell-label').eq(1).find('span.ag-header-cell-text').should('include.text', 'Name');
    cy.get('.ag-header-cell-label').eq(2).find('span.ag-header-cell-text').should('include.text', 'Email');
    cy.get('.ag-header-cell-label').eq(3).find('span.ag-header-cell-text').should('include.text', 'Domain Name');
    cy.get('.ag-header-cell-label').eq(4).find('span.ag-header-cell-text').should('include.text', 'Formatted date');

    cy.get('[data-cy=action-button] > .qtm-font-icon').click();
    cy.get('[data-cy=action-button-refreshWidget]').click();
    cy.wait('@getWebApiData').then(intercept => {
      const { statusCode, body } = intercept.response;
      expect(statusCode).to.eq(200);
      const maxRecordToBeLoad = 57;
      expect(body.data.length).to.eq(maxRecordToBeLoad);
      const LastRow = body.total;
      const tableColumn = ['ID', 'Name', 'Email'];
      tableColumn.forEach(colName => {
        if (colName === 'ID') {
          cy.contains('.ag-header-cell-label', colName).click();
          cy.contains('.ag-header-cell-label', colName).find('[ref=eSortAsc]').should('be.visible');
          cy.get('.ag-row-first').should('contain.text', '1');
          cy.contains('.ag-header-cell-label', colName).click();
          cy.contains('.ag-header-cell-label', colName).find('[ref=eSortDesc]').should('be.visible');
          cy.get('.ag-row-first > .ag-right-aligned-cell').should('contain.text', LastRow);
          cy.contains('.ag-header-cell-label', colName).click();
          cy.contains('.ag-header-cell-label', colName).find('[ref=eSortNone]').should('not.visible');
        }

        if (colName === 'Name') {
          cy.contains('.ag-header-cell-label', colName).click();
          cy.contains('.ag-header-cell-label', colName).find('[ref=eSortAsc]').should('be.visible');
          cy.get('.ag-row-first > [aria-colindex="2"]').should('contain.text', 'Aaron');
          cy.contains('.ag-header-cell-label', colName).click();
          cy.contains('.ag-header-cell-label', colName).find('[ref=eSortDesc]').should('be.visible');
          cy.get('.ag-row-first > [aria-colindex="2"]').should('contain.text', 'Zachary');
          cy.contains('.ag-header-cell-label', colName).click();
          cy.contains('.ag-header-cell-label', colName).find('[ref=eSortNone]').should('not.visible');
        }
        if (colName === 'Email') {
          cy.contains('.ag-header-cell-label', colName).click();
          cy.contains('.ag-header-cell-label', colName).find('[ref=eSortAsc]').should('be.visible');
          cy.get('.ag-row-first > [aria-colindex="3"]').should('contain.text', 'ab@');
          cy.contains('.ag-header-cell-label', colName).click();
          cy.contains('.ag-header-cell-label', colName).find('[ref=eSortDesc]').should('be.visible');
          cy.get('.ag-row-first > [aria-colindex="3"]').should('contain.text', 'zuzvaz@zewjicpil.cl');
          cy.contains('.ag-header-cell-label', colName).click();
          cy.contains('.ag-header-cell-label', colName).find('[ref=eSortNone]').should('not.visible');
        }
        if (colName === 'Domain Name') {
          cy.contains('.ag-header-cell-label', colName).click();
          cy.contains('.ag-header-cell-label', colName).find('[ref=eSortAsc]').should('be.visible');
          cy.get('.ag-row-first > [aria-colindex="4"]').should('contain.text', 'av.af');
          cy.contains('.ag-header-cell-label', colName).click();
          cy.contains('.ag-header-cell-label', colName).find('[ref=eSortDesc]').should('be.visible');
          cy.get('.ag-row-first > [aria-colindex="4"]').should('contain.text', 'z');
          cy.contains('.ag-header-cell-label', colName).click();
          cy.contains('.ag-header-cell-label', colName).find('[ref=eSortNone]').should('not.visible');
        }
      });
    });
  });

  it('Data table Search', () => {
    cy.get('[data-cy=undefined-data-table-search-input]').clear().type('Devin Hamilton');
    cy.get('.ag-row-first').should('contain.text', 'Devin Hamilton');
    cy.get('#ux-select-1-input').click();
    cy.get('#ux-select-1-typeahead-option-1').click();
    cy.get('[data-cy=undefined-data-table-search-input]').clear().type('55');
    cy.get('.ag-row-first > [aria-colindex="1"]').should('contain.text', '55');
    cy.get('[data-cy=undefined-data-table-search-input]').clear();
    cy.get('#ux-select-1-input').click();
    cy.get('#ux-select-1-typeahead-option-2').click();
    cy.get('[data-cy=undefined-data-table-search-input]').clear().type('Devin Hamilton');
    cy.get('.ag-row-first > [aria-colindex="2"]').should('contain.text', 'Devin Hamilton');
    cy.get('[data-cy=undefined-data-table-search-input]').clear();
    cy.get('#ux-select-1-input').click();
    cy.get('#ux-select-1-typeahead-option-3').click();
    cy.get('[data-cy=undefined-data-table-search-input]').clear().type('ibaigo@ka.my');
    cy.get('.ag-row-first > [aria-colindex="3"]').should('contain.text', 'ibaigo@ka.my');
    cy.get('[data-cy=undefined-data-table-search-input]').clear();
    cy.get('#ux-select-1-input').click();
    cy.get('#ux-select-1-typeahead-option-4').click();
    cy.get('[data-cy=undefined-data-table-search-input]').clear().type('pip.tz');
    cy.get('.ag-row-first > [aria-colindex="4"]').should('contain.text', 'pip.tz');
    cy.get('[data-cy=undefined-data-table-search-input]').clear();
    cy.get('#ux-select-1-input').click();
    cy.get('#ux-select-1-typeahead-option-0').click();
    cy.get('[data-cy=undefined-data-table-search-input]').clear().type('Aaron');
    cy.get('.ag-row-first').should('contain.text', 'Aaron');
    cy.contains('.ag-header-cell-label', 'Name').click();
    cy.contains('.ag-header-cell-label', 'Name').find('[ref=eSortAsc]').should('be.visible');
    cy.get('.ag-body-viewport').scrollTo('bottom');
    cy.wait('@getWebApiData').then(intercept => {
      const { statusCode, body } = intercept.response;
      expect(statusCode).to.eq(200);
      expect(body.data.length).to.eq(body.data.length);
    });
    for (let i = 1; i < 5; i++) {
      cy.get('.ag-body-viewport').scrollTo('bottom');
    }
    cy.contains('No data').should('not.exist');
  });
});
