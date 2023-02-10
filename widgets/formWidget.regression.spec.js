// <reference types="Cypress" />
const shared = require('../../../shared/shared');

describe('Form Widget', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/uiTestFormWidget*`
    }).as('getPage');
    cy.intercept({
      method: 'POST',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`
    }).as('formData');
    cy.bvdLogin();
    cy.visit('/uiTestFormWidget');
    cy.wait('@getPage');
    cy.wait('@formData');
  });

  it('Check combobox data is loaded correctly', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-combobox-all-sources"]').click();
    cy.wait('@formData');
    cy.get('#collection-input').should('have.value', 'opsb_synthetic_trans');
    cy.get('#tags-input').should('have.value', '');
    cy.get('#type-input').should('have.value', '');
    cy.get('#fieldsSet-input').should('have.value', 'set 3');
    cy.get('[id^=collection-typeahead-option-]').should('have.length', 4);
    cy.get('#collection-typeahead-option-0').should('have.text', 'opsb_run_trans');
    cy.get('#collection-typeahead-option-1').should('have.text', 'opsb_synthetic_trans');
    cy.get('#collection-typeahead-option-2').should('have.text', 'opsb_synthetic_trans_components');
    cy.get('#collection-typeahead-option-3').should('have.text', 'opsb_synthetic_trans_errors');
    cy.get('[id^=tags-typeahead-option-]').should('have.length', 3);
    cy.get('#tags-typeahead-option-0').should('have.text', 'log');
    cy.get('#tags-typeahead-option-1').should('have.text', 'event');
    cy.get('#tags-typeahead-option-2').should('have.text', 'test');
    cy.get('[id^=type-typeahead-option-]').should('have.length', 2);
    cy.get('#type-typeahead-option-0').should('have.text', 'attribute');
    cy.get('#type-typeahead-option-1').should('have.text', 'metric');
    cy.get('[id^=fieldsSet-typeahead-option-]').should('have.length', 4);
    cy.get('#fieldsSet-typeahead-option-0').should('have.text', 'set 1');
    cy.get('#fieldsSet-typeahead-option-1').should('have.text', 'set 2');
    cy.get('#fieldsSet-typeahead-option-2').should('have.text', 'set 3');
    cy.get('#fieldsSet-typeahead-option-3').should('have.text', 'set 4');

    cy.get('#collection-input').click();
    cy.get('#collection-typeahead-option-3').click();
    cy.get('[data-cy="collection-label"]').click(); // close combobox options
    cy.get('#collection-input').should('have.value', 'opsb_synthetic_trans_errors');
    cy.get('#tags-input').click();
    cy.get('#tags-typeahead-option-1').click();
    cy.get('[data-cy="tags-label"]').click(); // close combobox options
    cy.get('#tags-input').should('have.value', 'event');
    cy.get('#type-input').click();
    cy.get('#type-typeahead-option-0').click();
    cy.get('[data-cy="type-label"]').click(); // close combobox options
    cy.get('#type-input').should('have.value', 'attribute');
    cy.get('#fieldsSet-input').click();
    cy.get('#fieldsSet-typeahead-option-3').click();
    cy.get('[data-cy="fieldsSet-label"]').click(); // close combobox options
    cy.get('#fieldsSet-input').should('have.value', 'set 4');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData').then(interception => {
      console.log('interception request', interception.request);
      console.log('interception request body', interception.request.body);
      console.log('interception request body requestBody', interception.request.body.requestBody);
      cy.wrap(interception.request.body.requestBody).should('deep.eq', {
        collection: 'opsb_synthetic_trans_errors_value',
        tags: 'event,test',
        type: 'attribute_value',
        fieldsSet: '4'
      });
    });
    cy.bvdCheckToast('Created successfully');
    cy.get('.ux-side-panel').should('not.exist');
  });

  it('Check combobox submit with empty values', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-combobox-all-sources"]').click();
    cy.wait('@formData');
    cy.get('#collection-input').should('have.value', 'opsb_synthetic_trans');
    cy.get('#tags-input').should('have.value', '');
    cy.get('#type-input').should('have.value', '');
    cy.get('#fieldsSet-input').should('have.value', 'set 3');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData').then(interception => {
      console.log('interception request', interception.request);
      console.log('interception request body', interception.request.body);
      console.log('interception request body requestBody', interception.request.body.requestBody);
      cy.wrap(interception.request.body.requestBody).should('deep.eq', {
        collection: 'opsb_synthetic_trans_value',
        tags: '',
        type: '',
        fieldsSet: '3'
      });
    });
    cy.bvdCheckToast('Created successfully');
    cy.get('.ux-side-panel').should('not.exist');
  });

  it('Check combobox search', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-combobox"]').click();
    cy.wait('@formData');
    cy.get('#collection-input').type('opsb_s');
    cy.get('#collection-typeahead-option-0').should('have.text', 'opsb_synthetic_trans');
    cy.get('#collection-typeahead-option-1').should('have.text', 'opsb_synthetic_trans_components');
    cy.get('#collection-typeahead-option-2').should('have.text', 'opsb_synthetic_trans_errors');
    cy.get('#collection-typeahead-option-1').click();
    cy.get('#collection-input').should('have.value', 'opsb_synthetic_trans_components');
  });

  it('Check combobox required validator is shown', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-combobox"]').click();
    cy.wait('@formData');
    cy.get('[data-cy="collection-label"]').should('contain.text', '*');
    cy.get('[data-cy="tags-label"]').should('not.contain.text', '*');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('[data-cy="collection-error"]').should('not.exist');
    cy.get('#collection-input').click();
    cy.get('[data-cy="collection-label"]').click(); // close combobox options
    cy.get('#tags-input').click();
    cy.get('[data-cy="collection-error"]').should('be.visible');
    cy.get('[data-cy="tags-label"]').click(); // close combobox options
    cy.get('[data-cy="tags-error"]').should('not.exist');
    cy.get('[data-cy="submit-button"]').should('be.disabled');

    cy.get('#collection-input').click();
    cy.get('#collection-typeahead-option-1').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData');
    cy.bvdCheckToast('Created successfully');
    cy.get('.ux-side-panel').should('not.exist');
  });

  it('Check text input validators', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-text-input"]').click();
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('[data-cy="firstName-label"]').should('contain.text', '*');
    cy.get('[data-cy="lastName-label"]').should('contain.text', '*');
    cy.get('[data-cy="email-label"]').should('not.contain.text', '*');
    cy.get('[data-cy="phone-label"]').should('contain.text', '*');
    cy.get('[data-cy="address-label"]').should('not.contain.text', '*');

    cy.get('[data-cy="firstName-error"]').should('not.exist');
    cy.get('#firstName-input').type('smith');
    cy.get('[data-cy="firstName-label"]').click(); // remove focus
    cy.get('[data-cy="firstName-error"]').should('be.visible');
    cy.get('[data-cy="firstName-error"]').should('contain.text', 'First name should start with uppercase and contain minimum 3 letters');
    cy.get('#firstName-input').clear().type('Smith');
    cy.get('[data-cy="firstName-error"]').should('not.exist');
    cy.get('[data-cy="submit-button"]').should('be.disabled');

    cy.get('[data-cy="lastName-error"]').should('not.exist');
    cy.get('#lastName-input').click();
    cy.get('[data-cy="lastName-label"]').click(); // remove focus
    cy.get('[data-cy="lastName-error"]').should('be.visible');
    cy.get('[data-cy="lastName-error"]').should('contain.text', 'Field is required');
    cy.get('#lastName-input').type('Jo');
    cy.get('[data-cy="lastName-label"]').click(); // remove focus
    cy.get('[data-cy="lastName-error"]').should('be.visible');
    cy.get('[data-cy="lastName-error"]').should('contain.text', 'Field is invalid');
    cy.get('#lastName-input').clear().type('John');
    cy.get('[data-cy="lastName-label"]').click(); // remove focus
    cy.get('[data-cy="lastName-error"]').should('not.exist');
    cy.get('[data-cy="submit-button"]').should('be.disabled');

    cy.get('[data-cy="phone-error"]').should('not.exist');
    cy.get('#phone-input').click();
    cy.get('[data-cy="phone-label"]').click(); // remove focus
    cy.get('[data-cy="phone-error"]').should('be.visible');
    cy.get('[data-cy="phone-error"]').should('contain.text', 'Field is required');
    cy.get('#phone-input').type('0123');
    cy.get('[data-cy="phone-label"]').click(); // remove focus
    cy.get('[data-cy="phone-error"]').should('not.exist');
    cy.get('[data-cy="submit-button"]').should('not.be.disabled');

    cy.get('[data-cy="email-error"]').should('not.exist');
    cy.get('#email-input').type('a@m.');
    cy.get('[data-cy="email-label"]').click(); // remove focus
    cy.get('[data-cy="email-error"]').should('be.visible');
    cy.get('[data-cy="email-error"]').should('contain.text', 'Field is invalid');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('#email-input').clear().type('b@m.c');
    cy.get('[data-cy="email-label"]').click(); // remove focus
    cy.get('[data-cy="email-error"]').should('not.exist');
    cy.get('[data-cy="submit-button"]').should('not.be.disabled');

    cy.get('[data-cy="address-error"]').should('not.exist');
    cy.get('#address-input').type('address');
    cy.get('[data-cy="address-label"]').click(); // remove focus
    cy.get('[data-cy="address-error"]').should('not.exist');

    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData').then(interception => {
      console.log('interception request', interception.request);
      console.log('interception request body', interception.request.body);
      console.log('interception request body requestBody', interception.request.body.requestBody);
      cy.wrap(interception.request.body.requestBody).should('deep.eq', {
        firstName: 'Smith',
        lastName: 'John',
        email: 'b@m.c',
        phone: '0123',
        address: 'address'
      });
    });

    cy.bvdCheckToast('Created successfully');
    cy.get('.ux-side-panel').should('not.exist');
  });

  it('Check text input data is loaded correctly', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-text-input-with-default-data"]').click();
    cy.wait('@formData');
    cy.get('#name-input').should('have.value', 'John Smith');
    cy.get('#phone-input').should('have.value', '');
    cy.get('#name-input').clear().type('Dr. Smith');
    cy.get('#phone-input').type('0123');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData').then(interception => {
      console.log('interception request', interception.request);
      console.log('interception request body', interception.request.body);
      console.log('interception request body requestBody', interception.request.body.requestBody);
      cy.wrap(interception.request.body.requestBody).should('deep.eq', {
        name: 'Dr. Smith',
        phone: '0123'
      });
    });
    cy.bvdCheckToast('Created successfully');
    cy.get('.ux-side-panel').should('not.exist');
  });

  it('Check horizontal layout is displayed correctly', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-horizontal-layout"]').click();
    cy.get('#override-header').should('have.text', 'Test horizontal layout');
    cy.get('[data-cy="form-table"]').find('tr').eq(0).find('td').eq(0).should('have.text', 'Name');
    cy.get('[data-cy="form-table"]').find('tr').eq(0).find('td').eq(1).find('#name-input')
      .invoke('attr', 'placeholder')
      .should('eq', 'Type your name');
    cy.get('[data-cy="form-table"]').find('tr').eq(1).find('td').eq(0).should('have.text', 'Age');
    cy.get('[data-cy="form-table"]').find('tr').eq(2).find('td').eq(0).should('have.text', 'Married');
    cy.get('[data-cy="form-table"]').find('tr').eq(2).find('td').eq(1).find('#married-input');
    cy.get('[data-cy="form-table"]').find('tr').eq(3).find('td').eq(0).should('have.text', 'Job');
    cy.get('[data-cy="form-table"]').find('tr').eq(3).find('td').eq(1).find('#job-input')
      .invoke('attr', 'placeholder')
      .should('eq', 'Select your job');
    cy.get('[data-cy="form-table"]').find('tr').eq(4).find('td').eq(0).should('have.text', 'Abilities');
    cy.get('[data-cy="form-table"]').find('tr').eq(4).find('td').eq(1).find('#abilities-input')
      .find('input')
      .invoke('attr', 'placeholder')
      .should('eq', 'Type your abilities');
    cy.get('[data-cy="submit-button"]').should('contain.text', 'UPDATE');
  });

  it('Check vertical layout is displayed correctly', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-vertical-layout"]').click();
    cy.get('#override-header').should('have.text', 'Test vertical layout');
    cy.get('[data-cy="form-table"]').find('tr').eq(0).find('td').eq(0).should('have.text', 'Name');
    cy.get('[data-cy="form-table"]').find('tr').eq(1).find('td').eq(0).find('#name-input')
      .invoke('attr', 'placeholder')
      .should('eq', 'Type your name');
    cy.get('[data-cy="form-table"]').find('tr').eq(2).find('td').eq(0).should('have.text', 'Age');
    cy.get('[data-cy="form-table"]').find('tr').eq(4).find('td').eq(0).should('have.text', 'Married');
    cy.get('[data-cy="form-table"]').find('tr').eq(5).find('td').eq(0).find('#married-input');
    cy.get('[data-cy="form-table"]').find('tr').eq(6).find('td').eq(0).should('have.text', 'Job');
    cy.get('[data-cy="form-table"]').find('tr').eq(7).find('td').eq(0).find('#job-input')
      .invoke('attr', 'placeholder')
      .should('eq', 'Select your job');
    cy.get('[data-cy="form-table"]').find('tr').eq(8).find('td').eq(0).should('have.text', 'Abilities');
    cy.get('[data-cy="form-table"]').find('tr').eq(9).find('td').eq(0).find('#abilities-input')
      .find('input')
      .invoke('attr', 'placeholder')
      .should('eq', 'Type your abilities');
    cy.get('[data-cy="submit-button"]').should('contain.text', 'CONFIRM'); // confirm button default text
  });

  it('Check error message is shown when submit fails', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-fail"]').click();
    cy.get('#name-input').type('John');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData');
    cy.get('[data-cy="notification-error-text"]').should('contain.text', 'Failed to create');
    cy.get('#name-input').should('have.value', 'John');
    cy.get('.ux-side-panel').should('have.class', 'open');
  });

  it('Check custom error message is shown when submit fails', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-fail-custom"]').click();
    cy.get('#name-input').type('John');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData');
    cy.get('[data-cy="notification-error-text"]').should('contain.text', 'User failed to be created');
    cy.get('#name-input').should('have.value', 'John');
    cy.get('.ux-side-panel').should('have.class', 'open');
  });

  it('Check custom success message', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-success-custom"]').click();
    cy.get('#name-input').type('John');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData');
    cy.bvdCheckToast('User created');
    cy.get('.ux-side-panel').should('not.exist');
  });

  it('Check error message is shown when form data load fails', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-fail-fetch-data"]').click();
    cy.wait('@formData');
    cy.get('[data-cy="notification-error-text"]').should('contain.text', 'Failed to load the default data');
    cy.get('.ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
  });

  it('Check custom error message is shown when form data load fails', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-fail-fetch-data-custom"]').click();
    cy.wait('@formData');
    cy.get('[data-cy="notification-error-text"]').should('contain.text', 'Unable to load the current name');
    cy.get('.ux-side-panel').should('have.class', 'open');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
  });

  it('Check field is hidden or shown based on other field value', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-conditional-field-visibility"]').click();
    cy.get('[data-cy="form-table"]').find('tr').should('have.length', 3);
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('#type-input').click();
    cy.get('#type-typeahead-option-1').click();
    cy.get('[data-cy="type-label"]').click(); // close combobox options
    cy.get('[data-cy="form-table"]').find('tr').should('have.length', 2);
    cy.get('[data-cy="submit-button"]').should('not.be.disabled');

    cy.get('#type-input').click();
    cy.get('#type-typeahead-option-0').click();
    cy.get('[data-cy="type-label"]').click(); // close combobox options
    cy.get('[data-cy="form-table"]').find('tr').should('have.length', 3);
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('#length-input').type('3');
    cy.get('[data-cy="submit-button"]').should('not.be.disabled');

    cy.get('#type-input').click();
    cy.get('#type-typeahead-option-2').click();
    cy.get('[data-cy="type-label"]').click(); // close combobox options
    cy.get('[data-cy="form-table"]').find('tr').should('have.length', 2);
    cy.get('[data-cy="submit-button"]').should('not.be.disabled');
    cy.get('[data-cy="submit-button"]').should('not.be.disabled');

    cy.get('#type-input').click();
    cy.get('#type-typeahead-option-0').click();
    cy.get('[data-cy="type-label"]').click(); // close combobox options
    cy.get('[data-cy="form-table"]').find('tr').should('have.length', 3);
    cy.get('#length-input').should('have.value', '3');
    cy.get('[data-cy="submit-button"]').should('not.be.disabled');
  });

  it('Check field hidden based on other field value is not send in submit', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-conditional-field-visibility"]').click();
    cy.get('[data-cy="form-table"]').find('tr').should('have.length', 3);
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('#type-input').click();
    cy.get('#type-typeahead-option-1').click();
    cy.get('[data-cy="type-label"]').click(); // close combobox options
    cy.get('[data-cy="form-table"]').find('tr').should('have.length', 2);
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData').then(interception => {
      console.log('interception request', interception.request);
      console.log('interception request body', interception.request.body);
      console.log('interception request body requestBody', interception.request.body.requestBody);
      cy.wrap(interception.request.body.requestBody).should('deep.eq', {
        name: '',
        type: 'number_val'
      });
    });
    cy.get('.ux-side-panel').should('not.exist');
  });

  it('Check field shown on other field value is not send in submit', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-conditional-field-visibility"]').click();
    cy.get('[data-cy="form-table"]').find('tr').should('have.length', 3);
    cy.get('#type-input').click();
    cy.get('#type-typeahead-option-0').click();
    cy.get('[data-cy="type-label"]').click(); // close combobox options
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('#length-input').type('3');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData').then(interception => {
      console.log('interception request', interception.request);
      console.log('interception request body', interception.request.body);
      console.log('interception request body requestBody', interception.request.body.requestBody);
      cy.wrap(interception.request.body.requestBody).should('deep.eq', {
        name: '',
        type: 'string_val',
        length: 3
      });
    });
    cy.get('.ux-side-panel').should('not.exist');
  });

  it('Check field is hidden based on a static loaded value', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-static-conditional-field-hidden"]').click();
    cy.wait('@formData');
    cy.get('[data-cy="form-table"]').find('tr').should('have.length', 1);
    cy.get('[data-cy="submit-button"]').should('not.be.disabled');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData').then(interception => {
      console.log('interception request', interception.request);
      console.log('interception request body', interception.request.body);
      console.log('interception request body requestBody', interception.request.body.requestBody);
      cy.wrap(interception.request.body.requestBody).should('deep.eq', {
        name: ''
      });
    });
    cy.get('.ux-side-panel').should('not.exist');
  });

  it('Check field is shown based on a static loaded value', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-static-conditional-field-shown"]').click();
    cy.wait('@formData');
    cy.get('[data-cy="form-table"]').find('tr').should('have.length', 2);
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('#age-input').type('20');
    cy.get('[data-cy="submit-button"]').should('not.be.disabled');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData').then(interception => {
      console.log('interception request', interception.request);
      console.log('interception request body', interception.request.body);
      console.log('interception request body requestBody', interception.request.body.requestBody);
      cy.wrap(interception.request.body.requestBody).should('deep.eq', {
        name: '',
        age: 20
      });
    });
    cy.get('.ux-side-panel').should('not.exist');
  });

  it('Check widgets are refreshed when submit succeeded', () => {
    cy.get('#ui-test-form-widget-notified-table').within(() => {
      cy.get('[row-id="0"] > [aria-colindex="1"]').contains('opsb_sysinfra_disk');
      cy.get('[row-id="1"] .ag-selection-checkbox').should('not.exist');
    });
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-notification"]').click();
    cy.wait('@formData');
    cy.get('#collection-input').click();
    cy.get('#collection-typeahead-option-1').click();
    cy.get('[data-cy="collection-label"]').click(); // close combobox options
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData');
    cy.get('.ux-side-panel').should('not.exist');
    cy.get('#ui-test-form-widget-notified-table').within(() => {
      cy.get('[row-id="0"] > [aria-colindex="1"]').contains('opsb_sysinfra_disk');
      cy.get('[row-id="1"] > [aria-colindex="1"]').contains('opsb_synthetic_trans_value');
    });
  });

  it('Check number picker values are loaded correctly', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-number-picker"]').click();
    cy.wait('@formData');
    cy.get('#number1-input').should('have.value', '2');
    cy.get('[data-cy="number1-label"]').should('contain.text', 'Select number');
    cy.get('#number2-input').should('have.value', '7');
    cy.get('[data-cy="number2-label"]').should('contain.text', 'Number with min 1 and max 5');
    cy.get('#number3-input').should('have.value', '42');
    cy.get('[data-cy="number3-label"]').should('contain.text', 'Number picker with step 0.25');
  });

  it('Check number picker default step is 1', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-number-picker"]').click();
    cy.wait('@formData');
    cy.get('#number1-input').should('have.value', '2');
    cy.get('#number1-input').siblings('.number-picker-controls').children('.number-picker-control-up').click();
    cy.get('#number1-input').should('have.value', '3');
    cy.get('#number1-input').siblings('.number-picker-controls').children('.number-picker-control-down').click();
    cy.get('#number1-input').should('have.value', '2');
  });

  it('Check number picker increases by step when keyboard arrows are pressed', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-number-picker"]').click();
    cy.wait('@formData');
    cy.get('#number3-input').should('have.value', '42');
    cy.get('#number3-input').type('{uparrow}');
    cy.get('#number3-input').should('have.value', '42.25');
    cy.get('#number3-input').type('{downarrow}');
    cy.get('#number3-input').should('have.value', '42');
  });

  it('Check number picker gets input from keyboard', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-number-picker"]').click();
    cy.wait('@formData');
    cy.get('#number1-input').should('have.value', '2');
    cy.get('#number1-input').type('6');
    cy.get('#number1-input').should('have.value', '26');
    cy.get('#number1-input').clear().type('2');
    cy.get('#number1-input').should('have.value', '2');
  });

  it('Check number picker increases by step when buttons are pressed', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-number-picker"]').click();
    cy.wait('@formData');
    cy.get('#number3-input').should('have.value', '42');
    cy.get('#number3-input').siblings('.number-picker-controls').children('.number-picker-control-up').click();
    cy.get('#number3-input').should('have.value', '42.25');
    cy.get('#number3-input').siblings('.number-picker-controls').children('.number-picker-control-down').click();
    cy.get('#number3-input').should('have.value', '42');
  });

  it('Check number picker error validator out of bounds', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-number-picker"]').click();
    cy.wait('@formData');
    cy.get('#number2-input').should('have.value', '7');
    cy.get('#number2-input').click();
    cy.get('[data-cy="number2-label"]').click();
    cy.get('[data-cy="number2-error"]').should('be.visible').should('contain.text', 'Value must not be larger than 5');
    cy.get('#number2-input').siblings('.number-picker-controls').children('.number-picker-control-up').should('have.class', 'disabled');
    cy.get('#number2-input').siblings('.number-picker-controls').children('.number-picker-control-down').click();
    cy.get('#number2-input').should('have.value', '5');
    cy.get('[data-cy="number2-error"]').should('not.exist');
    cy.get('[data-cy="submit-button"]').should('not.be.disabled');
    cy.get('#number2-input').clear().type('0');
    cy.get('[data-cy="number2-label"]').click();
    cy.get('[data-cy="number2-error"]').should('be.visible').should('contain.text', 'Value must not be smaller than 1');
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    cy.get('#number2-input').siblings('.number-picker-controls').children('.number-picker-control-up').click();
    cy.get('[data-cy="number2-error"]').should('not.exist');
    cy.get('[data-cy="submit-button"]').should('not.be.disabled');
  });

  it('Check number picker required validator', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-number-picker"]').click();
    cy.wait('@formData');
    cy.get('[data-cy="number1-label"]').should('contain.text', '*');
    cy.get('[data-cy="number2-label"]').should('not.contain.text', '*');
    cy.get('[data-cy="number3-label"]').should('not.contain.text', '*');
    cy.get('[data-cy="number1-error"]').should('not.exist');
    cy.get('#number1-input').clear();
    cy.get('[data-cy="number1-label"]').click(); // focus outside
    cy.get('[data-cy="number1-error"]').should('be.visible').should('contain.text', 'Field is required');

    cy.get('#number1-input').type('2');
    cy.get('[data-cy="number1-error"]').should('not.exist');
  });

  it('Check number picker submit', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-number-picker"]').click();
    cy.wait('@formData');
    cy.get('#number2-input').clear().type('3');
    cy.get('#number2-input').should('have.value', '3');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData').then(interception => {
      console.log('interception request', interception.request);
      console.log('interception request body', interception.request.body);
      console.log('interception request body requestBody', interception.request.body.requestBody);
      cy.wrap(interception.request.body.requestBody).should('deep.eq', {
        number1: 2,
        number2: 3,
        number3: 42
      });
    });
  });

  it('Check checkbox values are loaded correctly', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-checkbox"]').click();
    cy.wait('@formData');
    cy.get('#valueTrue-input').should('have.value', 'true');
    cy.get('[data-cy="valueTrue-label"]').should('contain.text', 'Checkbox true');
    cy.get('#valueFalse-input').should('have.value', 'false');
    cy.get('[data-cy="valueFalse-label"]').should('contain.text', 'Checkbox false');
  });

  it('Check checkbox check and uncheck value', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-checkbox"]').click();
    cy.wait('@formData');
    cy.get('#valueTrue-input').should('have.value', 'true');
    cy.get('.ux-checkbox-container:has(#valueTrue-input)').click();
    cy.get('#valueTrue-input').should('have.value', 'false');
    cy.get('.ux-checkbox-container:has(#valueTrue-input)').click();
    cy.get('#valueTrue-input').should('have.value', 'true');

    cy.get('#valueFalse-input').should('have.value', 'false');
    cy.get('.ux-checkbox-container:has(#valueFalse-input)').click();
    cy.get('#valueFalse-input').should('have.value', 'true');
    cy.get('.ux-checkbox-container:has(#valueFalse-input)').click();
    cy.get('#valueFalse-input').should('have.value', 'false');
  });

  it('Check checkbox submit', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-checkbox"]').click();
    cy.wait('@formData');
    cy.get('.ux-checkbox-container:has(#valueFalse-input)').click();
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData').then(interception => {
      console.log('interception request', interception.request);
      console.log('interception request body', interception.request.body);
      console.log('interception request body requestBody', interception.request.body.requestBody);
      cy.wrap(interception.request.body.requestBody).should('deep.eq', {
        valueTrue: true,
        valueFalse: true
      });
    });
  });

  it('Check tag input values are loaded correctly', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-tag-input"]').click();
    cy.wait('@formData');
    cy.get('#tags-input .ux-tag-text').eq(0).should('contain.text', 'Alpha');
    cy.get('#tags-input .ux-tag-text').eq(1).should('contain.text', 'Beta');
    cy.get('#tags-input .ux-tag-text').eq(2).should('contain.text', 'Kappa');
    cy.get('[data-cy="tags-label"]').should('contain.text', 'Tag input typeahead enabled');

    cy.get('#tags2-input .ux-tag-text').eq(0).should('contain.text', 'Delta');
    cy.get('#tags2-input .ux-tag-text').eq(1).should('contain.text', 'Epsilon');
    cy.get('[data-cy="tags2-label"]').should('contain.text', 'Tag input typeahead disabled');
  });

  it('Check tag input typeahead enabled shown on click', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-tag-input"]').click();
    cy.wait('@formData');
    cy.get('#tags-input').click();
    cy.get('#tags-typeahead').should('be.visible');
    cy.get('#tags-typeahead').find('ux-typeahead-options-list ol').children().should('have.length', 24);
    cy.get('#tags-typeahead-option-0').should('contain.text', 'Alpha').should('have.class', 'disabled');
    cy.get('#tags-typeahead-option-1').should('contain.text', 'Beta').should('have.class', 'disabled');
    cy.get('#tags-typeahead-option-2').should('contain.text', 'Gamma').should('not.have.class', 'disabled');
  });

  it('Check tag input typeahead enabled but not shown on click', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-tag-input"]').click();
    cy.wait('@formData');
    cy.get('#tags3-input').click();
    cy.get('#tags3-typeahead').should('not.be.visible');
    cy.get('#tags3-input').type('gamma');
    cy.get('#tags3-typeahead').should('be.visible');
    cy.get('#tags3-typeahead-option-0').should('contain.text', 'Gamma');
  });

  it('Check tag input typeahead disabled', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-tag-input"]').click();
    cy.wait('@formData');
    cy.get('#tags2-input').click();
    cy.get('#tags2-typeahead').should('not.exist');
    cy.get('#tags2-input').type('alp');
    cy.get('#tags2-typeahead').should('not.exist');
  });

  it('Check tag input search', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-tag-input"]').click();
    cy.wait('@formData');
    cy.get('#tags-input').type('del');
    cy.get('#tags-typeahead').find('ux-typeahead-options-list ol').children().should('have.length', 1);
    cy.get('#tags-typeahead-option-0').should('contain.text', 'Delta');
    cy.get('#tags-input').clear().type('ta');
    cy.get('#tags-typeahead').find('ux-typeahead-options-list ol').children().should('have.length', 7);
    cy.get('#tags-input').clear().type('test');
    cy.get('#tags-typeahead').find('ux-typeahead-options-list').should('not.exist');
    cy.get('#tags-typeahead .ux-typeahead-no-options').should('contain.text', 'No results');
  });

  it('Check tag input add tag from dropdown options', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-tag-input"]').click();
    cy.wait('@formData');
    cy.get('#tags-input .ux-tag-text').should('have.length', 3);
    cy.get('#tags-input').click();
    cy.get('#tags-typeahead-option-2').click();
    cy.get('#tags-input .ux-tag-text').should('have.length', 4);
    cy.get('#tags-input .ux-tag-text').eq(3).should('contain.text', 'Gamma');
    cy.get('#tags-typeahead-option-2').should('have.class', 'disabled');
  });

  it('Check tag input add custom tag', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-tag-input"]').click();
    cy.wait('@formData');
    cy.get('#tags-input .ux-tag-text').should('have.length', 3);
    cy.get('#tags-input').type('test').type('{enter}');
    cy.get('#tags-input .ux-tag-text').should('have.length', 4);
    cy.get('#tags-input .ux-tag-text').eq(3).should('contain.text', 'test');
  });

  it('Check tag input delete tag', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-tag-input"]').click();
    cy.wait('@formData');
    cy.get('#tags-input .ux-tag-text').should('have.length', 3);
    cy.get('#tags-input .ux-tag-text').eq(0).should('contain.text', 'Alpha');
    cy.get('#tags-input .ux-icon-close').eq(0).click();
    cy.get('#tags-input .ux-tag-text').eq(0).should('contain.text', 'Beta');
    cy.get('#tags-input .ux-tag-text').should('have.length', 2);
    cy.get('#tags-typeahead-option-0').should('not.have.class', 'disabled');
  });

  it('Check tag input submit', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-tag-input"]').click();
    cy.wait('@formData');
    cy.get('#tags-input .ux-icon-close').eq(0).click();
    cy.get('#tags-input').type('test').type('{enter}');
    cy.get('#tags3-input').type('test2').type('{enter}');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData').then(interception => {
      console.log('interception request', interception.request);// take a look at the properties
      console.log('interception request body', interception.request.body);// take a look at the properties
      console.log('interception request body requestBody', interception.request.body.requestBody);// take a look at the properties
      cy.wrap(interception.request.body.requestBody).should('deep.eq', {
        tags: ['Beta', 'Kappa', 'test'],
        tags2: ['Delta', 'Epsilon'],
        tags3: ['test2'],
        tags4: ''
      });
    });
  });

  it('Check tag input required validator', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-tag-input"]').click();
    cy.wait('@formData');
    cy.get('#tags-input .ux-icon-close').eq(2).click();
    cy.get('#tags-input .ux-icon-close').eq(1).click();
    cy.get('#tags-input .ux-icon-close').eq(0).click();
    cy.get('[data-cy="tags-label"]').click();
    cy.get('[data-cy="tags-error"]').should('be.visible').should('contain.text', 'Field is required');
  });

  it('Check tag input min/max tags validator', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-tag-input"]').click();
    cy.wait('@formData');
    cy.get('#tags4-input').type('testA{enter}');
    cy.get('#tags4-input').type('testB{enter}');
    cy.get('#tags4-input').type('testC{enter}');
    cy.get('#tags4-input').type('testD{enter}');
    cy.get('[data-cy="tags4-error"]').should('be.visible').should('contain.text', 'Maximum number of tags is 3');
    cy.get('[data-cy="submit-button"]').should('be.disabled');

    cy.get('#tags4-input .ux-icon-close').eq(3).click();
    cy.get('[data-cy="tags4-error"]').should('not.exist');
    cy.get('[data-cy="submit-button"]').should('not.be.disabled');

    cy.get('#tags4-input .ux-icon-close').eq(2).click();
    cy.get('#tags4-input .ux-icon-close').eq(1).click();
    cy.get('#tags4-input .ux-icon-close').eq(0).click();
    cy.get('[data-cy="tags4-error"]').should('be.visible').should('contain.text', 'Minimum number of tags is 1');
    cy.get('[data-cy="submit-button"]').should('be.disabled');

    cy.get('#tags4-input').type('testA{enter}');
    cy.get('[data-cy="tags4-error"]').should('not.exist');
    cy.get('[data-cy="submit-button"]').should('not.be.disabled');
  });

  it('Check tag input regex validator', () => {
    cy.get('[data-cy="page-action-button"]').click();
    cy.get('[data-cy="page-action-item-form-tag-input"]').click();
    cy.wait('@formData');

    cy.get('#tags4-input').type('test{enter}');
    cy.get('#tags4-input').type('T{enter}');
    cy.get('[data-cy="tags4-error"]').should('be.visible').should('contain.text', 'Tags need to have at least 2 characters and contain only letters');
    cy.get('[data-cy="submit-button"]').should('be.disabled');

    cy.get('#tags4-input .ux-icon-close').eq(1).click();
    cy.get('[data-cy="tags4-error"]').should('not.exist');
    cy.get('[data-cy="submit-button"]').should('not.be.disabled');
  });

  it('Check put request method and default update confirmation message shown', () => {
    cy.get('#ui-test-form-widget-notified-table').within(() => {
      cy.get('[row-id="0"] > [aria-colindex="1"]').click();
    });
    cy.get('[data-cy="action-button"]').click();
    cy.get('[data-cy="action-button-update-collection"]').click();
    cy.wait(['@formData', '@formData']);
    cy.get('#description-input').clear().type('description');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@formData').then(interception => {
      cy.wrap(interception.request.body.operation).should('eq', 'update');
    });
    cy.bvdCheckToast('Updated successfully');
    cy.wait('@formData');
    cy.get('#ui-test-form-widget-notified-table').within(() => {
      cy.get('[row-id="0"] > [aria-colindex="2"]').contains('description');
    });
  });

  afterEach(() => {
    const datasourceUrl = `/rest/${Cypress.env('API_VERSION')}/datasource/ws/data`;

    cy.getCookie('secureModifyToken').then(smtValue => {
      // Note: cy.request can not be intercepted (https://docs.cypress.io/api/commands/request#cy-intercept-cy-server-and-cy-route)
      //       cy.request is not visible in the network tab of Developer Tools (https://docs.cypress.io/api/commands/request#Debugging)
      //       By default is will fail for none 2xx return codes
      cy.request({
        method: 'POST',
        url: datasourceUrl,
        headers: {
          'X-Secure-Modify-Token': smtValue.value
        },
        body: {
          operation: 'create',
          url: 'http://localhost:4010/mock/form-widget/teardown'
        }
      });
    });
  });
});
