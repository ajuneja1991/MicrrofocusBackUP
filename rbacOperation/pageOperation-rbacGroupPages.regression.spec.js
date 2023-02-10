/* eslint-disable camelcase */
const shared = require('../../../shared/shared');

import 'cypress-file-upload';
import { uploadFileRequest } from '../../../../../support/reporting/restUtils/uploadFile';
const dataCollector = require('../../../../../support/reporting/restUtils/dataCollector');
let bvdURL = '';
const role = require('../../../../../support/reporting/restUtils/role');
const nonAdminuserName = 'test';
const nonAdminuserPwd = 'control@123D';
const tagA = 'TagGroupA';
const tagB = 'TagGroupB';
const tagC = 'TagGroupC';
const tagD = 'TagGroupD';
const tagNoAccess = 'NoGroupAccess';
const testRole = {
  name: 'testRole',
  description: 'testRole'
};

function createKnownTag(tagName, tagValue, cb) {
  const knownTagURL = `/rest/${Cypress.env('API_VERSION')}/tagVal/${tagName}/${tagValue}`;
  cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'POST',
        url: knownTagURL,
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      }).then(response => {
        expect(response.status).to.equal(200);
        cb(response);
      });
    });
  });
}

function createTag(group, ref, cb) {
  const apiTag = `/rest/${Cypress.env('API_VERSION')}/tag`;
  cy.request('GET', `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'POST',
        url: apiTag,
        body: [{
          name: '__rbac',
          value: group,
          ref,
          refType: 'page'
        }],
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      }).then(response => {
        expect(response.status).to.equal(200);
        cb(response);
      });
    });
  });
}

function deleteKnownTag(name, value, cb) {
  cy.getCookie('secureModifyToken').then(val => {
    cy.request({
      method: 'DELETE',
      url: `/rest/${Cypress.env('API_VERSION')}/tagVal/${name}/${value}`,
      headers: {
        'x-secure-modify-token': val.value
      }
    }).then(response => {
      expect(response.status).to.equal(200);
      cb(response);
    });
  });
}

const clickOutside = function() {
  cy.get('.cdk-overlay-connected-position-bounding-box');
  cy.get('body').click(0, 0);
};

describe('Page Operations - Ability to select a RBAC group when creating a new or editing definition', shared.defaultTestOptions, () => {
  bvdURL = shared.getBaseUrlForRequest(Cypress.config().baseUrl);
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/*`
    }).as('getPage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({ method: 'POST', url: `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dataCollector` }).as('postDataCollector');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector/channel`
    }).as('getChannelInfo');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/channel/state`
    }).as('getChannelStateResponse');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/dataCollector?type=dataQueries`
    }).as('getDataCollectors');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/pgmt_save`
    }).as('getSave');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/widgets/pgmt_save_as`
    }).as('getSaveAs');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/tagVal/*`
    }).as('getTags');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages`
    }).as('postPages');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/tag`
    }).as('postTags');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/tag/*`
    }).as('deleteTags');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/tag?ref*`
    }).as('getTagRef');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('deletePage');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/menuEntries?filter=pages`
    }).as('getMenuEntries');
    cy.intercept({
      method: 'PUT',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/*`
    }).as('putPages');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/markUpText*`
    }).as('getMarkUpTextPage');
    cy.bvdLogin();
    shared.deleteRole(testRole);
  });

  before(() => {
    cy.bvdLogout();
    cy.bvdLogin();
    uploadFileRequest('foundation/bvdOnUIF/markDownTextDC.bvddc', `${bvdURL}/rest/${Cypress.env('API_VERSION')}/dataCollector`, 1, 'dataCollectorsFile');
    createKnownTag('__rbac', tagA, tagResA => {
      expect(tagResA.status).to.equal(200);
      createKnownTag('__rbac', tagB, tagResB => {
        expect(tagResB.status).to.equal(200);
        createKnownTag('__rbac', tagC, tagResC => {
          expect(tagResC.status).to.equal(200);
          createKnownTag('__rbac', tagNoAccess, tagResNA => {
            expect(tagResNA.status).to.equal(200);
            createKnownTag('__rbac', tagD, tagResD => {
              expect(tagResD.status).to.equal(200);
            });
          });
        });
      });
    });
  });

  after(() => {
    cy.bvdLogout();
    cy.bvdLogin();
    shared.deleteRole(testRole);
    dataCollector.deleteAllQueries(bvdURL);
    deleteKnownTag('__rbac', tagA, tagAResponse => {
      expect(tagAResponse.status).to.equal(200);
      deleteKnownTag('__rbac', tagB, tagBResponse => {
        expect(tagBResponse.status).to.equal(200);
        deleteKnownTag('__rbac', tagC, tagCResponse => {
          expect(tagCResponse.status).to.equal(200);
          deleteKnownTag('__rbac', tagNoAccess, tagNAResponse => {
            expect(tagNAResponse.status).to.equal(200);
            deleteKnownTag('__rbac', tagD, tagDResponse => {
              expect(tagDResponse.status).to.equal(200);
            });
          });
        });
      });
    });
  });

  it(`Users with 'AssignPages' page permission to group A should see only group A in the dropdown`, () => {
    const pageID = 'uiTestDSProxyDC';
    // delete the __rbac tag associated with this page
    deleteKnownTag('__rbac', tagA, tagAResponse => {
      expect(tagAResponse.status).to.equal(200);
      createKnownTag('__rbac', tagA, tagResA => {
        expect(tagResA.status).to.equal(200);
        cy.visit(`/${pageID}`);
        shared.waitForDataCalls({ name: '@getTOC', count: 2 });
        shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 4 });
        shared.waitForDataCalls({ name: '@getChannelInfo', count: 4 });
        cy.get('[data-cy=page-action-button]').click();
        cy.get('[data-cy="page-action-item-save"]').click();
        cy.wait(['@getSave', '@getTOC', '@getTags']);
        cy.get('[placeholder="Type to search"]').click().type(tagA);
        cy.get('ux-typeahead-options-list').contains(tagA).click();
        cy.get('[data-cy="pgmt-properties-definition-description"]').type('group A page');
        cy.get('[data-cy="submit-button"]').should('not.be.disabled');
        cy.get('[data-cy="submit-button"]').click();
        cy.wait(['@putPages', '@postTags']);
        cy.bvdCheckToast(` Update of the definition was successful `);
        cy.bvdUiLogout();
        const permissionArrayWithAssignPages = [{ operation_key: 'FullControl',
          resource_key: 'menu<>All' },
        {
          operation_key: 'exec',
          resource_key: 'action<>All'
        },
        {
          operation_key: 'View',
          resource_key: `default_action<>Group-${tagA}`
        },
        {
          operation_key: 'Modify',
          resource_key: `default_action<>Group-${tagA}`
        },
        {
          operation_key: 'Create',
          resource_key: `default_action<>Group-${tagA}`
        },
        {
          operation_key: 'AssignPages',
          resource_key: `default_action<>Group-${tagA}`
        }];
        cy.bvdLogout();
        role.roleCreationWithPermissionArray(testRole.name, testRole.description, permissionArrayWithAssignPages, false).then(() => {
          cy.visit('/');
          shared.waitForDataCalls({ name: '@getTOC', count: 2 });
          cy.bvdUiLogout();
          cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
          cy.visit('/uiTestDSProxyDC');
          shared.waitForDataCalls({ name: '@getTOC', count: 1 });
          cy.wait(['@getMenuEntries', '@getPage']);
          shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 4 });
          shared.waitForDataCalls({ name: '@getChannelInfo', count: 4 });
          cy.get('[data-cy=page-action-button]').click();
          cy.get('[data-cy=page-action-item-save]').click();
          cy.wait(['@getSave', '@getTOC', '@getTagRef']);
          cy.wait('@getTags');
          cy.get('ux-tag-input>ol>li>span').contains(tagA).should('be.visible');
          cy.get('ux-tag-input>ol>li>span').eq(0).siblings('button').click();
          // cy.get('[data-cy=addGroup]').click();
          cy.get('ux-tag-input>ol>li>input').click();
          cy.get('[class="ux-typeahead-options"]').last().find('li').should('have.length', 1);
          // cy.get('[data-cy=addGroup]').click();
          cy.get('ux-typeahead-options-list').contains(tagA).click();
          cy.get('ux-tag-input>ol>li>span').should('have.text', tagA);
          cy.get('ux-tag-input>ol>li>span').eq(0).siblings('button').click();
          cy.get('[data-cy=cancel-button]').click();
          cy.bvdUiLogout();
        });
      });
    });
  });

  it(`Non-admin users without 'AssignPages' pages permission should not see assigning Definition Group option`, () => {
    const pageID = 'uiTestDSProxyDC';
    createTag(tagNoAccess, pageID, pageSaveRes => {
      expect(pageSaveRes.status).to.equal(200);
    });

    const permissionArrayWithoutAssignPages = [
      { operation_key: 'View',
        resource_key: `default_action<>Group-${tagNoAccess}` },
      { operation_key: 'Modify',
        resource_key: `default_action<>Group-${tagNoAccess}` },
      {
        operation_key: 'FullControl',
        resource_key: 'menu<>All'
      },
      {
        operation_key: 'exec',
        resource_key: 'action<>All'
      }
    ];
    cy.bvdLogout();
    role.roleCreationWithPermissionArray(testRole.name, testRole.description, permissionArrayWithoutAssignPages, false).then(() => {
      cy.visit('/');
      shared.waitForDataCalls({ name: '@getTOC', count: 2 });
      cy.bvdUiLogout();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      cy.visit('/');
      shared.waitForDataCalls({ name: '@getTOC', count: 1 });
      cy.get('.ux-side-menu-toggle-icon').click();
      cy.get('[data-cy="navigation-category-T2"]').click();
      cy.get('[data-cy=navigation-category-T7]').click();
      shared.waitForDataCalls({ name: '@getTOC', count: 1 });
      cy.get('[data-cy*=navigation-menuEntry]').should('have.length', 1);
      cy.get('[data-cy*="thirdLevelItem"]').click();
      shared.waitForDataCalls({ name: '@getTOC', count: 1 });
      cy.wait(['@getMenuEntries', '@getPage']);
      shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 4 });
      shared.waitForDataCalls({ name: '@getChannelInfo', count: 4 });
      cy.location('pathname').should('include', `/${pageID}`);
      cy.get('[data-cy=leftCaret]').click();
      cy.get('[data-cy=page-action-button]').click();
      cy.get('[data-cy=page-action-item-save] > .dropdown-menu-text').click();
      cy.wait(['@getSave', '@getTOC']);
      cy.get('[data-cy=pgmt-checkbox-definition]').click();
      cy.wait(['@getTags']);
      cy.get('[data-cy="panel-widget-pgmt_save"]').scrollTo('bottom');
      cy.get('[data-cy="RbacGroupDropdownLabel"]').should('not.exist');
      cy.get('[data-cy="help-rbac-group"]').should('not.exist');
      cy.get('[data-cy=cancel-button]').click();
      cy.bvdUiLogout();
    });
  });

  // Skipping the test due to an existing defect https://internal.almoctane.com/ui/entity-navigation?p=97002/8001&entityType=work_item&id=1741432
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip(`If the user has multiple groups then user should be able to assign multiple groups`, () => {
    const pageID1 = 'TestDSProxyDefaultValue';
    const pageID2 = 'uiTestCPPageWithDC';
    const pageID3 = 'markUpText';
    createTag(tagA, pageID1, pageSaveRes1 => {
      expect(pageSaveRes1.status).to.equal(200);
      createTag(tagB, pageID2, pageSaveRes2 => {
        expect(pageSaveRes2.status).to.equal(200);
        createTag(tagC, pageID3, pageSaveRes3 => {
          expect(pageSaveRes3.status).to.equal(200);
        });
      });
    });

    const permissionArrayWithAssignPages = [{ operation_key: 'FullControl',
      resource_key: 'menu<>All' },
    {
      operation_key: 'exec',
      resource_key: 'action<>All'
    },
    {
      operation_key: 'View',
      resource_key: `default_action<>Group-${tagA}`
    },
    {
      operation_key: 'Modify',
      resource_key: `default_action<>Group-${tagA}`
    },
    {
      operation_key: 'AssignPages',
      resource_key: `default_action<>Group-${tagA}`
    },
    {
      operation_key: 'View',
      resource_key: `default_action<>Group-${tagB}`
    },
    {
      operation_key: 'Modify',
      resource_key: `default_action<>Group-${tagB}`
    },
    {
      operation_key: 'AssignPages',
      resource_key: `default_action<>Group-${tagB}`
    },
    {
      operation_key: 'View',
      resource_key: `default_action<>Group-${tagC}`
    },
    {
      operation_key: 'Modify',
      resource_key: `default_action<>Group-${tagC}`
    }];

    cy.bvdLogout();
    role.roleCreationWithPermissionArray(testRole.name, testRole.description, permissionArrayWithAssignPages, false).then(() => {
      cy.visit('/');
      shared.waitForDataCalls({ name: '@getTOC', count: 2 });
      cy.bvdUiLogout();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      cy.visit('/');
      shared.waitForDataCalls({ name: '@getTOC', count: 2 });
      cy.get('.ux-side-menu-toggle-icon').click();
      cy.get('[data-cy="navigation-category-T2"]').click();
      cy.get('[data-cy=navigation-category-T7]').click();
      cy.get('[data-cy*=navigation-menuEntry]').should('have.length', 3);
      cy.get(`[data-cy="thirdLevelItem-${pageID1}"]`).click();
      shared.waitForDataCalls({ name: '@getTOC', count: 1 });
      shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 1 });
      shared.waitForDataCalls({ name: '@getChannelInfo', count: 1 });
      cy.get('[data-cy=page-action-button]').click();
      cy.get('[data-cy="page-action-item-save"]').click();
      cy.wait(['@getSave', '@getTOC']);
      cy.get('[data-cy=pgmt-checkbox-definition]').click();
      cy.wait('@getTags');
      cy.get('[data-cy="panel-widget-pgmt_save"]').scrollTo('bottom');
      cy.get('ux-tag-input>ol>li>span').contains(tagA).should('be.visible');
      cy.get('ux-tag-input>ol>li>span').eq(0).siblings('button').click();

      cy.get('[data-cy=addGroup]').click();
      cy.get('[data-cy="panel-widget-pgmt_save"]').scrollTo('bottom');
      cy.get('[class="ux-typeahead-options"]').last().find('li').should('have.length', 2);
      cy.get('[data-cy=addGroup]').click();
      cy.get('ux-typeahead-options-list').contains(tagB).click();

      cy.get('[data-cy="submit-button"]').click();
      cy.wait('@postTags');
      cy.bvdCheckToast(` Update of the definition was successful `);
      cy.get('div[role="alert"]').should('not.exist');

      cy.get('[data-cy="navigation-category-T2"]').click();
      cy.get('[data-cy=navigation-category-T7]').click();
      cy.get('[data-cy*=navigation-menuEntry]').should('have.length', 3);
      cy.get(`[data-cy="thirdLevelItem-${pageID2}"]`).click();
      shared.waitForDataCalls({ name: '@getTOC', count: 1 });
      shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 3 });
      shared.waitForDataCalls({ name: '@getChannelInfo', count: 3 });
      cy.get('[data-cy=page-action-button]').click();
      cy.get('[data-cy=page-action-item-save] > .dropdown-menu-text').click();
      cy.wait(['@getSave', '@getTOC']);
      cy.get('[data-cy=pgmt-checkbox-definition]').click();
      cy.wait('@getTags');
      cy.get('[data-cy="panel-widget-pgmt_save"]').scrollTo('bottom');
      cy.get('ux-tag-input>ol>li>span').contains(tagB).should('be.visible');
      cy.get('ux-tag-input>ol>li>span').eq(0).siblings('button').click();
      cy.get('[data-cy=addGroup]').click();
      cy.get('[class="ux-typeahead-options"]').last().find('li').should('have.length', 2);
      cy.get('[data-cy=addGroup]').click();
      cy.contains(tagA).click();
      cy.get('[id*=ux-select-3-typeahead-option]>span').contains(tagA).parent().should('have.class', 'disabled');
      cy.get('ux-tag-input>ol>li>span').should('have.text', tagA);
      cy.get('[data-cy="submit-button"]').click();
      cy.bvdCheckToast(` Update of the definition was successful `);
      cy.get('div[role="alert"]').should('not.exist');
      cy.bvdUiLogout();
      cy.bvdLogin();
      cy.visit(`/${pageID1}`);
      shared.waitForDataCalls({ name: '@getTOC', count: 1 });
      shared.waitForDataCalls({ name: '@getPage', count: 1 });
      cy.get('[data-cy=page-action-button]').click();
      cy.get('[data-cy="page-action-item-save"]').click();
      cy.wait(['@getSave', '@getTOC']);
      cy.get('[data-cy=pgmt-checkbox-definition]').click();
      cy.wait(['@getTags']);
      cy.get('[data-cy="panel-widget-pgmt_save"]').scrollTo('bottom');
      cy.get('ux-tag-input>ol>li>span').eq(0).siblings('button').click();
      cy.get('[data-cy="submit-button"]').click();
      cy.bvdCheckToast(` Update of the definition was successful `);
      cy.wait(['@putPages']);
      cy.bvdUiLogout();
    });
  });

  it(`Users with permission defined on only group A should see only pages in group A.`, () => {
    const pageID1 = 'testMetricBoxWidget';
    const pageID2 = 'TestDSProxyWithParams';
    const tagPage1 = 'tagPages1';
    const tagPage2 = 'tagPages2';

    createKnownTag('__rbac', tagPage1, tagResB => {
      expect(tagResB.status).to.equal(200);
      createKnownTag('__rbac', tagPage2, tagResC => {
        expect(tagResC.status).to.equal(200);
      });
    });

    createTag(tagPage1, pageID1, pageSaveRes1 => {
      expect(pageSaveRes1.status).to.equal(200);
      createTag(tagPage2, pageID2, pageSaveRes2 => {
        expect(pageSaveRes2.status).to.equal(200);
      });
    });

    const permissionArrayWithAssignPages = [{
      operation_key: 'FullControl',
      resource_key: 'menu<>All'
    },
    {
      operation_key: 'exec',
      resource_key: 'action<>All'
    },
    {
      operation_key: 'View',
      resource_key: `default_action<>Group-${tagPage1}`
    },
    {
      operation_key: 'AssignPages',
      resource_key: `default_action<>Group-${tagPage1}`
    }];

    cy.bvdLogout();
    role.roleCreationWithPermissionArray(testRole.name, testRole.description, permissionArrayWithAssignPages, false).then(() => {
      cy.visit('/');
      shared.waitForDataCalls({ name: '@getTOC', count: 2 });
      cy.bvdUiLogout();
      cy.bvdLogin(nonAdminuserName, nonAdminuserPwd);
      cy.visit('/');
      shared.waitForDataCalls({ name: '@getTOC', count: 2 });
      cy.get('.ux-side-menu-toggle-icon').click();
      cy.get('[data-cy="navigation-category-T2"]').click();
      cy.get('[data-cy=navigation-category-T7]').click();
      cy.get('[data-cy*=navigation-menuEntry]').should('have.length', 1);
      cy.get(`[data-cy="thirdLevelItem-testDesignerWidgets"]`).should('be.visible').click();
      shared.waitForDataCalls({ name: '@getTOC', count: 1 });
      shared.waitForDataCalls({ name: '@getChannelStateResponse', count: 1 });
      shared.waitForDataCalls({ name: '@getChannelInfo', count: 1 });
      cy.location('pathname').should('include', `/${pageID1}`);
      cy.get('[data-cy=page-action-button]').click();
      cy.get('[data-cy="page-action-item-save"]').should('not.exist');
      clickOutside();
      cy.get(`[data-cy="thirdLevelItem-${pageID2}"]`).should('not.exist');
      cy.visit(`/${pageID2}`);
      shared.waitForDataCalls({ name: '@getTOC', count: 1 });
      cy.get('[data-cy="modal-title"]').should('have.text', 'UNAUTHORIZED');
      cy.get('[data-cy=mondrianModalDialogButton]').click();
      shared.waitForDataCalls({ name: '@getTOC', count: 1 });
      cy.bvdUiLogout();
    });
  });
});
