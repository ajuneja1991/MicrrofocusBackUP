class SystemSettingsPage {
  constructor() {
    this.regionLabel = '[data-cy="region-label"]';
    this.cityLabel = '[data-cy="city-label"]';
    this.regionDropdown = '[data-cy="region-dropdown"]';
    this.cityDropdown = '[data-cy="city-dropdown"]';
    this.title = '[title="System Settings"]';
    this.defaultSelectedRegion = '[data-cy="region-dropdown"] div[title="UTC"]';
    this.saveSystemSettings = '[data-cy="save-system-settings"]';
    this.cancelSystemSettings = '[data-cy="cancel-system-settings"]';
    this.regionSearchPlaceholder = 'input[placeholder="Search for a region"]';
    this.citySearchPlaceholder = 'input[placeholder="Search for a city"]';
  }

  validateIfSystemSettingsPage() {
    cy.get(this.title);
    cy.get(this.regionLabel);
    cy.get(this.cityLabel);
  }

  checkDefaultSystemSettings() {
    cy.get(this.defaultSelectedRegion);
    cy.get(this.regionDropdown);
    cy.get(this.cityDropdown).find('button').should('be.disabled');
    cy.get(this.saveSystemSettings).should('be.disabled');
  }

  changeRegion(region) {
    cy.get(this.regionDropdown).find('button').first().click();
    cy.get(this.regionSearchPlaceholder).type(region);
    cy.get(`a[title='${region}']`).click();
    cy.get(this.saveSystemSettings).should('not.be.disabled');
  }

  changeCity(city) {
    cy.get(this.cityDropdown).find('button').first().click();
    cy.get(this.citySearchPlaceholder).type(city);
    cy.get(`a[title='${city}']`).click();
  }

  clickSaveSystemSettings() {
    cy.get(this.saveSystemSettings).should('not.be.disabled');
    cy.get(this.saveSystemSettings).click();
  }

  clickCancelSystemSettings() {
    cy.get(this.cancelSystemSettings).should('not.be.disabled');
    cy.get(this.cancelSystemSettings).click();
  }
}

export default new SystemSettingsPage();
