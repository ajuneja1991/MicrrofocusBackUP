import getToken from '../support/reporting/restUtils/getXAuthToken';
const idmFullUrl = `${Cypress.env('IDM_BASE_URL')}/idm-service/v3.0/tokens`;

Cypress.Commands.add('iframeCustom', { prevSubject: 'element' }, $iframe => new Cypress.Promise(resolve => {
  setTimeout(() => {
    $iframe.ready(() => {
      resolve($iframe.contents().find('body'));
    });
  }, 1000);
}));

/* log into BVD with user and passwd */
Cypress.Commands.add('bvdLogin', (user, passwd, timeout = 30000) => {
  const request = {
    method: 'GET',
    // Default is responseTimeout=30000
    timeout
  };
  if (Cypress.env('TestEnvironment') === 'development') {
    request.url = `/rest/${Cypress.env('API_VERSION')}/system`;
  } else {
    request.url = '/';
  }

  cy.wrap(getToken(idmFullUrl, user, passwd)).then(token => {
    request.headers = {
      'x-auth-token': token
    };
    cy.request(request);
  });
});

/* Setting for Print mode */
Cypress.Commands.add('setCssMedia', media => {
  cy.log(`Setting CSS media to ${media}`);
  Cypress.automation('remote:debugger:protocol', {
    command: 'Emulation.setEmulatedMedia',
    params: {
      media
    }
  });
});

/* logout current user */
Cypress.Commands.add('bvdLogout', () => {
  cy.clearCookies();
});

/* helps that the session cookie will not be cleared before each test */
Cypress.Commands.add('preserveSessionCookie', () => {
  Cypress.Cookies.preserveOnce('bvd.session');
});

/* login using the UI */
Cypress.Commands.add('bvdUiLogin', () => {
  cy.get('input[id*="user"]').click().type(Cypress.env('username'));
  cy.get('#password').click().type(Cypress.env('password'));
  cy.get('button[id*="submit"]').click();
});

/* logout using the UI */
Cypress.Commands.add('bvdUiLogout', () => {
  cy.get('[data-cy=user-button]').click();
  cy.get('[data-cy=user-logout]').click();
  if (Cypress.env('TestEnvironment') !== 'development') {
    cy.get('#button').contains('Log In').click();
  }
  cy.location('pathname').should('include', '/idm-service');
});

function expandItem(element) {
  if (!element.hasClass('ux-side-menu-item-expanded')) {
    element.click();
  }
}

/* open the UIF side menu, open main (level1) category and will navigate to the given subcategory
* and menuEntry */
Cypress.Commands.add('bvdSideNavClick', (mainCategory, subCategories, menuEntry, sideMenuOpen = false) => {
  if (!sideMenuOpen) {
    cy.get('.ux-side-menu-toggle').click();
    cy.get('ux-side-menu .ux-side-menu-drawer-expanded');
    cy.get('ux-side-menu .sideNavSearch').click();
    cy.get(`[data-cy="${mainCategory}"] > .ux-side-menu-item`).first().then(element => {
      expandItem(element);
    });
  }
  let cat = 0;
  for (cat in subCategories) {
    if (subCategories[cat] !== undefined) {
      cy.get(`[data-cy="${subCategories[cat]}"] button`).then(button => {
        expandItem(button);
      });
      cy.get(`[data-cy="${subCategories[cat]}"] button`).should('have.attr', 'aria-expanded').and('eq', 'true');
    }
  }
  if (menuEntry !== undefined) {
    cy.get(`[data-cy="${menuEntry}"]`).find('button').first().then(button => {
      button.click();
    });
    cy.get(`[data-cy="${menuEntry}"] button`).first().should('have.class', 'ux-focus-indicator');
  }
});

/* check if toast contains the correct message and dismiss it */
Cypress.Commands.add('bvdCheckToast', toast => {
  cy.contains(toast).then(toastContainer => {
    cy.get(toastContainer[0]).parent().find('.toast-close-button').click();
  });
});

/* drill down to many pages to have ellipsis in bread crumbs */
Cypress.Commands.add('drillDownToManyPagesTillEllipsisAppear', () => {
  cy.get('breadcrumbs').then(breadcrumbs => {
    cy.get('[data-cy="drillDownButton"]').click();
    cy.get('div.ux-menu a.mondrianBreadcrumbDrillItem').should('have.length.greaterThan', 0)
      .eq(1).click();
    cy.wait(['@getPagesMetadata', '@getPagesWithComponents', '@getPagesMetadata']);
    cy.get('div.ux-menu').should('not.exist');
    cy.get('[data-cy=spinnerOverlay]').should('not.be.visible');
    if (!breadcrumbs.text().includes('...')) {
      cy.drillDownToManyPagesTillEllipsisAppear();
    }
  });
});
