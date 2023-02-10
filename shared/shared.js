import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { find } from 'ramda';

const SIDE_PANEL_SIZES = require('../../../../../../uis/apps/uif/shell/src/app/mondrian/right-side-panel/SidePanelTypes.ts').SIDE_PANEL_SIZES;

const apiPages = `/rest/${Cypress.env('API_VERSION')}/pages`;
const apiRole = `/rest/${Cypress.env('API_VERSION')}/role`;
const apiAppConfig = `/rest/${Cypress.env('API_VERSION')}/appConfig/MyApp`;
const apiCategories = `/rest/${Cypress.env('API_VERSION')}/categories`;
const apiMenuEntries = `/rest/${Cypress.env('API_VERSION')}/menuEntries`;
const apiNotifications = `/rest/${Cypress.env('API_VERSION')}/notification`;

const getDateTimeLocalized = dateTimeString => {
  const offSet = new Date().getTimezoneOffset();
  const parsedDateTime = Date.parse(dateTimeString);
  const localizedDateTime = parsedDateTime + (offSet * 60 * 1000);
  cy.log(`Offset: ${offSet}, Localized Date Time: ${localizedDateTime}`);
  return localizedDateTime.toString();
};

const getExploreRootContext = () => Cypress.env('EXPLORE_CONTEXT_ROOT') || '/ui';
const getReportingContextRoot = () => Cypress.env('BVD_CONTEXT_ROOT') || '/reporting';
const getWebtoPDFContextRoot = () => Cypress.env('WEBTOPDF_CONTEXT_ROOT') || '/webtopdf';

function createMenuEntry(name, categoryName, categoryId) {
  cy.intercept({
    method: 'GET',
    path: `${getExploreRootContext()}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
  }).as('getToc');
  cy.get('[data-cy="page-action-button"]').click();
  cy.get('[data-cy="page-action-item-addMenuEntry"]').click();
  cy.get('h2').contains('Add To Menu');
  cy.wait('@getToc');
  cy.get('[data-cy="addToMenuOkButton"]').should('be.disabled');
  cy.get('[data-cy="addToMenuCancelButton"]').should('be.not.disabled');
  cy.get('[data-cy="menuTitle"]').type(name);
  cy.get('[data-cy="categoryDropdownButton"]').find('.ux-select-icons').click();
  cy.get('.filter-container').find('[aria-label*="Type to search"]').type(categoryName);
  cy.get(`[data-cy="${categoryId}"]`).click();
  cy.intercept({
    method: 'POST',
    path: getExploreRootContext().concat(apiMenuEntries)
  }).as('AddMenuEntry');
  cy.get('[data-cy="addToMenuOkButton"]').click();
  cy.wait(['@AddMenuEntry', '@getToc']);
  cy.bvdCheckToast('Menu entry added successfully');
}

function createMenuEntryAPI(title, categoryId, pageId, cb) {
  const menuEntry = { title, categoryId, pageId };
  cy.getCookie('secureModifyToken').then(val => {
    cy.request({
      method: 'POST',
      url: apiMenuEntries,
      body: menuEntry,
      headers: {
        'X-Secure-Modify-Token': val.value
      }
    }).then(response => {
      const menuEntryResponse = response.body.data[0];
      console.log('result create menuEntry', menuEntryResponse);
      cb(menuEntryResponse);
    });
  });
}

function deletePages(pages) {
  cy.request('GET', apiPages).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'GET',
        url: apiPages,
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      }).then(response => {
        const resultPages = response.body.data;
        pages.forEach(pageId => {
          const pageObject = resultPages.find(item => item.id === pageId);
          if (pageObject) {
            cy.request({
              method: 'DELETE',
              url: `${apiPages}/${pageId}`,
              headers: {
                'X-Secure-Modify-Token': val.value
              }
            });
          } else {
            cy.log(pageId, ' already removed');
          }
        });
      });
    });
  });
}

function uploadPage(page) {
  cy.request('GET', apiPages).then(response => {
    const resultPages = response.body.data;
    if (find(pageRes => pageRes.id === page.id, resultPages)) {
      cy.log('Page already exists, hence skipping upload');
    } else {
      cy.log('Uploading page');
      cy.getCookie('secureModifyToken').then(val => {
        cy.request({
          method: 'POST',
          url: apiPages,
          body: [page],
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(pageUploadRes => {
          expect(pageUploadRes.status).to.equal(200);
        });
      });
    }
  });
}

function updatePage(page) {
  cy.getCookie('secureModifyToken').then(val => {
    cy.request({
      method: 'PUT',
      url: `${apiPages}/${page.id}`,
      body: page,
      headers: {
        'X-Secure-Modify-Token': val.value,
        accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(pageUploadRes => {
      expect(pageUploadRes.status).to.equal(200);
    });
  });
}

function updateMenuEntry(menuEntry) {
  cy.getCookie('secureModifyToken').then(val => {
    cy.request({
      method: 'PUT',
      url: `${apiMenuEntries}/${menuEntry.id}`,
      body: menuEntry,
      headers: {
        'X-Secure-Modify-Token': val.value,
        accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(menuEntryUploadRes => {
      expect(menuEntryUploadRes.status).to.equal(200);
    });
  });
}

function deleteMenuEntry(menuEntryId) {
  cy.getCookie('secureModifyToken').then(val => {
    if (menuEntryId) {
      cy.request({
        method: 'DELETE',
        url: `${apiMenuEntries}/${menuEntryId}`,
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      });
      cy.log('menu entry deleted');
    } else {
      cy.log('menu entry already removed, or not found');
    }
  });
}

function createNewPage(pageId, title, tags, view, cb) {
  const defaultView = { type: 'mashup', options: { dashboardOptions: { columns: 12, rowHeight: 400 }}, views: []};
  const newPage = {
    id: pageId,
    title,
    view: view || defaultView
  };
  if (tags) {
    newPage.tags = tags;
  }
  cy.request('GET', apiPages).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'POST',
        url: apiPages,
        body: [newPage],
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      }).then(response => {
        console.log(response);
        cb(response);
      });
    });
  });
}

function testForRole(role, cb) {
  const nonAdminUserName = 'test';
  const nonAdminUserPwd = 'control@123D';
  cy.request('GET', apiAppConfig).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'POST',
        url: apiRole,
        body: role,
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      }).then(response => {
        expect(response.body.role.name).to.equal(role.name);
        expect(response.body.role.description).to.equal(role.description);

        cy.bvdLogout();
        cy.bvdLogin(nonAdminUserName, nonAdminUserPwd);
        cb(response.body.role.id);
      });
    });
  });
}

function deleteRole(roleData) {
  cy.request('GET', apiAppConfig).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'GET',
        url: apiRole,
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      }).then(response => {
        const roles = response.body.role_list.role;
        cy.log(JSON.stringify(roles));
        if (roles.length > 0) {
          roles.forEach(role => {
            if (role.name === roleData.name) {
              cy.request({
                method: 'DELETE',
                url: `${apiRole}/${role.id}`,
                headers: {
                  'X-Secure-Modify-Token': val.value
                }
              }).then(resp => {
                if (resp.status === 200) {
                  cy.log('Role removed successfully', roleData.name);
                }
                if (resp.status !== 200) {
                  cy.log('Failed to remove the role', roleData.name);
                }
              });
            }
          });
        } else {
          cy.log('No roles found');
        }
      });
    });
  });
}

function createNewCategory(categoryData, cb) {
  cy.request('GET', apiCategories).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'POST',
        url: apiCategories,
        body: categoryData,
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      }).then(response => {
        console.log(response);
        cb(response);
      });
    });
  });
}

function deleteCategory(categoryData, cb) {
  cy.request('GET', apiCategories).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'GET',
        url: apiCategories,
        body: categoryData,
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      }).then(response => {
        const categories = response.body.data;
        const categoryToBeDeleted = categories.find(item => item.id === categoryData.id);
        cy.request({
          method: 'DELETE',
          url: `${apiCategories}/${categoryToBeDeleted.id}`,
          headers: {
            'X-Secure-Modify-Token': val.value
          }
        }).then(res => {
          cb(res);
        });
      });
    });
  });
}

function createRole(role) {
  cy.request('GET', apiAppConfig).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'POST',
        url: apiRole,
        body: role,
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      }).then(response => {
        expect(response.status).to.equal(200);
      });
    });
  });
}

function createAppConfig(appConfig) {
  // creating the appConfig if it does not exist in the system in order to avoid unique constraints error if the test fails
  cy.request('GET', apiAppConfig).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'GET',
        url: `/rest/${Cypress.env('API_VERSION')}/appConfig/`,
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      }).then(installedAppConfigsResponse => {
        const installedAppConfigsId = installedAppConfigsResponse?.body?.data?.map(appCfg => appCfg.id);
        if (installedAppConfigsId?.indexOf(appConfig.app.id) === -1) {
          cy.request({
            method: 'POST',
            url: `/rest/${Cypress.env('API_VERSION')}/appConfig`,
            body: appConfig,
            headers: {
              'X-Secure-Modify-Token': val.value
            }
          }).then(appCfgResponse => {
            expect(appCfgResponse.status).to.equal(200);
          });
        }
      });
    }).then(appConfigResponse => {
      expect(appConfigResponse.status).to.equal(200);
    });
  });
}

function updateAppConfig(updatedAppConfig, cb) {
  cy.getCookie('secureModifyToken').then(val => {
    cy.request({
      method: 'PUT',
      url: apiAppConfig,
      body: updatedAppConfig,
      headers: {
        'X-Secure-Modify-Token': val.value
      }
    }).then(appConfigResponse => {
      expect(appConfigResponse.status).to.equal(200);
      cb();
    });
  });
}

function getAppConfig(cb) {
  cy.getCookie('secureModifyToken').then(val => {
    cy.request({
      method: 'GET',
      url: apiAppConfig,
      headers: {
        'X-Secure-Modify-Token': val.value
      }
    }).then(appConfigResponse => {
      expect(appConfigResponse.status).to.equal(200);
      cb(appConfigResponse);
    });
  });
}

function deleteAppConfig(appConfig) {
  // deleting the appConfig only if it exists in the system in order to avoid unique constraints error if the test fails
  cy.request('GET', apiAppConfig).then(() => {
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'GET',
        url: `/rest/${Cypress.env('API_VERSION')}/appConfig/`,
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      }).then(installedAppConfigsResponse => {
        const installedAppConfigsId = installedAppConfigsResponse?.body?.data?.map(appCfg => appCfg.id);
        if (installedAppConfigsId?.indexOf(appConfig) !== -1) {
          cy.request({
            method: 'DELETE',
            url: `/rest/${Cypress.env('API_VERSION')}/appConfig/${appConfig}`,
            headers: {
              'X-Secure-Modify-Token': val.value
            }
          }).then(appCfgResponse => {
            expect(appCfgResponse.status).to.equal(200);
          });
        }
      });
    });
  });
}

function waitForDataCalls({ name, count }) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push(name);
  }
  cy.wait(data);
}

function addToMenu({ menuEntryTitle, category, icon, numberOfDataCalls }) {
  cy.intercept({
    method: 'GET',
    path: `${getExploreRootContext()}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
  }).as('getTOC');
  cy.intercept({
    method: 'POST',
    path: `${getExploreRootContext()}/rest/${Cypress.env('API_VERSION')}/menuEntries`
  }).as('saveMenuEntry');
  cy.get('[data-cy="page-action-button"]').click();
  cy.get('[data-cy="page-action-item-addMenuEntry"]').click();
  cy.wait('@getTOC');
  cy.get('h2').contains('Add To Menu');
  cy.get('[data-cy="addToMenuOkButton"]').should('be.disabled');
  cy.get('[data-cy="addToMenuCancelButton"]').should('be.not.disabled');
  cy.get('[data-cy="menuTitle"]').clear().type(menuEntryTitle);
  if (icon) {
    cy.get('#icon').click();
    cy.get(`button > span > i.${icon}`).click();
  }
  cy.get('[data-cy="categoryDropdownButton"]').find('.ux-select-icons').click();
  cy.get('tree-node-collection').find('tree-node');
  cy.get('.filter-container').find('[aria-label*="Type to search"]').type(category);
  cy.get('tree-node-collection').find('tree-node').its('length').should('be.eq', 2);
  cy.get('tree-node').first().find('span').contains(category).click();
  cy.get('[data-cy="addToMenuOkButton"]').click();
  cy.wait('@saveMenuEntry');
  cy.bvdCheckToast('Menu entry added successfully');
  cy.wait(['@getTOC', '@getTOC']);
  if (numberOfDataCalls) {
    waitForDataCalls({ name: '@getData', count: numberOfDataCalls });
  }
}

const visitPage = (url = '', numberOfDataCalls = 0, pageWaitAlias) => {
  cy.visit(url);
  cy.wait([`@${pageWaitAlias}`]);
  waitForDataCalls({ name: '@getChannelInfo', count: numberOfDataCalls });
  waitForDataCalls({ name: '@getChannelStateResponse', count: numberOfDataCalls });
};

const defaultTestOptions = {
  defaultCommandTimeout: 10000,
  execTimeout: 120000,
  requestTimeout: 30000,
  responseTimeout: 60000
};

const defaultIdmOptions = {
  baseUrl: Cypress.env('IDM_BASE_URL'),
  defaultCommandTimeout: 10000,
  execTimeout: 120000,
  requestTimeout: 30000,
  responseTimeout: 60000,
  retries: { runMode: 0, openMode: 0 }
};

dayjs.extend(utc);
function getNotification(type = 'warning', notificationMessage = 'Welcome-PDF is not ready',
  notificationTitle = 'PDF EXPORT-- WAIT', notificationIcon = 'qtm-icon-warning') {
  const newTime = dayjs(new Date()).add(7, 'day').utc().format();
  return {
    data: {
      messageType: type,
      message: notificationMessage,
      title: notificationTitle,
      icon: notificationIcon
    },
    expiresAt: newTime
  };
}

function createSingleNotification(notification) {
  cy.getCookie('secureModifyToken').then(val => {
    cy.request({
      method: 'POST',
      url: apiNotifications,
      body: notification,
      headers: {
        'X-Secure-Modify-Token': val.value
      }
    }).then(response => {
      expect(response.status).to.equal(200);
      expect(response.body.data._id).to.be.not.null;
    });
  });
}

function deleteNotifications() {
  cy.request('GET', apiNotifications).then(result => {
    const notifications = [];
    result.body.data.forEach(item => notifications.push(item._id));
    cy.getCookie('secureModifyToken').then(val => {
      cy.request({
        method: 'DELETE',
        url: apiNotifications,
        body: notifications,
        headers: {
          'X-Secure-Modify-Token': val.value
        }
      });
    });
  });
}

const getBaseUrlForRequest = baseUrl => {
  baseUrl = baseUrl.split(Cypress.env('EXPLORE_CONTEXT_ROOT'));
  baseUrl = `${baseUrl[0]}${Cypress.env('BVD_CONTEXT_ROOT')}`;
  if (Cypress.env('TestEnvironment') === 'development') {
    baseUrl = baseUrl.replace(Cypress.env('EXPLORE_SERVER_PORT'), Cypress.env('BVD_SERVER_PORT'));
  }
  return baseUrl;
};

function checkTenantInUrl(urlString) {
  const urlObject = new URL(urlString);
  const tenantName = urlObject.searchParams.get('tenant');
  expect(tenantName).equal('Provider');
}

function getSidePanelSizeDefinition(size, property) {
  const sizeConfig = SIDE_PANEL_SIZES.find(item => item.size === size);
  return Number(sizeConfig[property].replace(/\D/g, ''));
}

function addToPageIDs(pageIDsArray) {
  cy.url().then(url => {
    const urlObject = new URL(url);
    pageIDsArray.push(urlObject.pathname.split('/')[2]);
  });
}

module.exports = {
  defaultTestOptions,
  defaultIdmOptions,
  getDateTimeLocalized,
  createMenuEntry,
  createMenuEntryAPI,
  deleteMenuEntry,
  deletePages,
  createNewPage,
  testForRole,
  deleteRole,
  createNewCategory,
  deleteCategory,
  createRole,
  createAppConfig,
  updateAppConfig,
  getAppConfig,
  deleteAppConfig,
  addToMenu,
  getNotification,
  createSingleNotification,
  deleteNotifications,
  waitForDataCalls,
  uploadPage,
  updateMenuEntry,
  updatePage,
  exploreContextRoot: getExploreRootContext(),
  reportingContextRoot: getReportingContextRoot(),
  webtopdfContextRoot: getWebtoPDFContextRoot(),
  getBaseUrlForRequest,
  checkTenantInUrl,
  visitPage,
  getSidePanelSizeDefinition,
  addToPageIDs
};
