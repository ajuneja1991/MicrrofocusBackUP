class EditDashboardPage {
  constructor() {
    this.inputDataChannel = '.searchCriteria';
    this.configSave = '[data-cy="save-button"]';
    this.configApply = '[data-cy="apply-button"]';
    this.configCancel = '[data-cy="cancel-button"]';
    this.loadSpinner = '#load-spinner';
    this.propertiesBackBtn = '#propertiesBackButton';
    this.selectDatafieldInput = '#dataFields';
    this.selectSearchFieldInput = '#searchFields';
    this.timeSpanField = '#bvd_time';
    this.uploadDashboardBtn = '#dashboardUploadButton';
    this.divProgressBar = `div[data-progress='99']`;
    this.dashboardHeader = 'div h2.ng-binding';
    this.hyperlinkInputRadioButton = `input[id='hyperlink-url']`;
    this.hyperLinkToDashboardRadioBtn = `input[id='hyperlink-dashboard']`;
    this.passActiveParamsToDashboard = `input[name='opr_hyperlink_params']`;
    this.openDashboardDropdown = `opr-dropdown#hyperlink_select button.opr-dropdown-selection-button`;
    this.linkDashboardTxtBox = 'input.opr-dropdown-filter-input';
    this.selectDashboardafterSearching = 'div.list-title-container';
    this.editDashboardButton = '[data-cy="edit-dashboard-button"]';
    this.hyperlinkDashboard = 'input[id="hyperlink-dashboard"]';
    this.hyperlinkDashboardDropDown = 'opr-dropdown#hyperlink_select';
    this.visibilityRuleForWidget = 'input#opr_visibility_rule';
    this.dataChannelClearBtn = '.channelResultListElement-clear';
    this.urlWidgetChannel = `input#opr_channel[type='text']`;
    this.textOverflowOption = '#opr_text_overflow';
    this.calCulationRuleField = `input[id='opr_calculation_rule']`;
    this.removeDataFieldBtn = `li.ux-tag button[aria-label='Remove Item']`;
    this.enableSearchCheckBox = '#enableSearch';
  }

  selectWidget(sId) {
    cy.get(`g [highlight_widget_id='${sId}']`).should('be.visible');
    cy.get(`g [highlight_widget_id='${sId}'] rect`).should('be.visible');
    cy.get(`g [highlight_widget_id='${sId}'] rect`).click();
    cy.get(`[data-cy="widget-form-${sId}"]`).should('be.visible'); // wait for widget form to become visible
    cy.get(this.propertiesBackBtn).should('be.visible');
  }

  checkSearchFieldNotVisible() {
    cy.get(this.enableSearchCheckBox).should('not.be.visible');
  }

  selectShowLegend() {
    cy.get('body').then($ele => {
      if ($ele.find(`input[name='bvd_legend'].ng-empty`).length > 0) {
        cy.get(`input[name='bvd_legend'][type='checkbox']`).click();
        cy.get(`input[name='bvd_legend'].ng-not-empty`).should('exist');
      }
    });
  }

  setCalculationRule(calRuleTxt) {
    cy.get(this.calCulationRuleField).should('be.visible');
    /* Due to the Race Condition in angular for Calculation Rule when we type CalcRule through Cypress, we always get
    Invalid Syntax Error so to avoid it or delay the typing we are typing the whole text except the last character and
    then retyping the last character in below */
    const calRuleLastbutOneChar = calRuleTxt.substr(0, calRuleTxt.length - 1);
    cy.get(this.calCulationRuleField).type(calRuleLastbutOneChar);
    // Hardcoded Wait to delay CalcRule Typing
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    cy.get(this.calCulationRuleField).type(calRuleTxt.substring(calRuleTxt.length - 1));
  }

  clearDataFields() {
    cy.get(this.removeDataFieldBtn).click({ multiple: true });
  }

  clearDataChannel() {
    cy.get(this.dataChannelClearBtn).click();
  }

  setDataChannel(dataChannelName) {
    cy.get(this.dataChannelClearBtn).then($clearBtn => {
      if (!$clearBtn.hasClass('ng-hide')) {
        this.clearDataChannel();
      }
    });
    cy.get(this.inputDataChannel).type(`${dataChannelName}{enter}`);
    cy.get(`li [filter-text='${dataChannelName}']`).should('be.visible');
    cy.get(`li [filter-text='${dataChannelName}']`).click();
  }

  inputHyperlinkToDashboard(linkDashboardName) {
    cy.get(this.hyperLinkToDashboardRadioBtn).parent().click();
    cy.get(this.passActiveParamsToDashboard).parent().click();
    cy.get(this.openDashboardDropdown).click();
    cy.get(this.linkDashboardTxtBox).type(linkDashboardName);
    cy.get(this.selectDashboardafterSearching).click();
  }

  setVisibilityRuleForWidget(rule) {
    cy.get(this.visibilityRuleForWidget).should('be.visible');
    cy.get(this.visibilityRuleForWidget).type(rule);
  }

  inputHyperlinkURL(externalURL) {
    cy.get(this.hyperlinkInputRadioButton).parent().click();
    cy.get(`input[id='hyperlink']`).type(externalURL);
    cy.get(this.configSave).click();
    cy.get(this.loadSpinner).should('not.be.visible');
    cy.get(this.dashboardHeader).should('be.visible');
  }

  applyConfig() {
    cy.get(this.configApply).click();
    cy.get(this.loadSpinner).should('not.be.visible');
  }

  setUrlWidgetChannel(urlText) {
    cy.get(this.urlWidgetChannel).type(urlText);
  }

  cancelConfig() {
    cy.get(this.configCancel).click();
    cy.get(this.loadSpinner).should('not.be.visible');
  }

  saveConfig(dashboardName) {
    cy.get(this.configSave).should('be.visible');
    cy.intercept(`${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env('API_VERSION')}/dashboard/${dashboardName}`).as('save');
    cy.get(this.configSave).click();
    cy.wait(['@save']);
    cy.get(this.loadSpinner).should('not.be.visible');
    cy.get(this.dashboardHeader).should('be.visible');
  }

  editDashboard() {
    cy.get(this.editDashboardButton).click();
  }

  openDashboard(dashboardName) {
    cy.get(this.hyperlinkDashboard).parent().click();
    cy.get(`${this.hyperlinkDashboardDropDown} button`).eq(0).click();
    cy.get(`${this.hyperlinkDashboardDropDown} input`).type(dashboardName);
    cy.get(`dropdown a[title=${dashboardName}]`).click();
  }

  setMultipleDataField(dataFieldName) {
    cy.get(this.selectDatafieldInput).should('be.visible');
    // Hardcoded Wait as in case of widget group search fields it has to wait.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    cy.get(this.selectDatafieldInput).click();
    cy.get(this.selectDatafieldInput).type(`${dataFieldName}`).type(`{enter}`);
    cy.get(this.configSave).should('be.visible');
  }

  setSearchFields(dataFieldNames) {
    cy.get(this.selectSearchFieldInput).should('be.visible');
    cy.get(this.selectSearchFieldInput).click();
    for (const member of dataFieldNames) {
      cy.log(member.trim());
      cy.get('input#s2id_autogen2').type(member.trim()).type(`{enter}`);
    }
    cy.get(this.configSave).should('be.visible');
  }

  setTimeSpanInMinutes(time) {
    cy.get(this.timeSpanField).should('be.visible');
    cy.get(this.timeSpanField).click();
    cy.get(this.timeSpanField).clear();
    cy.get(this.timeSpanField).type(time);
    cy.get(this.configSave).should('be.visible');
  }

  verifyDefaultTextOverflowOption(overflowClass) {
    cy.get(this.textOverflowOption).should('have.class', overflowClass);
  }

  selectScaling(item) {
    cy.get('#displayName-input').click();
    cy.get('ul > li > a').contains(item).click();
  }

  addCategory(category) {
    cy.get('[placeholder="Type here to create a menu category"]').type(category).type('{enter}');
  }
}

export default new EditDashboardPage();
