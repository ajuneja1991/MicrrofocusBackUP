const shared = require('../../shared/shared');
import 'cypress-iframe';

const user = Cypress.env('username');
const passwd = Cypress.env('password');
const payload = {
  passwordCredentials: {
    username: user,
    password: passwd
  },
  tenantName: Cypress.env('tenant')
};

describe('Schedule List', () => {
  const schedule = {
    user: 'admin',
    timeZone: 'Asia/Kolkata',
    bvdUrl: `${Cypress.env('IDM_BASE_URL')}/bvd/#/show/Welcome`,
    suiteUrl: `${Cypress.env('IDM_BASE_URL')}/webtopdf`,
    schedule: '1 1 1 1 1',
    tenant: 'Provider',
    data: {
      subject: 'Welcome dashboard',
      to: 'abcd@gmail.com, efgh@gmail.com',
      bcc: 'xyz@abc.com',
      cc: '1234@abc.com',
      body: 'Weekly Report',
      scheduleLabel: 'Event CI',
      description: 'This is the report generated from system',
      format: 'PDF',
      fileName: 'Event CI.pdf'
    },
    pdfConfiguration: {
    // eslint-disable-next-line camelcase
      page_format: 'A4',
      delay: 30,
      // eslint-disable-next-line camelcase
      css_selector: '.rendered',
      landscape: false,
      // eslint-disable-next-line camelcase
      print_background: false,
      // eslint-disable-next-line camelcase
      display_header_footer: false,
      scale: 1,
      pages: ' ',
      // eslint-disable-next-line camelcase
      margin_top: '0cm',
      // eslint-disable-next-line camelcase
      margin_bottom: '0cm',
      // eslint-disable-next-line camelcase
      margin_left: '0cm',
      // eslint-disable-next-line camelcase
      margin_right: '0cm'
    }
  };
  const createSchedule = body => {
    let xAuthToken;
    cy.request(
      'POST',
      `${Cypress.env('IDM_BASE_URL')}/idm-service/v3.0/tokens`,
      payload
    ).then(result => {
      xAuthToken = result?.body?.token?.id;
      cy.request({
        method: 'POST',
        url: `${Cypress.env('IDM_BASE_URL')}${shared.webtopdfContextRoot}/v2/jobs`,
        body,
        headers: {
          'X-Auth-Token': xAuthToken
        }
      }).then(res => {
        expect(res.status).to.eq(200);
      });
    });
  };

  const deleteAllSchedules = () => {
    let xAuthToken;
    cy.request(
      'POST',
      `${Cypress.env('IDM_BASE_URL')}/idm-service/v3.0/tokens`,
      payload
    ).then(result => {
      xAuthToken = result?.body?.token?.id;
      cy.request({
        method: 'GET',
        url: `${Cypress.env('IDM_BASE_URL')}${shared.webtopdfContextRoot}/v2/jobs?type=schedule`,
        headers: {
          'X-Auth-Token': xAuthToken
        }
      }).then(res => {
        const jobIdsList = res.body.data.map(job => job.jobId);
        cy.request({
          method: 'DELETE',
          url: `${Cypress.env('IDM_BASE_URL')}${shared.webtopdfContextRoot}/v2/jobs`,
          body: jobIdsList,
          headers: {
            'X-Auth-Token': xAuthToken
          }
        }).then(response => {
          expect(response.status).to.eq(200);
        });
      });
    });
  };

  before(() => {
    deleteAllSchedules();
  });

  beforeEach(() => {
    cy.intercept(`${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/system`).as('foundationPageloadSystem');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pagesWithComponents/SCHEDULESPAGE*`
    }).as('getPage');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/session/user`
    }).as('getUser');
    cy.intercept({
      method: 'GET',
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/pages/toc*`
    }).as('getTOC');
    cy.intercept({
      path: `${shared.exploreContextRoot}/rest/${Cypress.env('API_VERSION')}/authtoken`
    }).as('getXAuthToken');
    cy.intercept({
      method: 'GET',
      path: `${shared.webtopdfContextRoot}/v2/jobs?type=schedule`
    }).as('getJobs');
    cy.intercept({
      method: 'GET',
      path: `${shared.webtopdfContextRoot}/v2/jobs/*`
    }).as('getJob');
    cy.intercept({
      method: 'POST',
      path: `${shared.webtopdfContextRoot}/v2/jobs`
    }).as('postJob');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.webtopdfContextRoot}/v2/jobs/*`
    }).as('deleteJob');
    cy.intercept({
      method: 'DELETE',
      path: `${shared.webtopdfContextRoot}/v2/jobs`
    }).as('deleteMultipleJobs');
    cy.intercept({
      method: 'PUT',
      path: `${shared.webtopdfContextRoot}/v2/jobs/*`
    }).as('updateJob');
    createSchedule(schedule);
    cy.bvdLogin();
    cy.visit('/SCHEDULESPAGE?_m=2_L2_SA_Schedules');
    cy.wait(['@foundationPageloadSystem', '@getUser', '@getUser', '@getUser', '@getTOC', '@getPage', '@getXAuthToken', '@getJobs']);
  });

  it('check for list content and actions when mouse is hovered over the schedule ', () => {
    cy.get('[data-cy="list-item-0"]').within(() => {
      cy.get('[data-cy="schedule-label"]');
      cy.get('[data-cy="schedule-description"]');
      cy.get('[data-cy="schedule-author"]');
      cy.get('[data-cy="schedule-format"]');
      cy.get('[data-cy="report-name"]');
    });
    cy.get(`[data-cy="list-item-0"]`).trigger('mouseenter');
    cy.get(`[data-cy="action-item-qtm-icon-edit-button"]`);
    cy.get(`[data-cy="action-item-qtm-icon-download-document-button"]`);
    cy.get(`[data-cy="action-item-qtm-icon-delete-button"]`);
  });

  it('on download action should get banner telling PDF export is started', () => {
    cy.get('[data-cy="list-item-0"]').trigger('mouseenter').within(() => {
      cy.get(`[data-cy="action-item-qtm-icon-download-document-button"]`).click();
      cy.wait(['@getXAuthToken', '@getJob', '@getXAuthToken', '@postJob']);
    });
    cy.bvdCheckToast('PDF generation started. You will be notified when the file is ready.');
  });

  it('on edit action side panel should open with schedule details and on editing details, list should get updated', () => {
    deleteAllSchedules();
    createSchedule(schedule);
    cy.visit('/SCHEDULESPAGE?_m=2_L2_SA_Schedules');
    let scheduleLabel = '';
    let reportName = '';
    cy.get('[data-cy="list-item-0"]').find('[data-cy="schedule-label"]').then(label => {
      scheduleLabel = label.text();
    }).then(() => {
      cy.get('[data-cy="list-item-0"]').find('[data-cy="report-name"]').then(report => {
        reportName = report.text();
      });
    }).then(() => {
      cy.get('[data-cy="list-item-0"]').trigger('mouseenter').find('[data-cy="action-item-qtm-icon-edit-button"]').click();
      cy.wait(['@getXAuthToken', '@getJob']);
      // verify the data in the side panel
      cy.get('[data-cy="schedule-label-input"]').should('have.value', scheduleLabel);
      cy.get('[data-cy="report-or-page-name"]').should('contain', reportName);
      cy.get('[data-cy="paper-list-dropdown"] input').should('have.value', 'A4');
      cy.get(`[data-cy="email-to-input"]`).should('have.value', schedule.data.to);
      cy.get(`[data-cy="email-cc-input"]`).should('have.value', schedule.data.cc);
      cy.get(`[data-cy="email-bcc-input"]`).should('have.value', schedule.data.bcc);
      cy.get(`[data-cy="email-subject-input"]`).should('have.value', schedule.data.subject);
      cy.get(`[data-cy="schedule-email-body"]`).should('have.value', schedule.data.body);
      cy.get(`[data-cy="file-name-input"]`).should('have.value', 'Event CI');
      // updated the details
      cy.get('[data-cy="schedule-label-input"]').type('{selectall}{backspace}editedScheduleLabel');
      cy.get('[data-cy="cron-expression-input"]').type('{selectall}{backspace}0 0 30 6 *');
      cy.get('[data-cy="file-name-input"]').type('{selectall}{backspace}editedFileName');
      cy.get('[data-cy="append-time-to-report-name"]').click();
      cy.get('[data-cy="email-to-input"]').type('{selectall}{backspace}test1@test.com,test2@xyz.com');
      cy.get('[data-cy="email-subject-input"]').type('{selectall}{backspace}editedSubject');
      cy.get('[data-cy="submit-button"]').click();
      cy.wait(['@getXAuthToken', '@updateJob']);
      cy.bvdCheckToast('Successfully updated the schedule');
      cy.get('[data-cy="list-item-0"]').within(() => {
        cy.get('[data-cy="schedule-label"]').should('contain', 'editedScheduleLabel');
        cy.get('[data-cy="cron-summary"]').should('contain', 'At 12:00 AM, on day 30 of the month, only in June');
        cy.get('[data-cy="schedule-format"]').should('contain', 'PDF');
        cy.get('[data-cy="schedule-author"]').should('contain', 'admin');
      });
      cy.get('[data-cy="list-item-0"]').trigger('mouseenter').within(() => {
        cy.get(`[data-cy="action-item-qtm-icon-edit-button"]`).click();
      });
      // reopen side panel check for the updated values
      cy.get('[data-cy="schedule-label-input"]').invoke('val').then(text => {
        expect(text).to.be.equal('editedScheduleLabel');
      });
      cy.get(`[data-cy="cron-expression-input"]`).should('have.value', '0 0 30 6 *');
      cy.get(`[data-cy="file-name-input"]`).should('have.value', 'editedFileName');
      cy.get('[data-cy="append-time-to-report-name"] input').should('have.attr', 'aria-checked', 'true');
      cy.get(`[data-cy="email-to-input"]`).should('have.value', 'test1@test.com,test2@xyz.com');
      cy.get(`[data-cy="email-subject-input"]`).should('have.value', 'editedSubject');
    });
  });

  it('on deleting the schedule list should get updated', () => {
    cy.get('[data-cy="list-item-0"]');
    cy.get('[data-cy="uif-list"]').children().then(noOfSchedules => {
      cy.get('[data-cy="list-item-0"]').trigger('mouseenter').within(() => {
        cy.get(`[data-cy="action-item-qtm-icon-delete-button"]`).click();
        cy.get(`[data-cy="action-confirmation-bar-text"]`);
        cy.get(`[data-cy="action-cancel-button-qtm-icon-delete"]`);
        cy.get(`[data-cy="action-confirmation-button-qtm-icon-delete"]`).click();
        cy.wait(['@getXAuthToken', '@deleteJob']);
      });
      cy.bvdCheckToast('Successfully deleted the schedule');
      cy.get('[data-cy="uif-list"]').children().should('have.length', noOfSchedules.length - 1);
    });
  });

  it('on adding new schedule refresh page and check for the newly created job.', () => {
    cy.get('[data-cy="list-item-0"]');
    cy.get('[data-cy="uif-list"]').children().then(noOfSchedules => {
      schedule.data.scheduleLabel = 'AMS Daily System Report';
      schedule.schedule = '1 1 1 1 *';
      schedule.data.description = 'Runs once in a year';
      createSchedule(schedule);
      cy.visit('/SCHEDULESPAGE?_m=schedules');
      cy.wait(['@getPage', '@getXAuthToken', '@getJobs']);
      cy.get('[data-cy="uif-list"]').children().should('have.length', noOfSchedules.length + 1);
    });
  });

  it('on selecting single and multiple schedules checking visibility of toolbar actions.', () => {
    cy.get('[data-cy="list-item-0"]');
    cy.get(`[data-cy="list-item-0"]`).trigger('mouseenter');
    cy.get('[data-cy="list-item-0-checkbox"]').click();
    cy.get('[data-cy="toolbar-action-qtm-icon-edit"]');
    cy.get('[data-cy="toolbar-action-qtm-icon-delete"]');
    cy.get('[data-cy="uifToolbar-search-input"]');
    cy.get(`[data-cy="list-item-1"]`).trigger('mouseenter');
    cy.get('[data-cy="list-item-1-checkbox"]').click();
    cy.get('[data-cy="toolbar-action-qtm-icon-edit"]').should('not.exist');
    cy.get('[data-cy="toolbar-action-qtm-icon-delete"]');
  });

  it('on search list should get updated and on search reset list should have previous values', () => {
    schedule.data.scheduleLabel = 'Schedule for search';
    schedule.schedule = '1 1 1 1 *';
    schedule.data.description = 'Runs once in a year';
    createSchedule(schedule);
    cy.visit('/SCHEDULESPAGE?_m=schedules');
    cy.wait(['@getPage', '@getXAuthToken', '@getJobs']);
    cy.get('[data-cy="list-item-0"]');
    cy.get('[data-cy="uif-list"]').children().then(noOfSchedules => {
      cy.get('[data-cy="uifToolbar-search-input"]').type('{selectall}{backspace}Schedule for search');
      cy.get('[data-cy="uif-list"]').children().should('have.length', 1);
      cy.get('[data-cy="uifToolbar-search-input"]').type('{selectall}{backspace}');
      cy.get('[data-cy="uif-list"]').children().should('have.length', noOfSchedules.length);
      cy.get('[data-cy="uifToolbar-search-input"]').type('{selectall}{backspace}zzxyb');
      cy.get('[data-cy="uif-list"]').find('p').should('have.class', 'no-search-result');
      cy.get('[data-cy="uifToolbar-reset-search-button"]').click();
      cy.get('[data-cy="uif-list"]').children().should('have.length', noOfSchedules.length);
      cy.get('[data-cy="uifToolbar-search-button"]');
    });
  });

  it('performing edit action from toolbar', () => {
    cy.get(`[data-cy="list-item-0"]`).trigger('mouseenter');
    cy.get('[data-cy="list-item-0-checkbox"]').click();
    cy.get('[data-cy="toolbar-action-qtm-icon-edit"]').click();
    cy.wait(['@getXAuthToken', '@getJob']);
    cy.get('[data-cy="schedule-label-input"]');
    cy.get(`[data-cy="schedule-label-description"]`);
    cy.get(`[data-cy="email-to-input"]`);
    cy.get('[data-cy="schedule-label-input"]').type('{selectall}{backspace}editedFromToolBar');
    cy.get('[data-cy="cron-expression-input"]').type('{selectall}{backspace}0 0 30 1 *');
    cy.get('[data-cy="submit-button"]').click();
    cy.wait(['@getXAuthToken', '@updateJob']);
    cy.bvdCheckToast('Successfully updated the schedule');
  });

  it('delete multiple schedules', () => {
    cy.get('[data-cy="list-item-0"]');
    cy.get('[data-cy="uif-list"]').children().then(noOfSchedules => {
      cy.get(`[data-cy="list-item-0"]`).trigger('mouseenter');
      cy.get('[data-cy="list-item-0-checkbox"]').click();
      cy.get(`[data-cy="list-item-1"]`).trigger('mouseenter');
      cy.get('[data-cy="list-item-1-checkbox"]').click();
      cy.get('[data-cy="toolbar-action-qtm-icon-delete"]').click();
      cy.get('[data-cy="mondrianModalDialogButton"]').click();
      cy.wait(['@getXAuthToken', '@deleteMultipleJobs']);
      cy.bvdCheckToast('Successfully deleted the schedule');
      cy.get('[data-cy="uif-list"]').children().should('have.length', noOfSchedules.length - 2);
    });
  });

  after(() => {
    deleteAllSchedules();
  });
});
