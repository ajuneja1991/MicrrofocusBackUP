import 'cypress-iframe';
import * as TimeCalculations from '../TimeCalculations';
import MainPage from './MainPage';

class DataCollectorPage {
  constructor() {
    this.iframeId = '#contentFrame';
    this.buttonNewCreateQuery = '.dropdown #dropdownNew1';
    this.textFieldDataQuery = '#name-input_name';
    this.paramQueryText = 'Create Parameter Query';
    this.dataQuery = 'Create Data Query';
    this.paramQueryDisplayName = '#name-input_displayname';
    this.dataQueryDescription = '#description-input';
    this.dataQueryTagName = `input.opr-tag-bar-input[type='text']`;
    this.dataQueryDefaultFormat = '#queryformat-default';
    this.dataQueryGroupWidgetFormat = '#queryformat-widgetgroup';
    this.executeQueryBtn = '#buttonExecuteQuery';
    this.dataQueryTable = '#query-text';
    this.spinner = '.spinner';
    this.queryResults = '.col-sm-12 .queryResultData table tr th';
    this.saveDataQueryButton = '#buttonConfirm';
    this.cancelDataQueryButton = '[data-cy="cancel-button"]';
    this.cancelParamQueryButton = 'button#buttonCancel';
    this.queryList = '[data-cy="queryList"]';
    this.editQueryButton = '[data-cy="edit-query"]';
    this.dateTypeValueText = 'div.valueDetail span div';
    this.defaultValueText = '[data-cy="defaultValueDataCollector"]';
    this.duplicateQueryButton = '[data-cy="duplicate-button"]';
    this.activeHighlightedQuery = 'opr-list-item .active .list-title';
    this.paramQueryVariableName = '#variable-input_name';
    this.paramQueryDescription = '#description-input';
    this.paramDatabaseQueryRadioBtn = '#sqlparam';
    this.paramValueListRadioBtn = '#nonsqlparam';
    this.paramDateSelectorRadioBtn = '#dateSelector';
    this.dateRangeSelectorRadioBtn = '#specificDate';
    this.singleDateSelectorRadioBtn = '#singleDate';
    this.paramDefaultNoValue = `input[value='novalue']`;
    this.paramDefaultValue = `input[value='customvalue']`;
    this.valueColumnParamDatabase = `div opr-dropdown[placeholder='Value column'] div button.opr-dropdown-selection-button>div`;
    this.labelColumnParamDatabase = `div opr-dropdown[placeholder='Label column'] div button.opr-dropdown-selection-button>div`;
    this.dateString = '[data-cy="date-string"]';
    this.addValueListButton = 'div.opr-editable-field-grid button';
    this.valueListInput = '.opr-editable-field-grid opr-grid .opr-grid input';
    this.column = 'div button.opr-dropdown-selection-button';
    this.valueInput = `[data-cy='value-input-field']`;
    this.valueEmptyValidation = `[data-cy='value-empty-validator']`;
    this.applyButton = `button[title='Apply']`;
    this.addAnotherButton = `button[title='Add']`;
    this.dropdownMore = '[data-cy="dropdown-more"]';
    this.optionDBSettings = '[data-cy="optionDBSettings"]';
    this.hostName = 'input[name=hostName]';
    this.hostPort = 'input[name=port]';
    this.dbName = 'input[name=dbName]';
    this.dbUser = 'input[name=dbUser]';
    this.dbPassword = 'input[name=dbPassword]';
    this.dbPasswordConfirm = 'input[name=dbPasswordConfirm]';
    this.tlsCheckbox = 'input#ssl-input';
    this.attachCertificate = 'button.attachCertificateBtn';
    this.buttonTestConnection = '[data-cy="buttonTestConnection"]';
    this.connectionResult = '[data-cy="connectionResult"]';
    this.buttonSaveDBSetting = '[data-cy="buttonSaveDBSetting"]';
    this.searchButton = 'button[title="Search"]';
    this.searchInput = '.opr-toolbar opr-reveal-panel .filter-input';
    this.listTitles = '.list-body .list-title';
    this.deleteButtonActiveElement = 'opr-list-item a.active .list-buttons [title="Delete"]';
    this.approveDeleteElement = '.delete-mode-yes';
    this.clearSearchInput = 'button i[title="Clear"]';
    this.multiValueParameterCheckBox = '[data-cy="options-multiple-checkbox"]';
    this.buttonFilter = '.dropdown #dropdownNew2';
    this.buttonMoreOptions = '.dropdown #dropdownNew3';
    this.adminUser = Cypress.env('username');
    this.adminPasswd = Cypress.env('password');
    this.auth = Buffer.from(`${this.adminUser}:${this.adminPasswd}`).toString('base64');
  }

  clickOn(button, title) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(button).invoke('attr', 'title').should('contain', title);
      getBody().find(button).first().click();
    });
  }

  clickOnSearchBox(title, text) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(`button[title='${title}']`).should('be.visible');
      getBody().find(`button.reveal-button`).trigger('mouseenter');
      getBody().find(`button.reveal-button`).click();
      getBody().find(this.searchInput).should('be.enabled');
      getBody().find(this.searchInput).focus().invoke('attr', 'placeholder').should('contain', text);
    });
  }

  validateTextPresence(text, InputPlaceholder) {
    cy.enter(this.iframeId).then(getBody => {
      if (!InputPlaceholder) {
        getBody().should('contain', text);
      } else {
        getBody().find(InputPlaceholder).invoke('attr', 'placeholder').should('contain', text);
      }
    });
  }

  clickNewQuery(queryType) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.buttonNewCreateQuery).first().click();
      switch (queryType) {
        case 'Data Query':
          getBody().find('[data-cy="newDataQuery"]').should('be.visible').click();
          getBody().find(this.textFieldDataQuery).should('be.visible');
          break;
        default :
          getBody().find('[data-cy="newParamQuery"]').should('be.visible').click();
          getBody().find(this.paramQueryDisplayName).should('be.visible');
          break;
      }
    });
  }

  validateMultiValueCheckBox(paramType, checkbox) {
    cy.enter(this.iframeId).then(getBody => {
      if (paramType === 'valueList Param Query') {
        getBody().find(this.paramValueListRadioBtn).click();
      }
      getBody().find(this.multiValueParameterCheckBox).scrollIntoView();
      switch (checkbox) {
        case true:
          getBody().find(this.multiValueParameterCheckBox).should('be.checked');
          break;
        default :
          getBody().find(this.multiValueParameterCheckBox).should('not.be.checked');
          break;
      }
    });
    this.clickCancelParamQuery();
  }

  runQuery() {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.executeQueryBtn).click();
      getBody().find(this.spinner).should('not.exist');
    });
  }

  filldataQueryDetails(dataQueryName, querydescription, tagName, formatType, queryText) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.textFieldDataQuery).click();
      getBody().find(this.textFieldDataQuery).type(dataQueryName);
      getBody().find(this.dataQueryDescription).click();
      getBody().find(this.dataQueryDescription).type(querydescription);

      switch (tagName) {
        case '':
          break;
        default :
          getBody().find(this.dataQueryTagName).click();
          getBody().find(this.dataQueryTagName).type(`${tagName}{enter}`);
          break;
      }

      switch (formatType) {
        case 'default':
          getBody().find(this.dataQueryDefaultFormat).click();
          break;
        case 'widgetGroup':
          getBody().find(this.dataQueryGroupWidgetFormat).click();
          break;
        default :
          break;
      }
      getBody().find(this.dataQueryTable).should('be.visible').click();
      getBody().find(this.dataQueryTable).type(queryText, { parseSpecialCharSequences: false });
      getBody().find(this.executeQueryBtn).should('be.visible');
      getBody().find(this.executeQueryBtn).click();
      getBody().find(this.spinner).should('not.exist');
    });
  }

  // Used to Create a Parameter query of Database Type
  fillparamDataBaseQueryDetails(paramQueryDisplayName, paramQueryVariableName, paramQueryDescription, queryText, valueColumn, labelColumn, multipleParamChkBx) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.paramQueryDisplayName).click();
      getBody().find(this.paramQueryDisplayName).type(paramQueryDisplayName);
      getBody().find(this.paramQueryVariableName).click();
      getBody().find(this.paramQueryVariableName).type(paramQueryVariableName);
      getBody().find(this.paramQueryDescription).click();
      getBody().find(this.paramQueryDescription).type(paramQueryDescription);
      getBody().find(this.paramDatabaseQueryRadioBtn).click();

      getBody().find(this.dataQueryTable).click();
      getBody().find(this.dataQueryTable).type(queryText, { parseSpecialCharSequences: false });
      getBody().find(this.executeQueryBtn).should('be.visible');
      getBody().find(this.executeQueryBtn).click();
      getBody().find(this.valueColumnParamDatabase).should('be.visible').click();
      getBody().find(`opr-grouped-list-item[id$='${valueColumn}'] div.list-title`).should('be.visible').click();
      getBody().find(this.labelColumnParamDatabase).should('be.visible').click();
      getBody().find(`opr-grouped-list-item[id$='${labelColumn}'] div.list-title`).should('be.visible').click();

      if (multipleParamChkBx !== undefined) {
        getBody().find(this.multiValueParameterCheckBox).check();
      }
    });
  }

  // Used to update value and label column of param query
  updateparamDataBaseQueryValueAndLabelColumn(valueColumn, labelColumn) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.valueColumnParamDatabase).should('be.visible').click();
      getBody().find(`opr-grouped-list-item[id$='${valueColumn}'] div.list-title`).should('be.visible').click();
      getBody().find(this.labelColumnParamDatabase).should('be.visible').click();
      getBody().find(`opr-grouped-list-item[id$='${labelColumn}'] div.list-title`).should('be.visible').click();
    });
  }

  // Used to Create a Parameter query of Value List Type
  fillparamValueListDetails(paramQueryDisplayName, paramQueryVariableName, paramQueryDescription, labels, values, multipleParamChkBx) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.paramQueryDisplayName).click();
      getBody().find(this.paramQueryDisplayName).type(paramQueryDisplayName);
      getBody().find(this.paramQueryVariableName).click();
      getBody().find(this.paramQueryVariableName).type(paramQueryVariableName);
      getBody().find(this.paramQueryDescription).click();
      getBody().find(this.paramQueryDescription).type(paramQueryDescription);
      getBody().find(this.paramValueListRadioBtn).click();

      this.addLabelValuePair(labels, values);
      if (multipleParamChkBx !== undefined) {
        getBody().find(this.multiValueParameterCheckBox).check();
      }
    });
  }

  addLabelValuePair(labels, values) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.addValueListButton).click();
      for (let i = 0; i < labels.length; i++) {
        getBody().find(this.valueListInput).first().type(labels[i]);
        getBody().find(this.valueListInput).last().type(values[i]);
        getBody().find(this.applyButton).last().click();
        if (i < labels.length - 1) {
          getBody().find(this.addAnotherButton).click();
        }
      }
    });
  }

  fillparamDateSelectorDetails(paramQueryDisplayName, paramQueryVariableName, paramQueryDescription, value, isSingleDate = false) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.paramQueryDisplayName).click();
      getBody().find(this.paramQueryDisplayName).type(paramQueryDisplayName);
      getBody().find(this.paramQueryVariableName).click();
      getBody().find(this.paramQueryVariableName).type(paramQueryVariableName);
      getBody().find(this.paramQueryDescription).click();
      getBody().find(this.paramQueryDescription).type(paramQueryDescription);
      getBody().find(this.paramDateSelectorRadioBtn).click();
      if (isSingleDate) {
        getBody().find(this.singleDateSelectorRadioBtn).click();
      } else {
        getBody().find(this.dateRangeSelectorRadioBtn).click();
      }
      if (!isSingleDate) {
        switch (value) {
          case 'None':
            getBody().find(this.paramDefaultNoValue).click();
            break;
          case 'Value':
            getBody().find(this.paramDefaultValue).click();
            break;
          default :
            break;
        }
      }
    });
  }

  selectDataQueryFromList(dataQueryName) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.queryList).contains(dataQueryName).click();
    });
  }

  editDataQuery(dataQueryName, newDataQueryName, querydescription, tagName, formatType, queryText) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.queryList).contains(dataQueryName).click();
      getBody().find(this.editQueryButton).first().click();
      getBody().find(this.textFieldDataQuery).should('be.visible');
      getBody().find(this.textFieldDataQuery).click();
      getBody().find(this.textFieldDataQuery).clear();
      getBody().find(this.dataQueryDescription).click();
      getBody().find(this.dataQueryDescription).clear();
      getBody().find(this.dataQueryTable).should('be.visible');

      // added this as clear don't work on div
      getBody().find(this.dataQueryTable).type('{selectall}{backspace}');

      getBody().then($ele => {
        if ($ele.find(`#query-text.ng-not-empty`).length > 0) {
          getBody().find(this.dataQueryTable).type('{selectall}{backspace}');
        }
      });
      this.filldataQueryDetails(newDataQueryName || dataQueryName, querydescription, tagName, formatType, queryText);
    });
  }

  defaultValForDtRangeShouldClear(value, predefinedId, textExpected) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.paramDateSelectorRadioBtn).click();
      switch (value) {
        case 'None':
          getBody().find(this.paramDefaultNoValue).click();
          break;
        case 'Value':
          getBody().find(this.paramDefaultValue).click();
          getBody().find(this.dateString).click();
          getBody().find(`[data-cy="${predefinedId}"]`).should('be.visible');
          getBody().find(`[data-cy="${predefinedId}"]`).click();
          break;
        default :
          break;
      }
      getBody().find(this.dateString).should('have.text', textExpected);
      getBody().find(this.paramValueListRadioBtn).click();
      getBody().find(this.valueInput).should('not.have.text', textExpected);
    });
  }
  editDataQueryText(dataQueryName, queryText) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.queryList).contains(dataQueryName).click();
      getBody().find(this.editQueryButton).first().click();
      // added this as clear don't work on div
      getBody().find(this.dataQueryTable).type('{selectall}{backspace}{selectall}{backspace}');
      cy.enter(this.iframeId).then(getBodyContent => {
        getBodyContent().find(this.dataQueryTable).should('be.visible').click();
        getBody().find(this.dataQueryTable).type('{selectall}{backspace}{selectall}{backspace}');
        getBodyContent().find(this.dataQueryTable).type(queryText, { parseSpecialCharSequences: false });
        getBodyContent().find(this.executeQueryBtn).should('be.visible');
        getBodyContent().find(this.executeQueryBtn).click();
        getBodyContent().find(this.spinner).should('not.exist');
      });
      this.clickSaveDataQuery();
      getBody().find(this.queryList).should('be.visible');
    });
  }

  editDatabaseParamQuery(paramQueryName, paramVariableName, valueColumn, labelColumn, valueText, value) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.queryList).contains(paramQueryName).trigger('mouseover').click();
      getBody().find(this.activeHighlightedQuery).invoke('text').then(highlightedQuery => {
        assert.equal(highlightedQuery, `${paramQueryName} (${paramVariableName})`);
      });
      getBody().find(this.editQueryButton).first().click();
      getBody().find(this.spinner).should('not.exist');
      getBody().find(this.executeQueryBtn).should('be.visible');
      getBody().find(this.executeQueryBtn).click();
      getBody().find(this.spinner).should('not.exist');
      getBody().find(this.valueColumnParamDatabase).should('be.visible').click();
      getBody().find(`opr-grouped-list-item[id$='${valueColumn}'] div.list-title`).should('be.visible').click();
      getBody().find(this.labelColumnParamDatabase).should('be.visible').click();
      getBody().find(`opr-grouped-list-item[id$='${labelColumn}'] div.list-title`).should('be.visible').click();
      // added this as clear don't work on div
      switch (valueText) {
        case 'None':
          getBody().find(this.paramDefaultNoValue).click();
          break;
        case 'Value':
          getBody().find(this.paramDefaultValue).click();
          getBody().find(this.valueInput).type(value);
          break;
        default :
          break;
      }
      this.clickSaveDataQuery();
    });
  }

  validateDateTypeandDefaultValue(paramQueryName, paramVariableName, dateTypeTextValue, defaultValueText) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.queryList).contains(paramQueryName).trigger('mouseover').click();
      getBody().find(this.activeHighlightedQuery).invoke('text').then(highlightedQuery => {
        assert.equal(highlightedQuery, `${paramQueryName} (${paramVariableName})`);
      });
      getBody().find(this.dateTypeValueText).invoke('text').then(divvalue => {
        expect(divvalue).contains(dateTypeTextValue);
      });
      getBody().find(this.defaultValueText).should('have.text', defaultValueText);
    });
  }

  handlePredefinedTime(getBody, predefinedId) {
    if (predefinedId === 'WEEK') {
      const calculatedTime = TimeCalculations.calcWeekInformation('WEEK');

      // check calendar start day
      MainPage.checkCalendarStart(calculatedTime, getBody);
      // the selection will close the popover
      getBody().find(`[data-cy="${predefinedId}"]`).click();

      // Check the active dates
      // needs to reopen the popover
      getBody().find(this.dateString).click({ scrollBehavior: false });
      MainPage.checkActiveCalendarDates(calculatedTime, getBody);
      // check Calendar start again
      MainPage.checkCalendarStart(calculatedTime, getBody);
    }
    this.clickSaveDataQuery();
  }

  editQuery({ paramQueryName, predefinedId, checkCalendar, absoluteDate }) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.queryList).contains(paramQueryName).click();
      getBody().find(this.editQueryButton).first().click();
      getBody().find(this.paramDefaultValue).scrollIntoView();
      getBody().find(this.paramDefaultValue).trigger('mouseenter');
      getBody().find(this.paramDefaultValue).click();
      getBody().find(this.dateString).click({ scrollBehavior: false });
      if (checkCalendar) {
        if (predefinedId) {
          this.handlePredefinedTime(getBody, predefinedId);
        } else if (absoluteDate) {
          getBody().within(() => {
            MainPage.selectDateParamsFromSlideout(absoluteDate.startDate, absoluteDate.endDate, true);
          });
          getBody().find(this.dateString).contains(absoluteDate.dateString);
          this.clickSaveDataQuery();
          getBody().find('[data-cy="defaultValueDataCollector"]').contains(absoluteDate.dateString);
        }
      } else {
        if (predefinedId) {
          getBody().find(`[data-cy="${predefinedId}"]`).click();
        }
        this.clickSaveDataQuery();
      }
    });
  }

  validateQueryResults(numOfColumns, expectedColumns, expectedValueArray = []) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.queryResults).should('have.length', numOfColumns);
      getBody().find(this.queryResults).each(($elem, index) => {
        expect(expectedColumns[index]).contains($elem.text().trim());
      });
      // enhanced to check multiple values in table
      // default value of expectedValueArray is empty array just to make it compatible with existing cases.
      expectedValueArray.forEach(row => {
        if (Array.isArray(row)) {
          row.forEach(rowItem => {
            getBody().contains(rowItem, { matchCase: false });
          });
        } else {
          getBody().contains(row, { matchCase: false });
        }
      });
    });
  }

  validateErrorAlert(message) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find('.alert.alert-danger').invoke('text').then(errText => {
        expect(errText).contains(message);
      });
    });
  }

  validateDefaultConnection(defHost, defPort, defDBName, defUser) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.dropdownMore).click();
      getBody().find(this.optionDBSettings).click();
      getBody().find(this.hostName).should('have.value', defHost);
      getBody().find(this.hostPort).should('have.value', defPort);
      getBody().find(this.tlsCheckbox).should('not.be.checked');
      getBody().find(this.attachCertificate).should('not.exist');
      getBody().find(this.dbName).should('have.value', defDBName);
      getBody().find(this.dbUser).should('have.value', defUser);
    });
  }

  updateDBConnection(hostName, port, tls, dbName, login, password) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.dropdownMore).click();
      getBody().find(this.optionDBSettings).click();
      getBody().find(this.hostName).first().click().clear().type(hostName);
      getBody().find(this.hostPort).click().clear().type(port);
      if (tls) {
        // tls check is missing so far
      }
      getBody().find(this.dbName).click().clear().type(dbName);
      getBody().find(this.dbUser).click().clear().type(login);
      getBody().find(this.dbPassword).click().clear().type(password);
      getBody().find(this.dbPasswordConfirm).click().clear().type(password);

      getBody().find(this.buttonTestConnection).click();
      getBody().find(this.connectionResult).contains('Test connection succeeded');

      getBody().find(this.buttonSaveDBSetting).click();
    });
  }

  clickSaveDataQuery() {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.saveDataQueryButton).click();
      getBody().find(this.spinner).should('not.exist');
    });
  }

  clickCancelDataQuery() {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.cancelDataQueryButton).click();
      getBody().find(this.spinner).should('not.exist');
    });
  }

  clickCancelParamQuery() {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.cancelParamQueryButton).click();
      getBody().find(this.spinner).should('not.exist');
    });
  }

  enterDataQueryDetails() {
    cy.get(this.iframeId).then($iframe => {
      cy.wrap($iframe.contents().find(this.textField)).type('name of data query');
    });
  }

  searchAndDeleteElement(queryName) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.searchButton).click();
      getBody().find(this.searchInput).type(queryName);
      this.deleteAQuery(queryName);
      getBody().contains(queryName, { matchCase: true }).should('not.exist');
      getBody().find(this.clearSearchInput).click();
    });
  }

  deleteAQuery(queryName) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.queryList).contains(queryName).click();
      getBody().find(this.deleteButtonActiveElement).click();
      getBody().find('.delete-mode-yes').click();
      getBody().contains(queryName, { matchCase: true }).should('not.exist');
    });
  }

  deleteAParamQuery(paramDisplayName, paramVariableName) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.queryList).contains(paramDisplayName).trigger('mouseover').click();
      getBody().find(this.activeHighlightedQuery).invoke('text').then(highlightedQuery => {
        assert.equal(highlightedQuery, `${paramDisplayName} (${paramVariableName})`);
      });
      getBody().find(this.deleteButtonActiveElement).click();
      getBody().find('.delete-mode-yes').click();
      getBody().contains(paramDisplayName, { matchCase: true }).should('not.exist');
    });
  }

  deleteMultipleQuery(queryName) {
    cy.enter(this.iframeId).then(getBody => {
      queryName.forEach(element => getBody().find(this.queryList).contains(element).click({ ctrlKey: true }));
      getBody().find('[data-cy="buttonDeleteSelectedQueries"]').click();
      getBody().find('#btnDialogSubmit').click();
      queryName.forEach(element => getBody().contains(element, { matchCase: true }).should('not.exist'));
    });
  }

  checkDataQueryValues(queryName, queryDes, tagsChannel, format, queryText, expectedColumns) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.queryList).contains(queryName).click();
      getBody().find(this.editQueryButton).first().click();

      // test name
      getBody().find(this.textFieldDataQuery).should($input => {
        expect($input.val()).to.include(queryName);
      });

      // test description
      getBody().find(this.dataQueryDescription).should($input => {
        expect($input.val()).to.include(queryDes);
      });

      // test channel
      tagsChannel.forEach(element => getBody().find('.itemArrayContainer span').contains(element));

      // test format
      if (format === 'default') {
        getBody().find(this.dataQueryDefaultFormat).should('be.checked');
        getBody().find(this.dataQueryGroupWidgetFormat).should('not.be.checked');
      } else if (format === 'widgetGroup') {
        getBody().find(this.dataQueryDefaultFormat).should('not.be.checked');
        getBody().find(this.dataQueryGroupWidgetFormat).should('be.checked');
      }

      // test query
      getBody().find('.opr-code-editor').contains(queryText);

      // test query result
      getBody().find(this.queryResults).each(($elem, index) => {
        expect(expectedColumns[index]).contains($elem.text().trim());
      });
    });
    this.clickCancelDataQuery();
  }

  checkParamQueryDatabaseTypeValues(queryName, queryVariableName, queryDescription, queryText, expectedColumns, valueColumnSelected, labelColumnSelected, defaultformat, defaultformatvalue) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.queryList).contains(queryName).trigger('mouseover').click();
      getBody().find(this.activeHighlightedQuery).invoke('text').then(highlightedQuery => {
        assert.equal(highlightedQuery, `${queryName} (${queryVariableName})`);
      });
      getBody().find(this.editQueryButton).first().click();
      getBody().find(this.spinner).should('not.exist');

      // read paramQueryDisplayName
      getBody().find(this.paramQueryDisplayName).should($input => {
        expect($input.val()).to.include(queryName);
      });

      // read paramQueryVariableName
      getBody().find(this.paramQueryVariableName).should($input => {
        expect($input.val()).to.include(queryVariableName);
      });

      // read paramQuery Description
      getBody().find(this.paramQueryDescription).should($input => {
        expect($input.val()).to.include(queryDescription);
      });

      // read Query
      getBody().find('div.opr-code-editor').contains(queryText);

      // read query result
      getBody().find(this.queryResults).each(($elem, index) => {
        expect(expectedColumns[index]).contains($elem.text().trim());
      });

      getBody().find(`${this.valueColumnParamDatabase}>div`).contains(valueColumnSelected);

      // read labelColumnParamDatabase value
      getBody().find(`${this.labelColumnParamDatabase}>div`).contains(labelColumnSelected);

      // test format
      if (defaultformat === 'defaultnovalue') {
        getBody().find(this.paramDefaultNoValue).should('be.checked');
        getBody().find(this.paramDefaultValue).should('not.be.checked');
      } else if (defaultformat === 'defaultvalue') {
        getBody().find(this.paramDefaultValue).should('be.checked');
        getBody().find(this.paramDefaultNoValue).should('not.be.checked');
        getBody().find(this.valueInput).should('have.value', defaultformatvalue);
      }
    });
    this.clickCancelParamQuery();
  }

  updateQuery(queryName, queryTags, dataQueryDefault) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.queryList).contains(queryName).click();
      getBody().find(this.editQueryButton).first().click();
      this.filldataQueryDetails('updated', 'updated', queryTags, dataQueryDefault, '0');
      this.clickSaveDataQuery();
    });
  }

  duplicateQuery(name) {
    cy.enter(this.iframeId).then(getBody => {
      getBody().find(this.queryList).contains(name).click();
      getBody().find(this.duplicateQueryButton).first().click();
    });
    this.clickSaveDataQuery();
  }

  selectColumn(columnType, val) {
    cy.enter(this.iframeId).then(getBody => {
      if (columnType === 'value') {
        getBody().find(this.column).eq(0).click();
      } else if (columnType === 'label') {
        getBody().find(this.column).eq(1).click();
      }
      getBody().find('dropdown').find(`a[title=${val}]`).click();
    });
  }

  selectDefaultValue(val) {
    cy.enter(this.iframeId).then(getBody => {
      if (val === 'none') {
        getBody().find(this.paramDefaultNoValue).parent().click();
      } else {
        const arr = val.split(':');
        const value = arr[1];
        getBody().find(this.paramDefaultValue).parent().click();
        getBody().find(this.valueEmptyValidation);
        getBody().find(this.valueInput).type(value);
        getBody().find(this.valueEmptyValidation).should('not.be.visible');
      }
    });
  }

  createParamQueryWithAPI(
    {
      availableColumns = [],
      dims = [],
      description = undefined,
      displayName = '',
      labelValueList = [],
      paramQueryType = '',
      predefinedValue = '',
      queryText = '',
      resultFormat = '',
      selectedColumn = '',
      selectedColumnValue = '',
      selectedDate = '',
      selectedoption = '',
      tags = [],
      value = '',
      variableName = ''
    }) {
    const parameterQuery = {
      dataCollector: {
        active: true,
        data: {
          availableColumns,
          dims,
          description,
          displayName,
          labelValueList,
          paramQueryType,
          predefinedValue,
          queryText,
          resultFormat,
          selectedColumn,
          selectedColumnValue,
          selectedDate,
          selectedoption,
          tags,
          value,
          variableName
        },
        name: `${displayName} (${variableName})`,
        type: 'param'
      }
    };

    this.createDataCollectorQuery(parameterQuery);
  }

  createDataQueryWithAPI(
    {
      availableColumns = [],
      description = '',
      dims = [],
      queryText = '',
      resultFormat = '',
      sampleQueryResult = {},
      tags = [],
      name = ''
    }) {
    const dataQuery = {
      dataCollector: {
        active: true,
        data: {
          availableColumns,
          description,
          dims,
          queryText,
          resultFormat,
          sampleQueryResult,
          tags
        },
        name
      }
    };
    this.createDataCollectorQuery(dataQuery);
  }

  createDataCollectorQuery(queryBody) {
    // admin user login needed
    cy.getCookie('secureModifyToken').then(secureToken => {
      cy.getCookie('bvd.session').then(session => {
        cy.request({
          method: 'POST',
          url: `rest/${Cypress.env('API_VERSION')}/dataCollector`,
          body: queryBody,
          headers: {
            'bvd.session': session.value,
            'X-Secure-Modify-Token': secureToken.value
          }
        });
      });
    });
  }
}

export default new DataCollectorPage();
