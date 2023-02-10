import 'cypress-iframe';

describe('Cross tenant login and access', () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/ui/dashboard/Welcome?isInstance=true`).as('welcomeDashboardLoad');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/session/user`).as('pageloadUser');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/opr-l10n/resources/*`).as('resourceLoad');
  });

  it('Login with user(having admin permission) in Customer1 tenant', () => {
    cy.visit('?tenant=Customer1');
    cy.get('#username').should('be.visible');
    cy.get('#username').type('customer1Admin@microfocus.com');
    cy.get('#password').type('Control@123');
    cy.get('#submit').should('be.visible').click();
    cy.url().should('include', 'Welcome');
    cy.wait(['@pageloadUser', '@welcomeDashboardLoad']);
    cy.url().should('include', '?tenant=Customer1');
    cy.get('[data-cy="administration-button"]').click();
    cy.get('[data-cy="data-collector"]').click();
    cy.wait(['@pageloadUser', '@resourceLoad']);
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('[data-cy="dropdown-more"]').should('not.exist');
      getBody().find('#buttonDBSetting').should('not.exist');
    });
  });

  it('Cross tenant login(admin user from provider tenant to access data in Customer1 tenant)', () => {
    cy.visit('?target_tenant=Customer1');
    cy.get('#username').should('be.visible');
    cy.get('#username').type('admin');
    cy.get('#password').type('Control@123');
    cy.get('#submit').should('be.visible').click();
    cy.url().should('include', 'Welcome');
    cy.wait(['@pageloadUser', '@welcomeDashboardLoad']);
    cy.get('[data-cy="administration-button"]').should('be.visible').click();
    cy.get('[data-cy="data-collector"]').should('be.visible').click();
    cy.wait(['@pageloadUser', '@resourceLoad']);
    cy.enter('#contentFrame').then(getBody => {
      getBody().find('#buttonDBSetting').should('be.visible');
    });
  });
});
