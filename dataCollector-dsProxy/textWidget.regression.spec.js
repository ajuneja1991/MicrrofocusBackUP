// <reference types="Cypress" />
const shared = require('../../../shared/shared');
import 'cypress-file-upload';
import 'cypress-iframe';
let bvdURL = '';
const dataCollector = require('../../../../../support/reporting/restUtils/dataCollector');
import { uploadFileRequest } from '../../../../../support/reporting/restUtils/uploadFile';

describe('DS Proxy predefined query with parameters for text widget', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('postDataCollector');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('reportingPageloadSystem');
    cy.intercept(`${shared.reportingContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`).as('reportingPageloadUser');
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/testMultipleWidgetsWithDataCollectors*`).as('waitForWidgetsWithDataCollectorsPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getChannelInfo');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('getChannelStateResponse');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/metadata`
    }).as('getPagesMetadata');
    cy.bvdLogin();
  });
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);

  before(() => {
    uploadFileRequest('foundation/bvdOnUIF/BVDDataCollector.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
  });

  it('Text widget should be populated with data when connected to dataCollector data source', () => {
    shared.visitPage('/testMultipleWidgetsWithDataCollectors', 3, 'waitForWidgetsWithDataCollectorsPage');
    cy.get('#ui-test-text-dataCollector').find('text-widget')
      .should('contain', 'admin')
      .and('contain', 'Administrators');

    cy.get('#ui-test-text-dataCollector').find('text-widget').find('table')
      .should('contain', 'sac-hvm01200.swinfra.net')
      .and('contain', 'Oracle').and('contain', '4GB');
    cy.get('#ui-test-text-dataCollector').find('text-widget > p').scrollTo('bottom');
    cy.get('#ui-test-text-dataCollector').find('text-widget > p').scrollTo('right');
  });

  after(() => {
    dataCollector.deleteAllQueries(bvdURL);
  });
});
