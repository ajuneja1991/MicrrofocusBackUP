import 'cypress-file-upload';
const path = require('path');
class DashboardPage {
  constructor() {
    this.uploadDashboardBtn = '#dashboardUploadButton';
    this.chooseDashboardFileBtn = '#dashboardFile';
    this.uploadDashboardModal = 'div.modal-content';
    this.uploadBtn = '#upload';
    this.editDashboard = '#edit-DateTimeParameter_chrome';
    this.spinner = '.spinner';
    this.loadSpinner = '#load-spinner';
  }

  validateIfDashboardPage() {
    cy.get(this.spinner).should('not.be.visible');
    cy.get(this.uploadDashboardBtn).should('be.visible');
  }

  uploadDashboard(filePath, replace = null) {
    cy.get(this.uploadDashboardBtn).should('be.visible');
    cy.get(this.uploadDashboardBtn).click();
    cy.get(this.chooseDashboardFileBtn).attachFile(filePath);
    cy.get(this.uploadBtn).click().then(() => {
      // Check if file to be uploaded is not an svg file
      const pattern = /\.svg$/;
      if (!pattern.test(filePath) && typeof filePath === 'string') {
        cy.get(this.loadSpinner).should('not.be.visible');
        cy.get('#error').should('have.text', 'The selected file is not a valid dashboard file.');
        return;
      }
      if (replace) {
        cy.get('#replace').click();
      } else {
        cy.get(this.uploadDashboardModal).should('not.exist');
      }
    });
    cy.get(this.loadSpinner).should('not.be.visible');
  }

  // It is a workaround since hover over lazy loaded image is not working.
  _downloadLazySourcedImage(dashboard) {
    // Scroll to the bottom and to the view to make sure that the image gets downloaded.
    cy.get(`[id="${dashboard}-img"]`).scrollTo('bottom', { ensureScrollable: false });
    cy.get(`[id="${dashboard}-img"]`).parent().scrollIntoView().trigger('mouseover');

    cy.get(`[lazy-src="ui/dashboard/${dashboard}?isInstance=false&ts="]`)
      .should('be.visible')
      .and($img => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
  }

  downloadDashboard(dashboard) {
    const downloadFile = `${Cypress.config('downloadsFolder')}${path.sep}${dashboard}.svg`;
    cy.log(dashboard);
    cy.get(this.loadSpinner).should('not.be.visible');
    this._downloadLazySourcedImage(dashboard);
    cy.get(`#export-${dashboard}`).invoke('css', 'visibility', 'visible').trigger('mouseover').click();
    cy.readFile(downloadFile);
    return downloadFile;
  }

  openDashboardForEdit(dashboard) {
    cy.get(this.loadSpinner).should('not.be.visible');
    this._downloadLazySourcedImage(dashboard);
    cy.get(`#edit-${dashboard}`).invoke('css', 'visibility', 'visible').trigger('mouseover').click();
  }
}
export default new DashboardPage();
