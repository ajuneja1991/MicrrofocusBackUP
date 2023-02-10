const shared = require('../../shared/shared');
import EditDashboardPage from '../../../../support/reporting/pageObjects/EditDashboardPage';
const dashboard = require('../../../../support/reporting/restUtils/dashboard');
const dataCollector = require('../../../../support/reporting/restUtils/dataCollector');
import { uploadFileRequest } from '../../../../support/reporting/restUtils/uploadFile';

const accuracyRange = 0.5;
const dataChannel = 'WestEast';
const DEFAULT_TIMEOUT_IN_MS = 5 * 60000;
function checkTranslateAccuracy(actual, expected) {
  const min = expected - accuracyRange;
  const max = expected + accuracyRange;
  expect(actual >= min && actual <= max).to.be.true;
}

function verifyTranslateValues(dataCy, expectedX, expectedY) {
  cy.get(`[data-cy=${dataCy}]`).should('have.attr', 'data-cy-x').then(x => {
    checkTranslateAccuracy(Number(x), expectedX);
  });

  cy.get(`[data-cy=${dataCy}]`).should('have.attr', 'data-cy-y').then(y => {
    checkTranslateAccuracy(y, expectedY);
  });
}

describe('Geo layout Test', shared.defaultTestOptions, () => {
  const dashboardName = 'geoLayoutExtendedDashboard';

  beforeEach(() => {
    cy.bvdLogin();
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/system`).as('pageloadSystem');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
  });

  it('Upload geo layout dashboard and verify config', () => {
    cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/session/user`).then(
      response => {
        const apiKey = response.body.data.userDetails.apiKey;

        // The data channels must be executed once to have data in the build as well.
        // West-East channel
        const data = {
          items: [
            {
              id: 1,
              name: 'New Zealand',
              lat: -40,
              lon: 170,
              status: 'red'
            }, {
              id: 2,
              name: 'Middle',
              lat: -30,
              lon: -180,
              status: 'red'
            }, {
              id: 3,
              name: 'Sea',
              lat: -20,
              lon: -170,
              status: 'red'
            }
          ]
        };
        const url = `${Cypress.env('receiverUrl')}/api/submit/${apiKey}/tags/${dataChannel}`;
        cy.request('POST', url, data);

        // East-West channel
        const dataEastWest = {
          items: [
            {
              id: 1,
              name: 'Canterbury',
              lat: 51,
              lon: 1,
              status: 'red'
            }, {
              id: 2,
              name: 'Oxford',
              lat: 52,
              lon: -1,
              status: 'red'
            }, {
              id: 3,
              name: 'Brighton',
              lat: 51,
              lon: 0,
              status: 'red'
            }
          ]
        };
        const urlEastWest = `${Cypress.env('receiverUrl')}/api/submit/${apiKey}/tags/east_west_transition`;
        cy.request('POST', urlEastWest, dataEastWest);

        // East-West channel
        const dataLondon = {
          items: [
            {
              id: 1,
              name: 'Stratford',
              lat: 51.5502778,
              lon: 0,
              status: 'red'
            }, {
              id: 2,
              name: 'Eltham',
              lat: 51.45,
              lon: 0.05027777777777778,
              status: 'red'
            }, {
              id: 3,
              name: 'Wandsworth',
              lat: 51.45,
              lon: -0.2,
              status: 'red'
            }
          ]
        };
        const urlLondon = `${Cypress.env('receiverUrl')}/api/submit/${apiKey}/tags/london`;
        cy.request('POST', urlLondon, dataLondon);

        // Equator channel
        const dataEquator = {
          items: [
            {
              id: 1,
              name: 'Kisumu',
              lat: 0,
              lon: 35,
              status: 'red'
            }, {
              id: 2,
              name: 'Victoria Lake',
              lat: -1,
              lon: 33,
              status: 'red'
            }, {
              id: 3,
              name: 'Mbale',
              lat: 1,
              lon: 34,
              status: 'red'
            }
          ]
        };
        const urlEquator = `${Cypress.env('receiverUrl')}/api/submit/${apiKey}/tags/equator`;
        cy.request('POST', urlEquator, dataEquator);

        // Equator south marker channel
        const dataEquatorSouthMarker = {
          items: [
            {
              id: 1,
              name: 'Baringo',
              lat: 1,
              lon: 36,
              status: 'red'
            }, {
              id: 2,
              name: 'Meru',
              lat: 0,
              lon: 38,
              status: 'red'
            }, {
              id: 3,
              name: 'Meru',
              lat: -1,
              lon: 37,
              status: 'red'
            }
          ]
        };
        const urlEquatorSouthMarker = `${Cypress.env('receiverUrl')}/api/submit/${apiKey}/tags/equatorSouthMarker`;
        cy.request('POST', urlEquatorSouthMarker, dataEquatorSouthMarker);

        // world center channel
        const worldCenterSouthData = {
          items: [
            {
              id: 1,
              name: 'Africa',
              lat: 0,
              lon: 0,
              status: 'red'
            }, {
              id: 2,
              name: 'Sea',
              lat: 0,
              lon: 180,
              status: 'red'
            }, {
              id: 3,
              name: 'Paraguay',
              lat: -20,
              lon: -60,
              status: 'red'
            }, {
              id: 4,
              name: 'Australia',
              lat: -20,
              lon: 140,
              status: 'red'
            }, {
              id: 5,
              name: 'Sea',
              lat: -20,
              lon: -20,
              status: 'red'
            }, {
              id: 6,
              name: 'Namibia',
              lat: -20,
              lon: 20,
              status: 'red'
            }, {
              id: 7,
              name: 'Sea',
              lat: 20,
              lon: 80,
              status: 'red'
            }
          ]
        };
        const urlWorldCenterSouth = `${Cypress.env('receiverUrl')}/api/submit/${apiKey}/tags/worldCenterSouth`;
        cy.request('POST', urlWorldCenterSouth, worldCenterSouthData);

        // world center south channel
        const worldCenterData = {
          items: [
            {
              id: 1,
              name: 'Africa',
              lat: 0,
              lon: 0,
              status: 'red'
            }, {
              id: 2,
              name: 'Sea',
              lat: 20,
              lon: 180,
              status: 'red'
            }, {
              id: 3,
              name: 'Ireland',
              lat: 40,
              lon: -20,
              status: 'red'
            }, {
              id: 4,
              name: 'Mexico',
              lat: 20,
              lon: -100,
              status: 'red'
            }, {
              id: 5,
              name: 'Sea',
              lat: 40,
              lon: -40,
              status: 'red'
            }, {
              id: 6,
              name: 'Sea',
              lat: 0,
              lon: -180,
              status: 'red'
            }, {
              id: 7,
              name: 'India',
              lat: 20,
              lon: 80,
              status: 'red'
            }
          ]
        };
        const urlWorldCenter = `${Cypress.env('receiverUrl')}/api/submit/${apiKey}/tags/worldCenter`;
        cy.request('POST', urlWorldCenter, worldCenterData);

        // europe
        const dataEurope = {
          items: [
            {
              id: 1,
              name: 'Spain',
              lat: 40,
              lon: 0,
              status: 'red'
            }, {
              id: 2,
              name: 'Germany',
              lat: 50,
              lon: 10,
              status: 'red'
            }, {
              id: 3,
              name: 'Ireland',
              lat: 50,
              lon: -10,
              status: 'red'
            }, {
              id: 4,
              name: 'Russia',
              lat: 60,
              lon: 30,
              status: 'red'
            }
          ]
        };
        const urlEurope = `${Cypress.env('receiverUrl')}/api/submit/${apiKey}/tags/europe`;
        cy.request('POST', urlEurope, dataEurope);

        // Asia-America
        const dataAsiaAmerica = {
          items: [
            {
              id: 1,
              name: 'Canada',
              lat: 60,
              lon: -100,
              status: 'red'
            }, {
              id: 2,
              name: 'Sea',
              lat: 20,
              lon: 180,
              status: 'red'
            }, {
              id: 3,
              name: 'China',
              lat: 40,
              lon: 100,
              status: 'red'
            }, {
              id: 4,
              name: 'Sea 2',
              lat: 40,
              lon: -180,
              status: 'red'
            }
          ]
        };
        const urlAsiaAmerica = `${Cypress.env('receiverUrl')}/api/submit/${apiKey}/tags/asia_america`;
        cy.request('POST', urlAsiaAmerica, dataAsiaAmerica);

        // southern area
        const dataSouthernArea = {
          items: [
            {
              id: 1,
              name: 'southPol',
              lat: -80,
              lon: -60,
              status: 'red'
            }, {
              id: 2,
              name: 'Zero',
              lat: -80,
              lon: 0,
              status: 'red'
            }, {
              id: 3,
              name: 'SouthPol 2',
              lat: -60,
              lon: 40,
              status: 'red'
            }
          ]
        };
        const urlSouthernArea = `${Cypress.env('receiverUrl')}/api/submit/${apiKey}/tags/southArea`;
        cy.request('POST', urlSouthernArea, dataSouthernArea);

        // northern area
        const dataNorthernArea = {
          items: [
            {
              id: 1,
              name: 'Greenland',
              lat: 80,
              lon: -40,
              status: 'red'
            }, {
              id: 2,
              name: 'Alaksa',
              lat: 80,
              lon: -160,
              status: 'red'
            }, {
              id: 3,
              name: 'Canada',
              lat: 60,
              lon: -80,
              status: 'red'
            }, {
              id: 4,
              name: 'Sweden',
              lat: 60,
              lon: 20,
              status: 'red'
            }
          ]
        };
        const urlNorthernArea = `${Cypress.env('receiverUrl')}/api/submit/${apiKey}/tags/northArea`;
        cy.request('POST', urlNorthernArea, dataNorthernArea);

        // germany
        const dataGermany = {
          items: [
            {
              id: 1,
              name: 'Freiburg',
              lat: 48,
              lon: 8,
              status: 'red'
            }, {
              id: 2,
              name: 'Wuerzburg',
              lat: 50,
              lon: 10,
              status: 'red'
            }, {
              id: 3,
              name: 'Praha',
              lat: 50,
              lon: 14,
              status: 'red'
            }
          ]
        };
        const urlGermany = `${Cypress.env('receiverUrl')}/api/submit/${apiKey}/tags/germany`;
        cy.request('POST', urlGermany, dataGermany);

        // world
        const worldData = {
          items: [
            {
              id: 1,
              name: 'Center',
              lat: 0,
              lon: 0,
              status: 'red'
            }, {
              id: 2,
              name: 'Argentina',
              lat: -40,
              lon: -65,
              status: 'red'
            }, {
              id: 3,
              name: 'GB',
              lat: 60,
              lon: 0,
              status: 'red'
            }, {
              id: 4,
              name: 'Australia',
              lat: -30,
              lon: 150,
              status: 'red'
            }, {
              id: 5,
              name: 'Greenland',
              lat: 40,
              lon: -40,
              status: 'red'
            }, {
              id: 6,
              name: 'Mexico',
              lat: 20,
              lon: -100,
              status: 'red'
            }
          ]
        };
        const urlWorld = `${Cypress.env('receiverUrl')}/api/submit/${apiKey}/tags/world`;
        cy.request('POST', urlWorld, worldData);
      }
    );

    uploadFileRequest(`reporting/${dashboardName}.bvd`, `${Cypress.env('BVD_CONTEXT_ROOT')}/urest/${Cypress.env('API_VERSION')}/dashboard`, 5);
    cy.bvdLogout();
    cy.bvdLogin();
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dashboard/${dashboardName}`).as('pageLoadingDone');
    cy.visit(`/#/config/${dashboardName}`);
    cy.wait('@pageLoadingDone', { timeout: DEFAULT_TIMEOUT_IN_MS });

    /**
     * Group717
     * West-East Transition (3)
     */
    // first clear all current data
    cy.log('Test West-East Transition (3)');
    EditDashboardPage.selectWidget('group717');
    cy.get('[data-cy="opr_latitude_1"]').clear();
    cy.get('[data-cy="opr_longitude_1"]').clear();
    cy.get('[data-cy="opr_latitude_2"]').clear();
    cy.get('[data-cy="opr_longitude_2"]').clear();
    EditDashboardPage.clearDataChannel();

    // Enter new data channel and check the input fields
    cy.get('[data-cy="apply-button"]').should('be.disabled');
    EditDashboardPage.setDataChannel(dataChannel);
    cy.log('Enter valid lat/lon');
    // Enter 0
    cy.get('[data-cy="opr_latitude_1"]').click().type('0');
    cy.get('[data-cy="opr_longitude_1"]').click().type('0');
    cy.get('[data-cy="apply-button"]').should('be.disabled');
    cy.get('[data-cy="opr_latitude_2"]').click().type('0');
    cy.get('[data-cy="opr_longitude_2"]').click().type('0');
    cy.get('[data-cy="apply-button"]').should('not.be.disabled');

    // Clear and enter different valid numbers
    cy.get('[data-cy="opr_latitude_1"]').clear();
    cy.get('[data-cy="opr_longitude_1"]').clear();
    cy.get('[data-cy="opr_latitude_2"]').clear();
    cy.get('[data-cy="opr_longitude_2"]').clear();
    cy.get('[data-cy="opr_latitude_1"]').click().type('12.1');
    cy.get('[data-cy="opr_longitude_1"]').click().type('-12');
    cy.get('[data-cy="apply-button"]').should('be.disabled');
    cy.get('[data-cy="opr_latitude_2"]').click().type('12.222222222222');
    cy.get('[data-cy="opr_longitude_2"]').click().type('12');
    cy.get('[data-cy="apply-button"]').should('not.be.disabled');

    cy.log('Try to enter text instead of number');
    cy.get('[data-cy="opr_latitude_1"]').click().type('test');
    cy.get('[data-cy="opr_latitude_1"]').should('have.value', '12.1');
    cy.get('[data-cy="opr_longitude_1"]').click().type('test');
    cy.get('[data-cy="opr_longitude_1"]').should('have.value', '-12');
    cy.get('[data-cy="opr_latitude_2"]').click().type('test');
    cy.get('[data-cy="opr_latitude_2"]').should('have.value', '12.222222222222');
    cy.get('[data-cy="opr_longitude_2"]').click().type('test');
    cy.get('[data-cy="opr_longitude_2"]').should('have.value', '12');

    cy.log('Clear values');
    cy.get('[data-cy="opr_latitude_1_empty"]').should('not.be.visible');
    cy.get('[data-cy="opr_latitude_1"]').clear();
    cy.get('[data-cy="opr_latitude_1_empty"]').should('be.visible');
    cy.get('[data-cy="apply-button"]').should('be.disabled');
    cy.get('[data-cy="opr_longitude_1_empty"]').should('not.be.visible');
    cy.get('[data-cy="opr_longitude_1"]').clear();
    cy.get('[data-cy="opr_longitude_1_empty"]').should('be.visible');
    cy.get('[data-cy="apply-button"]').should('be.disabled');
    cy.get('[data-cy="opr_latitude_2_empty"]').should('not.be.visible');
    cy.get('[data-cy="opr_latitude_2"]').clear();
    cy.get('[data-cy="opr_latitude_2_empty"]').should('be.visible');
    cy.get('[data-cy="apply-button"]').should('be.disabled');
    cy.get('[data-cy="opr_longitude_2_empty"]').should('not.be.visible');
    cy.get('[data-cy="opr_longitude_2"]').clear();
    cy.get('[data-cy="opr_longitude_2_empty"]').should('be.visible');
    cy.get('[data-cy="apply-button"]').should('be.disabled');

    cy.log('Enter correct lat/lon');
    cy.get('[data-cy="opr_latitude_1"]').click().type('-20');
    cy.get('[data-cy="opr_longitude_1"]').click().type('-170');
    cy.get('[data-cy="apply-button"]').should('be.disabled');
    cy.get('[data-cy="opr_latitude_2"]').click().type('-40');
    cy.get('[data-cy="opr_longitude_2"]').click().type('-130');
    cy.get('[data-cy="apply-button"]').should('not.be.disabled');

    EditDashboardPage.selectWidget('shape707');
    cy.get('#ux-select-1-input').click();
    cy.get('.ux-typeahead-all-options').contains('lat').click();

    EditDashboardPage.selectWidget('shape708');
    cy.get('#ux-select-2-input').click();
    cy.get('.ux-typeahead-all-options').contains('lon').click();
    EditDashboardPage.saveConfig(dashboardName);
  });

  it('Test geo layout input latitude and longitude', () => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/ui/dashboard/${dashboardName}?isInstance=true`).as('pageLoadingDone');
    cy.visit(`#/show/${dashboardName}`);
    cy.wait('@pageLoadingDone', { timeout: DEFAULT_TIMEOUT_IN_MS });

    /**
     * The translate data for each target has been manually checked and adopted from Chrome.
     * The expected values will be verified with x and y values, which are very close.
     * The range ensures that the tests are not flaky, but are still placed almost exactly in the right location.
     */

    /**
     * Group717
     * West-East Transition (3)
     */
    // target instance-group717-1: translate(-2.8360037803649902,-45.842247009277344)
    verifyTranslateValues('instance-group717-1', -2.8360037803649902, -45.842247009277344);
    // target instance-group717-2: translate(33.02219772338867,-89.72759246826172)
    verifyTranslateValues('instance-group717-2', 33.02219772338867, -89.72759246826172);
    // target instance-group717-3: translate(68.8803939819336,-129.36502075195312)
    verifyTranslateValues('instance-group717-3', 68.8803939819336, -129.36502075195312);

    /**
    * Group583
    * West-East Transition (2)
    */
    cy.log('Test West-East Transition (2)');
    // target instance-group583-1: translate(182.70245361328125,-28.35032844543457)
    verifyTranslateValues('instance-group583-1', 182.70245361328125, -28.35032844543457);
    // target instance-group583-2: translate(226.3037567138672,-81.71212768554688)
    verifyTranslateValues('instance-group583-2', 226.3037567138672, -81.71212768554688);
    // target instance-group583-3: translate(269.9050598144531,-129.9087371826172)
    verifyTranslateValues('instance-group583-3', 269.9050598144531, -129.9087371826172);

    /**
     * Group549
     * West-East Transition (1)
     */
    cy.log('Test West-East Transition (1)');
    // target instance-group549-1: translate(122.90077209472656,-40.06618881225586)
    verifyTranslateValues('instance-group549-1', 122.90077209472656, -40.06618881225586);
    // target instance-group549-2: translate(162.62632751464844,-88.68463134765625)
    verifyTranslateValues('instance-group549-2', 162.62632751464844, -88.68463134765625);
    // target instance-group549-3: translate(202.35189819335938,-132.59703063964844)
    verifyTranslateValues('instance-group549-3', 202.35189819335938, -132.59703063964844);

    /**
     * Group504
     * North-South Transition (2)
     */
    cy.log('North-South Transition (2)');
    // target instance-group405-1: translate(86.01893615722656,-165.23239135742188)
    verifyTranslateValues('instance-group504-1', 86.01893615722656, -165.23239135742188);
    // target instance-group405-2: translate(165.38917541503906,-125.5452651977539)
    verifyTranslateValues('instance-group504-2', 165.38917541503906, -125.5452651977539);
    // target instance-group405-3: translate(125.70404815673828,-85.8581314086914)
    verifyTranslateValues('instance-group504-3', 125.70404815673828, -85.8581314086914);

    /**
     * Group405
     * North-South Transition (1)
     */
    cy.log('North-South Transition (1)');
    // target instance-group405-1: translate(127.2697525024414,-74.82646942138672)
    verifyTranslateValues('instance-group405-1', 127.2697525024414, -74.82646942138672);
    // target instance-group405-2: translate(44.785953521728516,-33.58247375488281)
    verifyTranslateValues('instance-group405-2', 44.785953521728516, -33.58247375488281);
    // target instance-group405-3: translate(86.0278549194336,-116.07046508789062)
    verifyTranslateValues('instance-group405-3', 86.0278549194336, -116.07046508789062);

    /**
     * Group402
     * East-West Transition (2)
     */
    cy.log('East-West Transition (2)');
    // target instance-group402-1: translate(278.0068359375,-160.52102661132812)
    verifyTranslateValues('instance-group402-1', 278.0068359375, -160.52102661132812);
    // target instance-group402-2: translate(314.0666198730469,-44.988609313964844)
    verifyTranslateValues('instance-group402-2', 314.0666198730469, -44.988609313964844);
    // target instance-group402-3: translate(134.56459045410156,-44.988609313964844)
    verifyTranslateValues('instance-group402-3', 134.56459045410156, -44.988609313964844);

    /**
     * Group219
     * East-West Transition (1)
     */
    cy.log('East-West Transition (1)');
    // target instance-group219-1: translate(179.55331420898438,-16.24184799194336)
    verifyTranslateValues('instance-group219-1', 179.55331420898438, -16.24184799194336);
    // target instance-group219-2: translate(112.6354751586914,-69.99268341064453)
    verifyTranslateValues('instance-group219-2', 112.6354751586914, -69.99268341064453);
    // target instance-group219-3: translate(146.09439086914062,-16.24184799194336)
    verifyTranslateValues('instance-group219-3', 146.09439086914062, -16.24184799194336);

    /**
     * Group929
     * 0° and 180° meridian in one map: 0° on the left (1)
     */
    cy.log('0° and 180° meridian in one map: 0° on the left (1)');
    // target instance-group929-1: translate(40.88498306274414,-10.578548431396484)
    verifyTranslateValues('instance-group929-1', 40.88498306274414, -10.578548431396484);
    // target instance-group929-2: translate(438.3018798828125,-55.66104507446289)
    verifyTranslateValues('instance-group929-2', 438.3018798828125, -55.66104507446289);
    // target instance-group929-3: translate(-3.2724509239196777,-107.08793640136719)
    verifyTranslateValues('instance-group929-3', -3.2724509239196777, -107.08793640136719);
    // target instance-group929-4: translate(614.9315795898438,-55.66104507446289)
    verifyTranslateValues('instance-group929-4', 614.9315795898438, -55.66104507446289);
    // target instance-group929-5: translate(747.4039306640625,-107.08793640136719)
    verifyTranslateValues('instance-group929-5', 747.4039306640625, -107.08793640136719);
    // target instance-group929-6: translate(438.3018798828125,-10.578548431396484)
    verifyTranslateValues('instance-group929-6', 438.3018798828125, -10.578548431396484);
    // target instance-group929-7: translate(217.51470947265625,-55.66104507446289)
    verifyTranslateValues('instance-group929-7', 217.51470947265625, -55.66104507446289);

    /**
     * Group964
     * 0° and 180° meridian in one map: 0° on the left (2)
     */
    cy.log('0° and 180° meridian in one map: 0° on the left (2)');
    // target instance-group964-1: translate(40.955997467041016,-10.458307266235352)
    verifyTranslateValues('instance-group964-1', 40.955997467041016, -10.458307266235352);
    // target instance-group964-2: translate(438.8680419921875,-55.59697341918945)
    verifyTranslateValues('instance-group964-2', 438.8680419921875, -55.59697341918945);
    // target instance-group964-3: "translate(-3.2564520835876465,-107.08793640136719)"
    verifyTranslateValues('instance-group964-3', -3.2564520835876465, -107.08793640136719);
    // target instance-group964-4: translate(615.7178344726562,-55.59697341918945)
    verifyTranslateValues('instance-group964-4', 615.7178344726562, -55.59697341918945);
    // target instance-group964-5: translate(748.3551635742188,-107.08793640136719)
    verifyTranslateValues('instance-group964-5', 748.3551635742188, -107.08793640136719);
    // target instance-group964-6: translate(438.8680419921875,-10.458307266235352)
    verifyTranslateValues('instance-group964-6', 438.8680419921875, -10.578548431396484);
    // target instance-group964-7: translate(217.8057861328125,-55.59697341918945)
    verifyTranslateValues('instance-group964-7', 217.8057861328125, -55.59697341918945);

    /**
     * Group1036
     * 0° and 180° meridian in one map: 180° on the left (1)
     */
    cy.log('0° and 180° meridian in one map: 180° on the left (1)');
    // target instance-group1036-1: translate(711.0310668945312,-146.1819305419922)
    verifyTranslateValues('instance-group1036-1', 711.0310668945312, -146.1819305419922);
    // target instance-group1036-2: translate(178.27980041503906,-146.1819305419922)
    verifyTranslateValues('instance-group1036-2', 178.27980041503906, -146.1819305419922);
    // target instance-group1036-3: translate(533.447265625,-85.74726867675781)
    verifyTranslateValues('instance-group1036-3', 533.447265625, -85.74726867675781);
    // target instance-group1036-4: translate(59.89063262939453,-85.74726867675781)
    verifyTranslateValues('instance-group1036-4', 59.89063262939453, -85.74726867675781);
    // target instance-group1036-5: translate(651.8364868164062,-85.74726867675781)
    verifyTranslateValues('instance-group1036-5', 651.8364868164062, -85.74726867675781);
    // target instance-group1036-6: translate(770.2256469726562,-85.74726867675781)
    verifyTranslateValues('instance-group1036-6', 770.2256469726562, -85.74726867675781);
    // target instance-group1036-7: translate(-117.693115234375,-206.61659240722656)
    verifyTranslateValues('instance-group1036-7', -117.693115234375, -206.61659240722656);

    /**
     * Group1070
     * 0° and 180° meridian in one map: 180° on the left (2)
     */
    cy.log('0° and 180° meridian in one map: 180° on the left (2)');
    // target instance-group1070-1: translate(711.2778930664062,-146.4659423828125)
    verifyTranslateValues('instance-group1070-1', 711.2778930664062, -146.4659423828125);
    // target instance-group1070-2: translate(179.0848846435547,-146.4659423828125)
    verifyTranslateValues('instance-group1070-2', 179.0848846435547, -146.4659423828125);
    // target instance-group1070-3: translate(533.8801879882812,-86.0946044921875)
    verifyTranslateValues('instance-group1070-3', 533.8801879882812, -86.0946044921875);
    // target instance-group1070-4: translate(60.81977462768555,-86.0946044921875)
    verifyTranslateValues('instance-group1070-4', 60.81977462768555, -86.0946044921875);
    // target instance-group1070-5: translate(652.1453247070312,-86.0946044921875)
    verifyTranslateValues('instance-group1070-5', 652.1453247070312, -86.0946044921875);
    // target instance-group1070-6: translate(770.4104614257812,-86.0946044921875)
    verifyTranslateValues('instance-group1070-6', 770.4104614257812, -86.0946044921875);
    // target instance-group1070-7: translate(947.80810546875,-206.8372802734375)
    verifyTranslateValues('instance-group1070-7', 947.80810546875, -206.8372802734375);

    /**
     * Group758
     * Europe map
     */
    cy.log('Europe map');
    // target instance-group758-1: translate(38.11334991455078,-9.387986183166504)
    verifyTranslateValues('instance-group758-1', 38.11334991455078, -9.387986183166504);
    // target instance-group758-2: translate(78.62158966064453,-66.89501953125)
    verifyTranslateValues('instance-group758-2', 78.62158966064453, -66.89501953125);
    // target instance-group758-3: translate(-2.394892692565918,-66.89501953125)
    verifyTranslateValues('instance-group758-3', -2.394892692565918, -66.89501953125);
    // target instance-group758-4: translate(159.63807678222656,-137.97988891601562)
    verifyTranslateValues('instance-group758-4', 159.63807678222656, -137.97988891601562);

    /**
     * Group863
     * Northern area map
     */
    cy.log('Northern area map');
    // target instance-group863-1: translate(222.14686584472656,-147.42596435546875)
    verifyTranslateValues('instance-group863-1', 222.14686584472656, -147.42596435546875);
    // target instance-group863-2: translate(-40.41054916381836,-147.42596435546875)
    verifyTranslateValues('instance-group863-2', -40.41054916381836, -147.42596435546875);
    // target instance-group863-3: translate(134.6277313232422,-7.109838008880615)
    verifyTranslateValues('instance-group863-3', 134.6277313232422, -7.109838008880615);
    // target instance-group863-4: translate(353.4255676269531,-7.109838008880615)
    verifyTranslateValues('instance-group863-4', 353.4255676269531, -7.109838008880615);

    /**
     * Group759
     * Asia-America
     */
    cy.log('Asia-America');
    // target instance-group759-1: translate(657.2221069335938,-228.18991088867188)
    verifyTranslateValues('instance-group759-1', 657.2221069335938, -228.18991088867188);
    // target instance-group759-2: translate(345.4112243652344,-13.675164222717285)
    verifyTranslateValues('instance-group759-2', 345.4112243652344, -13.675164222717285);
    // target instance-group759-3: translate(33.60034942626953,-104.46092224121094)
    verifyTranslateValues('instance-group759-3', 33.60034942626953, -104.46092224121094);
    // target instance-group759-4: translate(345.4112243652344,-104.46092224121094)
    verifyTranslateValues('instance-group759-4', 345.4112243652344, -104.46092224121094);

    /**
     * Group897
     * Southern area map
     */
    cy.log('Southern area map');
    // target instance-group897-1: translate(-11.565049171447754,-5.143482208251953)
    verifyTranslateValues('instance-group897-1', -11.565049171447754, -5.143482208251953);
    // target instance-group897-2: translate(103.52159881591797,-5.143482208251953)
    verifyTranslateValues('instance-group897-2', 103.52159881591797, -5.143482208251953);
    // target instance-group897-3: translate(180.24603271484375,-128.15286254882812)
    verifyTranslateValues('instance-group897-3', 180.24603271484375, -128.15286254882812);

    /**
     * Group793
     * World map
     */
    cy.log('World map');
    // target instance-group793-1: translate(172.031005859375,-69.10909271240234)
    verifyTranslateValues('instance-group793-1', 172.031005859375, -69.10909271240234);
    // target instance-group793-2: translate(97.88201904296875,-19.245038986206055)
    verifyTranslateValues('instance-group793-2', 97.88201904296875, -19.245038986206055);
    // target instance-group793-3: translate(172.031005859375,-155.18594360351562)
    verifyTranslateValues('instance-group793-3', 172.031005859375, -155.18594360351562);
    // target instance-group793-4: translate(343.14404296875,-33.206241607666016)
    verifyTranslateValues('instance-group793-4', 343.14404296875, -33.206241607666016);
    // target instance-group793-5: translate(126.40086364746094,-118.97314453125)
    verifyTranslateValues('instance-group793-5', 126.40086364746094, -118.97314453125);
    // target instance-group793-6: translate(57.95564651489258,-92.4021224975586)
    verifyTranslateValues('instance-group793-6', 57.95564651489258, -92.4021224975586);

    /**
     * Group831
     * Germany map
     */
    cy.log('Germany map');
    // target instance-group831-1: translate(26.491348266601562,-16.31134033203125)
    verifyTranslateValues('instance-group831-1', 26.491348266601562, -16.31134033203125);
    // target instance-group831-2: translate(80.82958221435547,-99.15189361572266)
    verifyTranslateValues('instance-group831-2', 80.82958221435547, -99.15189361572266);
    // target instance-group831-3: translate(189.50604248046875,-99.15189361572266)
    verifyTranslateValues('instance-group831-3', 189.50604248046875, -99.15189361572266);
  });

  it('Verify wrong map config', () => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dashboard/${dashboardName}`).as('pageLoadingDone');
    cy.visit(`#/config/${dashboardName}`);
    cy.wait('@pageLoadingDone', { timeout: DEFAULT_TIMEOUT_IN_MS });

    /**
     * Group583
     * West-East Transition (2)
     * In this widget only a value should be changed, to see if the save action of the page is possible
     */
    cy.log('West-East Transition (2)');
    EditDashboardPage.selectWidget('group583');
    cy.get('[data-cy="opr_latitude_1"]').click().clear().type('0');
    cy.get('[data-cy="wrong-orientation-of-reference-points"]').should('not.be.visible');
    cy.get('[data-cy="apply-button"]').should('not.be.disabled');

    /**
     * Group504
     * North-South Transition (2)
     * In this widget the map reference point 1 is right of map reference point 2, but should be left of map reference point 2.
     * So, the user should not be able to save the widget
     */
    cy.log('North-South Transition (2)');
    EditDashboardPage.selectWidget('group504');
    cy.get('[data-cy="wrong-orientation-of-reference-points"]').should('be.visible');
    cy.get('[data-cy="apply-button"]').should('be.disabled');
  });

  after(() => {
    cy.bvdLogout();
    dataCollector.deleteAllQueries();
    dashboard.dashboardDelete(dashboardName);
  });
});
