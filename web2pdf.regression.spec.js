describe('Web To Pdf test cases', () => {
  const webtopdfCliPath = 'cypress/integration/bvd/reporting/cli/pdf-print';

  it('Check error is thrown if no username is provided', () => {
    cy.exec(`"${webtopdfCliPath}" --url "https://abc.xyy.com:19443/bvd/#/show/Welcome" --user --pass Test --suite_url "https://abc.xyy.com:19443"`, { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Exited with ERROR: Invalid username!');
  });

  it('Check error is thrown if no password is provided', () => {
    cy.exec(`"${webtopdfCliPath}" --url "https://abc.xyy.com:19443/bvd/#/show/Welcome" --user admin  --suite_url "https://abc.xyy.com:19443" --pass`, { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Exited with ERROR: Invalid password!');
  });

  it('Check error is thrown if wrong output file is provided', () => {
    cy.exec(`"${webtopdfCliPath}" --url "https://abc.xyz.net:19443/bvd/#/show/Welcome" --suite_url "https://abc.xyz.net:19443" --user admin --pass Control@123 --out kp`, { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Exited with ERROR: Invalid file extension given. Please give either .pdf or .zip!');
  });

  it('Check error is thrown if url is not provided for print now job', () => {
    cy.exec(`"${webtopdfCliPath}" --suite_url "https://abc.xyz.net:19443" --user admin --pass Control@123`, { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Exited with ERROR: The option --url to specify the web page from which to generate the PDF/CSV, is not specified.');
  });

  it('Check error is thrown if invalid page format is provided', () => {
    cy.exec(`"${webtopdfCliPath}" --url "https://abc.xyz.net:19443/bvd/#/show/Welcome" --suite_url "https://abc.xyz.net:19443" --user admin --pass Control@123 --page_format "inorrect"`, { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Exited with ERROR: Invalid page format, page format should be one of these: Letter, Legal, Tabloid, Ledger, A0, A1, A2, A3, A4, A5, A6');
  });

  it('Check error is thrown if invalid strict host check option is provided', () => {
    cy.exec(`"${webtopdfCliPath}" --url "https://abc.xyz.net:19443/bvd/#/show/Welcome" --suite_url "https://abc.xyz.net:19443" --user admin --pass Control@123 --strict_host_check 'op'`, { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Exited with ERROR: ERROR: Invalid option for StrictHostKeyChecking, type either yes/no');
  });

  it('Check error is thrown if schedule is not provided while creating a print job', () => {
    cy.exec(`"${webtopdfCliPath}" --create_job --user admin --pass Test --url "https://abc.xyz.net:19443/bvd/#/show/Welcome"  --suite_url "https://abc.xyy.com:19443" --schedule_label "System generated report"`, { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Exited with ERROR: The option --schedule to a schedule for the job is not specified.');
  });

  it('Check error is thrown if suite_url is not provided while creating a print job', () => {
    cy.exec(`"${webtopdfCliPath}" --create_job --schedule "5 4 * * sun" --user admin --pass Test --schedule_label "Weekly Report" --url "https://abc.xyz.net:19443/bvd/#/show/Welcome"`)
      .its('stderr')
      .should('contain', 'Exited with ERROR: Missing Suite URL');
  });

  it('Check error is thrown if suite_url is not provided while listing all the jobs', () => {
    cy.exec(`"${webtopdfCliPath}" --list_jobs --user admin --pass Test`)
      .its('stderr')
      .should('contain', 'Exited with ERROR: Missing Suite URL');
  });

  it('Check error is thrown if job id is not provided while getting the status of a job', () => {
    cy.exec(`"${webtopdfCliPath}" --job_status --user admin --pass Test --suite_url "https://abc.xyy.com:19443"`, { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Exited with ERROR: "job_status" must be a string');
  });

  it('Check error is thrown if job id is not provided while deleting a job', () => {
    cy.exec(`"${webtopdfCliPath}" --delete_job --user admin --pass Test --suite_url "https://abc.xyy.com:19443"`, { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Exited with ERROR: "delete_job" must be a string');
  });

  it('Check error is thrown if scheduleLabel is not provided while creating a job', () => {
    cy.exec(`"${webtopdfCliPath}" --create_job --user admin --pass Test --suite_url "https://abc.xyy.com:19443" --url "https://abc.xyz.net:19443/bvd/#/show/Welcome" --schedule "1 1 1 1 *" --to "abcdgjdk@gmailjdf.com"`, { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Exited with ERROR: The option --schedule_label for the job is not specified.');
  });
});

