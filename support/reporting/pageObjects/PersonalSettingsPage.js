const moment = require('moment');
class PersonalSettingsPage {
  constructor() {
    this.settingsPanel = '[data-cy="settings-panel"]';
    this.timezoneHeading = '[data-cy="label-timezone"]';
    this.systemDefaultRadioBtn = '[data-cy="system-default"]';
    this.myTimezoneRadioBtn = '[data-cy="my-timezone"]';
    this.cancelPersonalSettings = '[data-cy="cancel-personal-settings"]';
    this.savePersonalSettings = '[data-cy="save-personal-settings"]';
    this.myTimezoneRegion = '[data-cy="myTimezone-region"]';
    this.myTimezoneCity = '[data-cy="myTimezone-city"]';
    this.regionSearchPlaceholder = 'input[placeholder="Search for a region"]';
    this.citySearchPlaceholder = 'input[placeholder="Search for a city"]';
    this.regionAustralia = 'div[text="Australia"]';
    this.citySydney = 'div[text="Sydney"]';
  }

  validateIfPersonalSettingsPage() {
    cy.get(this.settingsPanel);
    cy.get(this.timezoneHeading);
  }

  checkSystemDefaultTimezone(timezone) {
    cy.get(this.systemDefaultRadioBtn).should('be.checked');
    cy.get(this.myTimezoneRadioBtn).should('not.be.checked');
    cy.get(this.systemDefaultRadioBtn).parent().find('span').first().contains(`System default: ${timezone}`);
  }

  selectSystemDefault() {
    this.validateIfPersonalSettingsPage();
    cy.get(this.systemDefaultRadioBtn).click();
    cy.get(this.systemDefaultRadioBtn).should('be.checked');
    cy.get(this.myTimezoneRadioBtn).should('not.be.checked');
  }

  selectMyTimezone() {
    this.validateIfPersonalSettingsPage();
    cy.get(this.myTimezoneRadioBtn).click();
    cy.get(this.myTimezoneRadioBtn).should('be.checked');
    cy.get(this.systemDefaultRadioBtn).should('not.be.checked');
  }

  checkMyTimezoneSettings() {
    this.selectMyTimezone();
    const timezone = moment.tz.guess();
    const myTimezone = timezone.split('/');
    const region = myTimezone[0];
    const city = myTimezone[1];
    cy.get(`div[title='${region}']`);
    cy.get(`div[title='${city}']`);
  }

  checkMyTimezoneAfterChange(timezone) {
    const myTimezone = timezone.split('/');
    const region = myTimezone[0];
    const city = myTimezone[1];
    cy.get(`div[title='${region}']`);
    cy.get(`div[title='${city}']`);
  }

  changeMyTimezone(myTimezone) {
    const timezone = myTimezone.split('/');
    const region = timezone[0];
    const city = timezone[1];
    cy.get(this.myTimezoneRegion).find('button').first().click();
    cy.get(this.regionSearchPlaceholder).type(region);
    cy.get(`div[text='${region}']`).click();
    cy.get(this.myTimezoneCity).find('button').first().click();
    cy.get(this.citySearchPlaceholder).type(city);
    cy.get(`div[text='${city}']`).click();
  }

  checkSaveDisabled() {
    cy.get(this.savePersonalSettings).should('be.disabled');
  }

  checkSaveEnable() {
    cy.get(this.savePersonalSettings).should('not.be.disabled');
  }

  clickCancelPersonalSettings() {
    cy.get(this.cancelPersonalSettings).should('not.be.disabled');
    cy.get(this.cancelPersonalSettings).click();
  }

  clickSavePersonalSettings() {
    cy.get(this.savePersonalSettings).should('not.be.disabled');
    cy.get(this.savePersonalSettings).click();
  }
}
export default new PersonalSettingsPage();
