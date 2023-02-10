// <reference types="Cypress" />
const shared = require('../../../shared/shared');
const SIZE_S_MIN_WIDTH = shared.getSidePanelSizeDefinition('S', 'minWidth');
const SIZE_S_MAX_WIDTH = shared.getSidePanelSizeDefinition('S', 'maxWidth');
const SIZE_M_MIN_WIDTH = shared.getSidePanelSizeDefinition('M', 'minWidth');
const SIZE_M_MAX_WIDTH = shared.getSidePanelSizeDefinition('M', 'maxWidth');
const SIZE_L_MIN_WIDTH = shared.getSidePanelSizeDefinition('L', 'minWidth');
const SIZE_L_MAX_WIDTH = shared.getSidePanelSizeDefinition('L', 'maxWidth');

function getSidePanelWidth(level) {
  return cy.get(`[data-cy="stacked-side-panel-${level}"] .ux-side-panel-content`).parent().parent().invoke('width');
}

describe('SidePanel Rendering', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept('POST', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`).as('getWebapiData');
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/ui-test-simple-list`).as('loadSimpleList');
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/external_component_flip_card`).as('loadExternalComponentFlipCard');
    cy.intercept('POST', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/vertica/data`).as('postVerticaData');
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`).as('getSidePanelPageData');
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`).as('getTOC');
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/side-panel-*`).as('loadWidgetInSidePanel');
    cy.intercept('GET', `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/*`).as('loadWidget');
    cy.bvdLogin();
    cy.visit('/sidePanels');
    cy.wait(['@getSidePanelPageData', '@getTOC']);
  });

  it('should close previous side panel on open new not stackable inline side panel', () => {
    // open side panel: inline, not stackable, default size
    cy.log('open side panel: inline, not stackable, default size');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').find('[data-cy="page-action-item-size-default"]').click();
    cy.wait('@loadWidgetInSidePanel');
    cy.get('div.ux-menu').should('not.exist');

    // open side panel: inline, not stackable, S -> close previous inline panel, open new inline
    cy.log('open side panel: inline, not stackable, S -> close previous inline panel, open new inline');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').find('[data-cy="page-action-item-size-small"]').click();
    cy.wait('@loadWidgetInSidePanel');
    cy.get('div.ux-menu').should('not.exist');
    cy.get('div.modal-backdrop').should('not.exist');
    cy.get('ux-side-panel [data-cy="panel-widget-side-panel-size-small"]');
    cy.get('ux-side-panel [data-cy="panel-widget-side-panel-size-default"]').should('not.exist');
  });

  it('should render modal side panel with different size on top of inline side panel', () => {
    // open side panel: inline, not stackable, L
    cy.log('open side panel: inline, not stackable, L');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').find('[data-cy="page-action-item-size-large"]').click();
    cy.wait('@loadWidgetInSidePanel');
    cy.get('div.ux-menu').should('not.exist');

    // open side panel: modal, not stackable, M -> keep previous inline panel, open modal on top
    cy.log('open side panel: modal, not stackable, M -> keep previous inline panel, open modal on top');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').find('[data-cy="page-action-item-modal-panel-size-medium"]').click();
    cy.wait('@loadWidgetInSidePanel');
    cy.get('div.ux-menu').should('not.exist');
    cy.get('div.modal-backdrop');
    cy.get('[data-cy="stacked-side-panel-0"] [data-cy="panel-widget-side-panel-size-large"]');
    cy.get('[data-cy="stacked-side-panel-1"] [data-cy="panel-widget-side-panel-size-medium"]');
  });

  it('should render side panel in different sizes like defined in config (default: S)', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').find('[data-cy="page-action-item-size-default"]').click();
    cy.wait('@loadWidgetInSidePanel');
    cy.get('right-side-panel ux-side-panel').should('be.visible');
    getSidePanelWidth(0).then(sidePanelWidth => {
      expect(sidePanelWidth).to.be.within(SIZE_S_MIN_WIDTH, SIZE_S_MAX_WIDTH);
    });
    cy.get('[data-cy="btn-side-panel-close"]').click();

    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').find('[data-cy="page-action-item-size-small"]').click();
    cy.wait('@loadWidgetInSidePanel');
    cy.get('right-side-panel ux-side-panel').should('be.visible');
    getSidePanelWidth(0).then(sidePanelWidth => {
      expect(sidePanelWidth).to.be.within(SIZE_S_MIN_WIDTH, SIZE_S_MAX_WIDTH);
    });
    cy.get('[data-cy="btn-side-panel-close"]').click();

    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').find('[data-cy="page-action-item-modal-panel-size-medium"]').click();
    cy.wait('@loadWidgetInSidePanel');
    getSidePanelWidth(0).then(sidePanelWidth => {
      expect(sidePanelWidth).to.be.within(SIZE_M_MIN_WIDTH, SIZE_M_MAX_WIDTH);
    });
    cy.get('[data-cy="btn-side-panel-close"]').click();

    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').find('[data-cy="page-action-item-size-large"]').click();
    cy.wait('@loadWidgetInSidePanel');
    cy.get('div.ux-menu').should('not.exist');
    getSidePanelWidth(0).then(sidePanelWidth => {
      expect(sidePanelWidth).to.be.within(SIZE_L_MIN_WIDTH, SIZE_L_MAX_WIDTH);
    });
  });

  it('should render side panel in different sizes - check min and max width', () => {
    cy.viewport(1000, 800);
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').find('[data-cy="page-action-item-size-medium"]').click();
    cy.wait('@loadWidgetInSidePanel');
    cy.get('div.ux-menu').should('not.exist');
    cy.get('ux-side-panel [data-cy="panel-widget-side-panel-size-medium"]').parent().parent().should($el => {
      expect($el[0].getBoundingClientRect().width).to.equal(SIZE_M_MIN_WIDTH);
    });
    cy.viewport(2400, 800);
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').find('[data-cy="page-action-item-size-large"]').click();
    cy.wait('@loadWidgetInSidePanel');
    cy.get('div.ux-menu').should('not.exist');
    cy.get('ux-side-panel [data-cy="panel-widget-side-panel-size-large"]').parent().parent().should($el => {
      expect($el[0].getBoundingClientRect().width).to.equal(SIZE_L_MAX_WIDTH);
    });
  });

  // move to unit test
  it('should render side panel with defined size independent of lower or uppercase value', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').find('[data-cy="page-action-item-size-lowercase"]').click();
    cy.wait('@loadWidgetInSidePanel');
    cy.get('div.ux-menu').should('not.exist');
    cy.get('ux-side-panel [data-cy="panel-widget-side-panel-size-medium"]').parent().parent().invoke('width').then(sidePanelWidth => {
      expect(sidePanelWidth).to.be.within(SIZE_M_MIN_WIDTH, SIZE_M_MAX_WIDTH);
    });
  });

  it('should render side panels stacked', () => {
    cy.log('open side panel: inline, S');
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('div.ux-menu').find('[data-cy="page-action-item-stacked-panels-small"]').click();
    cy.wait('@loadWidget');
    cy.get('div.ux-menu').should('not.exist');
    cy.get('div.modal-backdrop').should('not.exist');
    getSidePanelWidth(0).then(case1SidePanel0Width => {
      expect(case1SidePanel0Width).to.be.within(SIZE_S_MIN_WIDTH, SIZE_S_MAX_WIDTH);

      cy.log('open side panel: inline, S, stackable  -> previous side panel is stacked on this S panel, all panels become modal');
      cy.contains('[data-cy="stacked-side-panel-0"] .ux-side-panel-content button', 'size S, stackable').click();
      cy.get('right-side-panel').should('have.length', 2);
      cy.get('div.modal-backdrop').should('have.length', 2);
      getSidePanelWidth(0).then(case2SidePanel0Width => {
        getSidePanelWidth(1).then(case2SidePanel1Width => {
          expect(case2SidePanel1Width).to.be.within(SIZE_S_MIN_WIDTH, SIZE_S_MAX_WIDTH);
          expect(case2SidePanel0Width).to.be.greaterThan(case1SidePanel0Width);
          expect(case2SidePanel0Width).to.be.greaterThan(case2SidePanel1Width);

          cy.log('open side panel: inline, M, stackable -> previous side panels are stacked on this M panel');
          cy.contains('[data-cy="stacked-side-panel-1"] .ux-side-panel-content button', 'size M, stackable').click();
          cy.get('right-side-panel').should('have.length', 3);
          cy.get('div.modal-backdrop').should('have.length', 3);
          getSidePanelWidth(0).then(case3SidePanel0Width => {
            getSidePanelWidth(1).then(case3SidePanel1Width => {
              getSidePanelWidth(2).then(case3SidePanel2Width => {
                expect(case3SidePanel2Width).to.be.within(SIZE_M_MIN_WIDTH, SIZE_M_MAX_WIDTH);
                expect(case3SidePanel1Width).to.be.greaterThan(case3SidePanel2Width);
                expect(case3SidePanel0Width).to.be.greaterThan(case3SidePanel1Width);

                cy.log('open side panel: inline, S, stackable -> previous side panels keep sizing');
                cy.contains('[data-cy="stacked-side-panel-2"] .ux-side-panel-content button', 'size S, stackable').click();
                cy.get('right-side-panel').should('have.length', 4);
                cy.get('div.modal-backdrop').should('have.length', 4);
                getSidePanelWidth(0).then(case4SidePanel0Width => {
                  getSidePanelWidth(1).then(case4SidePanel1Width => {
                    getSidePanelWidth(2).then(case4SidePanel2Width => {
                      getSidePanelWidth(3).then(case4SidePanel3Width => {
                        expect(case4SidePanel3Width).to.be.within(SIZE_S_MIN_WIDTH, SIZE_S_MAX_WIDTH);
                        expect(case4SidePanel2Width).to.be.within(SIZE_M_MIN_WIDTH, SIZE_M_MAX_WIDTH);
                        expect(case4SidePanel2Width).to.be.equal(case3SidePanel2Width);
                        expect(case4SidePanel1Width).to.be.equal(case3SidePanel1Width);
                        expect(case4SidePanel0Width).to.be.equal(case3SidePanel0Width);

                        cy.log('open side panel: inline, L, stackable -> previous side panels are stacked on this L panel');
                        cy.contains('[data-cy="stacked-side-panel-3"] .ux-side-panel-content button', 'size L, stackable').click();
                        cy.get('right-side-panel').should('have.length', 5);
                        cy.get('div.modal-backdrop').should('have.length', 5);
                        getSidePanelWidth(0).then(case5SidePanel0Width => {
                          getSidePanelWidth(1).then(case5SidePanel1Width => {
                            getSidePanelWidth(2).then(case5SidePanel2Width => {
                              getSidePanelWidth(3).then(case5SidePanel3Width => {
                                getSidePanelWidth(4).then(case5SidePanel4Width => {
                                  expect(case5SidePanel4Width).to.be.within(SIZE_L_MIN_WIDTH, SIZE_L_MAX_WIDTH);
                                  expect(case5SidePanel3Width).to.be.greaterThan(case5SidePanel4Width);
                                  expect(case5SidePanel2Width).to.be.greaterThan(case5SidePanel3Width);
                                  expect(case5SidePanel1Width).to.be.greaterThan(case5SidePanel2Width);
                                  expect(case5SidePanel0Width).to.be.greaterThan(case5SidePanel1Width);

                                  cy.log('close top side panel -> previous side panels are returning to state before this one was opened');
                                  cy.get('[data-cy="stacked-side-panel-4"] [data-cy="btn-side-panel-close"]').click();
                                  cy.get('right-side-panel').should('have.length', 4);
                                  cy.get('div.modal-backdrop').should('have.length', 4);
                                  getSidePanelWidth(0).then(case6SidePanel0Width => {
                                    getSidePanelWidth(1).then(case6SidePanel1Width => {
                                      getSidePanelWidth(2).then(case6SidePanel2Width => {
                                        getSidePanelWidth(3).then(case6SidePanel3Width => {
                                          expect(case6SidePanel3Width).to.be.equal(case4SidePanel3Width);
                                          expect(case6SidePanel2Width).to.be.equal(case4SidePanel2Width);
                                          expect(case6SidePanel1Width).to.be.equal(case4SidePanel1Width);
                                          expect(case6SidePanel0Width).to.be.equal(case4SidePanel0Width);

                                          cy.log('close all stacked side panels -> reset state of initial panel');
                                          cy.get('[data-cy="stacked-side-panel-3"] [data-cy="btn-side-panel-close"]').click();
                                          cy.get('[data-cy="stacked-side-panel-2"] [data-cy="btn-side-panel-close"]').click();
                                          cy.get('[data-cy="stacked-side-panel-1"] [data-cy="btn-side-panel-close"]').click();
                                          cy.get('right-side-panel').should('have.length', 1);
                                          cy.get('div.modal-backdrop').should('have.length', 0);
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  afterEach(() => {
    cy.viewport(1400, 800);
  });
});
