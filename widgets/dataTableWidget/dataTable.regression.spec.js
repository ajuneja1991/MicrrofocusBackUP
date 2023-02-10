// <reference types="Cypress" />
const shared = require('../../../../shared/shared');
const path = require('path');
let stub;

describe('Table check, sort and filter', shared.defaultTestOptions, () => {
  before(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgetsDataTableWidget*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    stub = cy.stub();
    cy.on('window:alert', stub);
    cy.visit('/uiTestWidgetsDataTableWidget');
    cy.wait(['@getPage', '@getWebapiData', '@getTOC']);
  });

  function testLabelRender(length) {
    cy.get('#dataTablePartlyNoSorting ag-grid-angular .ag-center-cols-container').children().should('have.length', 5);
    cy.get('[data-cy="dataTablePartlyNoSorting-data-table-search-input"]').type('server off');
    cy.get('#dataTablePartlyNoSorting ag-grid-angular').within(() => {
      cy.get('.ag-center-cols-container').children().should('have.length', length);
    });
    cy.get('[data-cy="dataTablePartlyNoSorting-data-table-search-input"]').clear();
    cy.get('#dataTablePartlyNoSorting ag-grid-angular .ag-center-cols-container').children().should('have.length', 5);
    cy.get('[data-cy="dataTablePartlyNoSorting-data-table-search-input"]').type('cluster Id');
    cy.get('#dataTablePartlyNoSorting ag-grid-angular').within(() => {
      cy.get('.ag-center-cols-container').children().should('have.length', 2);
      cy.get('[row-id="0"]');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]');
    });
    cy.get('[data-cy="dataTablePartlyNoSorting-data-table-search-input"]').clear();
    // test for overflown text in label renderer
    cy.get('#dataTablePartlyNoSorting ag-grid-angular .ag-center-cols-container').children().should('have.length', 5);
    cy.get('[data-cy="dataTablePartlyNoSorting-data-table-search-input"]').type('Test');
    cy.get('#dataTablePartlyNoSorting ag-grid-angular').within(() => {
      cy.get('.ag-center-cols-container').children().should('have.length', 1);
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').should('not.exist');
    });
    cy.get('[data-cy="dataTablePartlyNoSorting-data-table-search-input"]').clear();
  }

  it('DataTable widget exist', () => {
    cy.contains('Data Table');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('.ag-header-row [col-id="title"]').find('span.ag-header-cell-text').invoke('text').then(text => {
        expect(text).to.equal('Title');
      });
      cy.get('.ag-header-row [col-id="severity"]').find('span.ag-header-cell-text').invoke('text').then(text => {
        expect(text).to.equal('Severity');
      });
    });
  });

  it('DataTable widget has entries', () => {
    cy.get('#dataTable ag-grid-angular').contains('Auto Upload of content finished.');
  });

  it('DataTable widget has column resizer', () => {
    cy.get('.ag-header-row [col-id="title"]').find('.ag-header-cell-resize');
  });

  it('should not sort if disabled', () => {
    cy.get('#dataTablePartlyNoSorting ag-grid-angular').within(() => {
      cy.get('[row-index="0"] [col-id="severity"]').contains('Normal');
      cy.get('[row-index="1"] [col-id="severity"]').contains('Normal');
      cy.get('[row-index="2"] [col-id="severity"]').contains('Critical');
      cy.get('[row-index="3"] [col-id="severity"]').contains('Minor');
      cy.get('[row-index="4"] [col-id="severity"]').contains('Normal');
      cy.get('.ag-header-row [col-id="severity"] .ag-header-cell-label').click();
      cy.get('.ag-header-row [col-id="severity"] span.ag-sort-ascending-icon').should('not.exist');
      cy.get('.ag-header-row [col-id="severity"] span.ag-sort-descending-icon').should('not.exist');
      cy.get('[row-index="0"] [col-id="severity"]').contains('Normal');
      cy.get('[row-index="1"] [col-id="severity"]').contains('Normal');
      cy.get('[row-index="2"] [col-id="severity"]').contains('Critical');
      cy.get('[row-index="3"] [col-id="severity"]').contains('Minor');
      cy.get('[row-index="4"] [col-id="severity"]').contains('Normal');
    });
  });

  it('should show a tooltip on header hover', () => {
    cy.get('#dataTable .ag-header-row').find('[col-id="title"]').trigger('mouseenter');
    cy.get('[data-cy=data-table-tooltip]').should('have.text', ' Title ');
  });

  it('should sort rows asc and desc', () => {
    cy.get('#dataTablePartlyNoSorting ag-grid-angular').within(() => {
      cy.get('.ag-header-row [col-id="title"] span.ag-sort-ascending-icon').should('not.be.visible');
      cy.get('.ag-header-row [col-id="title"] span.ag-sort-descending-icon').should('not.be.visible');
      cy.log('No sorting:');
      cy.get('[row-index="0"] [col-id="title"]').contains('Auto Upload');
      cy.get('[row-index="1"] [col-id="title"]').contains('Process');
      cy.get('[row-index="2"] [col-id="title"]').contains('OMi server');
      cy.get('[row-index="3"] [col-id="title"]').contains('JVM Heap Utilization');
      cy.get('[row-index="4"] [col-id="title"]').contains('IPsec');
      cy.get('.ag-header-row [col-id="title"] .ag-header-cell-label').click();
      cy.get('.ag-header-row [col-id="title"] span.ag-sort-ascending-icon').should('be.visible');
      cy.log('ASC sorted:');
      cy.get('[row-index="0"] [col-id="title"]').contains('IPsec'); // This title here starts with a special character and hence appears first
      cy.get('[row-index="1"] [col-id="title"]').contains('Auto Upload');
      cy.get('[row-index="2"] [col-id="title"]').contains('JVM Heap Utilization');
      cy.get('[row-index="3"] [col-id="title"]').contains('OMi server');
      cy.get('[row-index="4"] [col-id="title"]').contains('Process');
      cy.get('.ag-header-row [col-id="title"] .ag-header-cell-label').click();
      cy.get('.ag-header-row [col-id="title"] span.ag-sort-descending-icon').should('be.visible');
      cy.log('DESC sorted:');
      cy.get('[row-index="0"] [col-id="title"]').contains('Process');
      cy.get('[row-index="1"] [col-id="title"]').contains('OMi server');
      cy.get('[row-index="2"] [col-id="title"]').contains('JVM Heap Utilization');
      cy.get('[row-index="3"] [col-id="title"]').contains('Auto Upload');
      cy.get('[row-index="4"] [col-id="title"]').contains('IPsec');
      cy.get('.ag-header-row [col-id="severity"] .ag-header-cell-label').click();
      cy.get('.ag-header-row [col-id="severity"] span.ag-sort-ascending-icon').should('not.exist');
      cy.get('.ag-header-row [col-id="severity"] span.ag-sort-descending-icon').should('not.exist');
    });
  });

  it('should show a tooltip on cell hover', () => {
    cy.get('#dataTable ag-grid-angular [row-id="1"]').find('[col-id="title"]').trigger('mouseenter').trigger('mouseleave');
    cy.get('#dataTable ag-grid-angular [row-id="2"]').find('[col-id="title"]').trigger('mouseenter');
    cy.get('[data-cy=data-table-tooltip]').should('have.text', ' OMi server component bus stopped ');
  });

  it('input filter with text auto --> 1 Element', () => {
    cy.get('[data-cy="dataTable-data-table-search-input"]').type('auto');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').should('not.exist');
    });
  });

  it('input filter with text NORMAL --> 2 Elements', () => {
    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}NORMAL');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="1"]').contains('Process');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').contains('IPsec');
    });
  });

  it('input filter with text friday --> nothing', () => {
    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}Friday');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').should('not.exist');
    });
  });

  it('input filter with text and reset it --> all', () => {
    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}stArted');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]').contains('Process');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').contains('IPsec');
    });
    cy.get('[data-cy="dataTable-data-table-reset-search-button"]').click();
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="1"]').contains('Process');
      cy.get('[row-id="2"]').contains('OMi server');
      cy.get('[row-id="3"]').contains('JVM');
      cy.get('[row-id="4"]').contains('IPsec');
    });
  });

  it('input filter with text having space between words', () => {
    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}auto upload');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').should('not.exist');
    });
    cy.get('[data-cy="dataTable-data-table-reset-search-button"]').click();

    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}autoupload');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').should('not.exist');
    });
    cy.get('[data-cy="dataTable-data-table-reset-search-button"]').click();

    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}auto nanny');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').should('not.exist');
    });
    cy.get('[data-cy="dataTable-data-table-reset-search-button"]').click();

    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}.exe z');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]');
      cy.get('[row-id="4"]');
    });
  });

  it('input filter with text containing leading and trailing spaces', () => {
    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}   ');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="1"]').contains('Process');
      cy.get('[row-id="2"]').contains('OMi server');
      cy.get('[row-id="3"]').contains('JVM Heap Utilization');
      cy.get('[row-id="4"]').contains('IPsec');
    });
    cy.get('[data-cy="dataTable-data-table-reset-search-button"]').click();

    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}  naNny');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]').contains('Process nanny');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').should('not.exist');
    });
    cy.get('[data-cy="dataTable-data-table-reset-search-button"]').click();

    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}oMI      ');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').contains('OMi server');
      cy.get('[row-id="3"]').contains('OMi JVM Heap Utilization');
      cy.get('[row-id="4"]').should('not.exist');
    });
    cy.get('[data-cy="dataTable-data-table-reset-search-button"]').click();

    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}   compo      ');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').contains('OMi server');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').should('not.exist');
    });
  });

  it('input filter with text containing special characters', () => {
    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}%');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').contains('JVM Heap Utilization');
      cy.get('[row-id="4"]').should('not.exist');
    });
    cy.get('[data-cy="dataTable-data-table-reset-search-button"]').click();

    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}. [');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="1"]').contains('Process');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').contains('JVM Heap Utilization');
      cy.get('[row-id="4"]').contains('IPsec');
    });
    cy.get('[data-cy="dataTable-data-table-reset-search-button"]').click();

    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}.');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="1"]').contains('Process');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').contains('JVM Heap Utilization');
      cy.get('[row-id="4"]').contains('IPsec');
    });
    cy.get('[data-cy="dataTable-data-table-reset-search-button"]').click();

    cy.get('[data-cy="dataTable-data-table-search-input"]').type(`{selectall}{backspace}' failed`);
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').contains('IPsec');
    });
  });

  it('input filter with numerals', () => {
    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}8');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').contains('IPsec');
    });
  });

  it('Check table search for XSS vulnerability', () => {
    cy.get('[data-cy="dataTable-data-table-search-input"]').type(`<script>alert('hello')</script>`).then(() => {
      Cypress.sinon.assert.notCalled(stub);
    });
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').should('not.exist');
    });
  });

  it('check search button focus and component inputs and esc button', () => {
    cy.get('[data-cy="dataTable-data-table-search-input"]').type(`{selectall}{backspace}`);
    cy.get('[data-cy="dataTable-data-table-search-input"]').should('have.attr', 'placeholder', 'Search');
    cy.get('[data-cy="dataTable-data-table-search-button"]').click();
    cy.get('[data-cy="dataTable-data-table-search-input"]').should('have.focus').type('auto');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').should('not.exist');
    });
    cy.get('[data-cy="dataTable-data-table-search-input"]').should('have.focus').type('{esc}');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="1"]').contains('Process');
      cy.get('[row-id="2"]').contains('OMi server');
      cy.get('[row-id="3"]').contains('JVM Heap Utilization');
      cy.get('[row-id="4"]').contains('IPsec');
    });
  });

  it('check column option --> 5 Elements', () => {
    cy.get('[data-cy="dataTable-search-column-dropdown"]').click();
    cy.get('#ux-select-1-typeahead-option-0').contains('All');
    cy.get('#ux-select-1-typeahead-option-1').contains('Title');
    cy.get('#ux-select-1-typeahead-option-2').contains('Severity');
    cy.get('#ux-select-1-typeahead-option-3').contains('Crosslaunch Action');
    cy.get('#ux-select-1-typeahead-option-4').contains('Drilldown without context');
  });

  it('check column option title and type auto --> 1 Elements', () => {
    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}');
    cy.get('[data-cy="dataTable-search-column-dropdown"]').click();
    cy.get('#ux-select-1-typeahead-option-1').contains('Title').click({ scrollBehavior: false });
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="1"]').contains('Process');
      cy.get('[row-id="2"]').contains('OMi server');
      cy.get('[row-id="3"]').contains('JVM');
      cy.get('[row-id="4"]').contains('IPsec');
    });
    cy.get('[data-cy="dataTable-data-table-search-input"]').type('auto');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="1"]').contains('Process');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').should('not.exist');
    });
  });

  it('check column option drilldown on zero and type 8 --> 1 Element', () => {
    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}');
    cy.get('[data-cy="dataTable-search-column-dropdown"]').click();
    cy.get('#ux-select-1-typeahead-option-5').contains('Drilldown on zero value').click({ scrollBehavior: false });
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('0');
      cy.get('[row-id="1"]').contains('0');
      cy.get('[row-id="4"]').contains('8');
    });
    cy.get('[data-cy="dataTable-data-table-search-input"]').type('8');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').contains('IPsec');
    });
  });

  it('check column option Severity and type auto --> 0 Elements', () => {
    cy.get('[data-cy="dataTable-data-table-search-input"]').type('{selectall}{backspace}');
    cy.get('[data-cy="dataTable-search-column-dropdown"]').click();
    cy.get('#ux-select-1-typeahead-option-2').contains('Severity').click({ scrollBehavior: false });
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="1"]').contains('Process');
      cy.get('[row-id="2"]').contains('OMi server');
      cy.get('[row-id="3"]').contains('JVM');
    });
    cy.get('[data-cy="dataTable-data-table-search-input"]').type('auto');
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').should('not.exist');
      cy.get('[row-id="1"]').should('not.exist');
      cy.get('[row-id="2"]').should('not.exist');
      cy.get('[row-id="3"]').should('not.exist');
      cy.get('[row-id="4"]').should('not.exist');
    });
  });

  it('check different selection types (single [default] and multiple select)', () => {
    cy.get('[data-cy="dataTable-data-table-search-input"]').type(`{selectall}{backspace}`);
    cy.get('#dataTable ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').find('.ag-selection-checkbox');
    });
    cy.get('#dataTablePartlyNoSorting ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="0"] .ag-selection-checkbox').should('not.exist');
      cy.get('.ag-row-first > [aria-colindex="1"]').click();
      cy.get('.ag-row-first').should('have.class', 'ag-row-selected');
    });
    cy.get('#dataTableDefaultSelect ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="0"] .ag-selection-checkbox').should('not.exist');
      cy.get('.ag-row-first > [aria-colindex="1"]').click();
      cy.get('.ag-row-first').should('have.class', 'ag-row-selected');
    });
  });

  it('check different selection types (no select)', () => {
    cy.get('#dataTableNoSelect ag-grid-angular').within(() => {
      cy.get('[row-id="0"]').contains('Auto Upload');
      cy.get('[row-id="0"] .ag-selection-checkbox').should('not.exist');
      cy.get('.ag-row-first > [aria-colindex="1"]').click();
      cy.get('.ag-row-first').should('not.have.class', 'ag-row-selected');
    });
  });

  it('should check filtering in tag cell -> All', () => {
    testLabelRender(3);
  });

  it('should check filtering in tag cell -> Label Renderer ', () => {
    cy.get('[data-cy="dataTablePartlyNoSorting-search-column-dropdown"]').click();
    cy.get('#ux-select-2-typeahead-option-3').contains('Label renderer').click();
    testLabelRender(2);
  });
});
describe('DataTable context tests', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgetsDataTableWidget*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestWidgetsDataTableWidget');
    cy.wait(['@getPage', '@getWebapiData', '@getTOC']);
  });

  it('should execute the setContext action on row click', () => {
    cy.get('#dataTable ag-grid-angular [row-id="1"]').find('[col-id="severity"]').click();
    cy.wait(['@getWebapiData']);
    cy.url().should('include', 'id~%272')
      .should('include', 'name~%27Process*20nannyManager.exe*20started')
      .should('include', 'type~%27event');
  });
});

describe('DataTable Cell Rendering', shared.defaultTestOptions, () => {
  before(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgetsDataTableWidget*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('getWebapiData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestWidgetsDataTableWidget');
    cy.wait(['@getPage', '@getWebapiData', '@getTOC']);
  });

  it('Show icon with label', () => {
    cy.get('#dataTable ag-grid-angular [row-id="1"]').find('[col-id="severity"]').within(() => {
      cy.get('icon-label-component i').should('have.class', 'qtm-icon-severity-normal-badge');
      cy.get('icon-label-component span.cell-label').contains('Normal');
    });
  });

  it('Value cannot be clicked if no action is assigned', () => {
    cy.get('#dataTable ag-grid-angular [row-id="1"]').find('[col-id="severity"]').within(() => {
      cy.get('icon-label-component').find('a').should('not.exist');
    });
  });

  // checks if timestamp is formatted for UTC time. Will fail if you are in a different time zone
  it('Display type dateTime properly formatted with defined format', () => {
    cy.get('#dataTable ag-grid-angular [row-id="1"]').find('[col-id="timestamp"]').find('[ref="eCellValue"]').should('include.text', 'Friday, March 12, 2021 3:47 PM');
  });

  // checks if timestamp is formatted for UTC time. Will fail if you are in a different time zone
  it('Display type dateTime properly formatted with default format if no format is specified', () => {
    cy.get('#dataTable ag-grid-angular [row-id="1"]').find('[col-id="timestamp_1"]').find('[ref="eCellValue"]').should('include.text', 'Mar 12, 2021 3:47 PM');
  });

  it('Link renderer displays zero value', () => {
    cy.get('#dataTable ag-grid-angular [row-id="1"]').find('[col-id="zeroValue"]').find('[ref="eCellValue"]').should('include.text', '0');
  });

  it('Value type dateTime also works with link renderer', () => {
    cy.get('#dataTable ag-grid-angular [row-id="1"]').find('[col-id="timestamp_2"]').find('[ref="eCellValue"]').should('include.text', 'Mar 12, 2021');
  });

  it('Label renderer: label with one value is displayed', () => {
    cy.get('#dataTablePartlyNoSorting ag-grid-angular [row-id="0"]').find('[col-id="correlationLabels"]').find('.tag-flat').eq(0).should('include.text', 'Cluster ID: 58436785');
  });

  it('Label renderer: values of same type get grouped', () => {
    cy.get('#dataTablePartlyNoSorting ag-grid-angular [row-id="0"]').find('[col-id="correlationLabels"]').find('.tag-flat').eq(1).should('include.text', 'ETI Hint: Server on, Server off');
  });

  it('Label renderer: if more than 4 values of the same type exist then show only the count and the first two items', () => {
    cy.get('#dataTablePartlyNoSorting ag-grid-angular [row-id="2"]').find('[col-id="correlationLabels"]').find('.tag-flat').eq(0).should('include.text', 'ETI Hint: Server on, Server off, 3 more');
  });

  it('Label renderer: label tag and type are colored correctly', () => {
    cy.get('#dataTablePartlyNoSorting ag-grid-angular [row-id="0"]').find('[col-id="correlationLabels"]').find('.tag-flat-accent');
    cy.get('#dataTablePartlyNoSorting ag-grid-angular [row-id="0"]').find('[col-id="correlationLabels"]').find('#tag-header').eq(0).should('have.css', 'color', 'rgb(255, 0, 0)');
  });

  describe('DataTable link renderer', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgetsDataTableWidget*`
      }).as('getPage');
      cy.intercept({
        method: 'GET',
        path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestWidgetsKeyValueWidget*`
      }).as('getTestPage');
      cy.intercept({
        method: 'POST',
        path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
      }).as('getWebapiData');
      cy.intercept({
        method: 'POST',
        path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/vertica/data`
      }).as('verticaData');
      cy.bvdLogin();
      cy.visit('/uiTestWidgetsDataTableWidget');
      cy.wait(['@getPage', '@getWebapiData']);
    });

    it('Drilldown without context works', () => {
      cy.get('#dataTable ag-grid-angular [row-id="1"]').find('[col-id="drilldown"]').within(() => {
        cy.get('link-component').find('a').click();
      });
      cy.wait(['@getTestPage']);
      cy.url().should('include', 'uiTestWidgetsKeyValueWidget');
      cy.url().should('not.include', 'loadgen.mambo.net');
    });

    it('Drilldown with context works', () => {
      cy.get('#dataTable ag-grid-angular [row-id="1"]').find('[col-id="title"]').within(() => {
        cy.get('link-component').find('a').click();
      });
      cy.wait(['@getTestPage']);
      cy.url().should('include', 'uiTestWidgetsKeyValueWidget')
        .should('include', 'id~%272')
        .should('include', 'name~%27Process*20nannyManager.exe*20started')
        .should('include', 'type~%27event');
    });

    it('Drilldown with multiple contexts works', () => {
      cy.get('#dataTable ag-grid-angular [row-id="1"]').find('[col-id="drilldown"]').within(() => {
        cy.get('link-component').find('a').click();
      });
      cy.wait(['@getTestPage', '@getWebapiData', '@verticaData']);
      cy.url().should('include', 'uiTestWidgetsKeyValueWidget');
      cy.url().should('include', 'nannyManager.exe');
      cy.url().should('include', 'testId');
      cy.get('[data-cy="context-tag-Event"]').contains('testName');
      cy.get('[data-cy="context-tag-Event"]').contains('Process nannyManager');
    });

    it('Crosslaunch works', () => {
      cy.document().then(doc => {
        cy.stub(doc.body, 'appendChild').as('appendChildStub');
        cy.stub(doc.body, 'removeChild');
        cy.get('#dataTable ag-grid-angular [row-id="1"]').find('[col-id="crosslaunch"]').within(() => {
          cy.get('link-component').find('a').click();
        });
        cy.get('@appendChildStub').should('be.called.with', '<a>');
      });
    });
  });
});
describe('DataTable CSV Export admin', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestDataTableCSVExport*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/vertica/data`
    }).as('verticaData');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.bvdLogin();
    cy.visit('/uiTestDataTableCSVExport');
    cy.wait(['@getPage', '@getTOC']);
  });

  it('Datatable should show a transient notification when Export to CSV is intitiated', () => {
    const fileName = 'Data Table - Multiple Data';
    const downloadFile = `${Cypress.config('downloadsFolder')}${path.sep}${fileName}.csv`;
    cy.wait(['@verticaData']);
    cy.get('.widget-title-span').contains('Data Table - Multiple Data').parent().parent().parent().find('div')
      .find('[data-cy= "action-button"]')
      .click();
    cy.get('[data-cy= "action-button-exportToCSV"]').click();
    cy.get('#toast-container').contains('Export started');
    cy.readFile(downloadFile).should('exist');
  });

  it('Datatable should show a global notification when Export to CSV is failed', () => {
    cy.get('.widget-title-span').contains('Data Table - No Data').parent().parent().parent().find('div')
      .find('[data-cy= "action-button"]')
      .click();
    cy.get('[data-cy= "action-button-exportToCSV"]').click();
    cy.get('[data-cy="bell-button"]').click();
    cy.get('[data-cy="ux-notification-list"]');
    cy.get('[data-cy=item-0]').contains('The CSV generation has failed. Please contact your administrator');
  });
});
