/* eslint-disable no-async-promise-executor */
/* eslint-disable no-unused-expressions */
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const expect = require('chai').expect;
const moment = require('moment');
const parseArgs = require('minimist');
const superagent = require('superagent');
const { readFile, readdir } = require('fs/promises');

const minimistOptions = {
  string: ['user', 'pass', 'url', 'suiteUrl'],
  // eslint-disable-next-line id-length
  alias: { u: 'user', p: 'password', l: 'url', s: 'suiteUrl' }
};
const argv = parseArgs(process.argv.slice(2), minimistOptions);
const SUITE_URL = argv.s;
const user = argv.u;
const pass = argv.p;
const PRINT_URL = argv.l;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms)); // function for sleep
const access = fs.createWriteStream('/tmp/webtopdfTests.log');
process.stdout.write = process.stderr.write = access.write.bind(access);

let webToPdfCli, bvdCli;

const cleanUpZipAndCsv = async () => {
  await exec(`rm -rf *.csv`);
  await exec(`rm -rf *.zip`);
};

const importBVDFiles = async () => {
  try {
    console.log('Started importing the BVD files\n');
    const BVDFiles =  await readdir('.');
    BVDFiles.forEach(async bvdFile => {
      if (bvdFile.includes('.bvd')) {
        await exec(`${bvdCli} -i -s "no" -u admin -p Control@123 -l "${SUITE_URL}/bvd" --file ${bvdFile}`);
      }
    });
    console.log('Finished importing the BVD files\n');
  } catch (error) {
    console.error('Error while importing the BVD files. Aborting the test!!!', error?.message);
    process.exit(0);
  }
}

const setPreRequisiteForTest = async () => {
  try {
    if (process.platform === 'win32') {
      webToPdfCli = 'windows\\pdf-print.exe';
      bvdCli = 'bvd-cli-win.exe';
    } else {
      webToPdfCli = 'linux/pdf-print';
      bvdCli = './bvd-cli-linux';
    }
    console.log('Starting the download of BVD CLI');
    await exec(`curl -k "${SUITE_URL}/bvd/downloads/bvd-cli.zip" -o bvd-cli.zip`);
    console.log('Finished downloading of BVD CLI');
    await exec(`unzip bvd-cli.zip`);
    console.log('Unzipped BVD CLI');
    console.log('Starting the download of WebtoPDF CLI');
    await exec(`curl -k "${SUITE_URL}/webtopdf/getcli" -o pdf-print.zip`);
    console.log('Finished downloading of WebtoPDF CLI');
    await exec(`unzip pdf-print.zip`);
    console.log('Unzipped WebtoPDF CLI');
  } catch (error) {
    console.error('Error while setting up the pre requisites for the test', error?.message);
    await exec('rm -rf bvd-cli*');
    await exec('rm -rf linux/ windows/ macos/ pdf-print.zip');
    process.exit(); // If any error happens in the pre requisite step no need to continue the test further since all the tests depend on this pre requisite step.
  }
}

const cleanUpExistingJobs = async () => {
  try {
    const xAuthToken = await getIdmToken(user);
    superagent.get(`${SUITE_URL}/webtopdf/v1/jobs`).set('X-Auth-Token', xAuthToken).disableTLSCerts().end(async (err, jobsList) => {
      if (err) {
        console.error('Failed while cleaning up the existing jobs');
        console.log(err);
        return;
      }
      for (let i = 0; i < jobsList.body.data.length; i++) {
        const element = jobsList.body.data[i];
        console.log('Started the Job deletion\n');
        const stdout = await exec(`${webToPdfCli} --strict_host_check "no" --delete_job ${element.jobId} --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
        console.log('Deleted the existing job\n');
        expect(stdout.stdout).to.be.equal('Job has been deleted successfully\n');
      }
      console.log('Cleaned up existing job executed successfully\n');
      await startTest();
      return;
    });
  } catch (err) {
    console.log(err);
    return;
  }
};

const updateUserSettings = (timeZone = '', xAuthToken = '', useSystemTimeZone = false) => new Promise((resolve, reject) => {
  const requestBody = {
    userDetails: {
      name: "admin",
      settings: {
        timezone: timeZone,
        useSystemTimeZone,
        hyperlinkMessage: { value: "visible" },
        pdfSettings: {
          header: true,
          orientation: "portrait",
          selectedPaperSize: "Letter",
          background: false,
          pages: "All",
          pdfPages: 1,
          format: "PDF"
        }
      }
    }
  }
  superagent.put(`${SUITE_URL}/bvd/rest/v2/session/user`).set('X-Auth-Token', xAuthToken).disableTLSCerts().send(requestBody).end(async (err, response) => {
    if (err) {
      console.error('Failed while updating the timezone settings');
      console.error(err);
      return reject(err);
    }
    return resolve('User settings updated successfully');
  });
});

const testPrintNow = async () => {
  try {
    const pdfFileNameRegex = /[A-Za-z]-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}.pdf/ // Pattern for checking file name contains appended time stamp
    let stdout = await exec(`${webToPdfCli} --strict_host_check "no" --list_jobs --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
    console.log('1.) Should throw no jobs found');
    expect(stdout.stdout).to.be.equal('No jobs found\n');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --user ${user} --pass ${pass} --suite_url ${SUITE_URL} --url ${PRINT_URL}`);
    const pdfFileNameWithTimeStamp = (await readdir('.')).find(fileName => fileName.startsWith('Welcome') && fileName.endsWith('.pdf'));
    console.log(`2.) Should generate the ${pdfFileNameWithTimeStamp}`);

    console.log('3.) Should check generated whether PDF file name contains timestamp');
    expect(pdfFileNameRegex.test(pdfFileNameWithTimeStamp)).to.be.true;
    
    expect(stdout.stdout.includes(`PDF is generated\nSaved file: ${pdfFileNameWithTimeStamp}`)).to.be.true;

    stdout = await exec(`ls -lrt | grep ${pdfFileNameWithTimeStamp} | wc -l`);
    console.log('4.) Should check for the generated PDF - Welcome.pdf');
    expect(stdout.stdout).to.be.equal('1\n');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --list_jobs --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
    console.log('5.) Should throw no jobs found\n');
    expect(stdout.stdout).to.be.equal('No jobs found\n');

    console.log('Print now job flow executed successfully\n');
    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

const testPrintNowNonProvider = async () => {
  try {
    const pdfFileNameRegex = /[A-Za-z]-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}.pdf/ // Pattern for checking file name contains appended time stamp
    let stdout = await exec(`${webToPdfCli} --strict_host_check "no" --list_jobs --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
    console.log('1.) Should throw no jobs found');
    expect(stdout.stdout).to.be.equal('No jobs found\n');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --user "customer3Admin@microfocus.com" --pass ${pass} --suite_url ${SUITE_URL} --url ${PRINT_URL} --tenant "Customer3"`);
    const pdfFileNameWithTimeStamp = (await readdir('.')).find(fileName => fileName.startsWith('Welcome') && fileName.endsWith('.pdf'));
    console.log(`2.) Should generate the ${pdfFileNameWithTimeStamp}`);

    console.log('3.) Should check generated whether PDF file name contains timestamp');
    expect(pdfFileNameRegex.test(pdfFileNameWithTimeStamp)).to.be.true;
    
    expect(stdout.stdout.includes(`PDF is generated\nSaved file: ${pdfFileNameWithTimeStamp}`)).to.be.true;

    stdout = await exec(`ls -lrt | grep ${pdfFileNameWithTimeStamp} | wc -l`);
    console.log('4.) Should check for the generated PDF - Welcome.pdf');
    expect(stdout.stdout).to.be.equal('1\n');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --list_jobs --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
    console.log('5.) Should throw no jobs found\n');
    expect(stdout.stdout).to.be.equal('No jobs found\n');

    console.log('Print now job for non default tenant  executed successfully\n');
    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

const checkForCSVFileNameAndGetCSVData = async (csvFileName = '', logNumber = 0) => {
  const allFiles = await readdir('.');
  const csvFileNameRegex = /[A-Za-z]-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}.csv/ // Pattern for checking file name contains appended time stamp
  csvFileName = allFiles.find(fileName => fileName.startsWith(csvFileName) && fileName.endsWith('.csv'));
  expect(csvFileName).to.be.exist;
  expect(csvFileNameRegex.test(csvFileName)).to.be.true; // Check the file name has date appended or not
  console.log(`${logNumber}.) Should check for the extracted CSV - ${csvFileName}`);
  let csvData = await readFile(csvFileName, 'utf8');
  csvData = csvData.split(/\r?\n/);
  csvData.pop();
  await exec(`rm -rf ${csvFileName}`);
  return csvData;
}

const testCSVExportForSingleGroupWidget = async () => {
  const dashboardUrlWithSingleGroupWidget = `"${SUITE_URL}/bvd/#/show/30PagesReport?params=none"`;
  try {
    let stdout = await exec(`${webToPdfCli} --strict_host_check "no" --user ${user} --pass ${pass} --suite_url ${SUITE_URL} --url ${dashboardUrlWithSingleGroupWidget} --format CSV`);
    const zipFileNameWithTimeStamp = (await readdir('.')).find(fileName => fileName.startsWith('30PagesReport') && fileName.endsWith('.zip'));
    console.log(`1.) Should generate the ${zipFileNameWithTimeStamp}`);

    stdout = await exec(`ls -lrt | grep ${zipFileNameWithTimeStamp} | wc -l`);
    console.log(`2.) Should check for the generated ZIP - ${zipFileNameWithTimeStamp}`);
    expect(stdout.stdout).to.be.equal('1\n');

    await exec(`unzip ${zipFileNameWithTimeStamp}`);
    const csvData = await checkForCSVFileNameAndGetCSVData('Resource_relation', 3);
    expect(csvData[csvData.length - 1]).to.include('47c79a61f80aef29a1546525f0d65e95');
    expect(csvData[csvData.length - 1]).to.include('210');
    console.log('4.) Should check for CSV contents \n');

    await cleanUpZipAndCsv();
    console.log('CSV export flow executed successfully for single group widget\n');
    return;
  } catch (err) {
    await cleanUpZipAndCsv();
    console.log(err);
    return;
  }
};

const testCSVExportForMultipleGroupWidgets = async () => {
  const dashboardUrlWithMultipleGroupWidget = `"${SUITE_URL}/bvd/#/show/SystemCPU-TopN?params=none"`;
  const zipFileName = 'ReportWithMultipleGroupWidget.zip';
  try {
    let stdout = await exec(`${webToPdfCli} --strict_host_check "no" --user ${user} --pass ${pass} --suite_url ${SUITE_URL} --url ${dashboardUrlWithMultipleGroupWidget} --out ${zipFileName} --format CSV`);
    console.log(`1.) Should generate the ${zipFileName}`);

    stdout = await exec(`ls -lrt | grep ${zipFileName} | wc -l`);
    console.log(`2.) Should check for the generated ZIP - ${zipFileName}`);
    expect(stdout.stdout).to.be.equal('1\n');

    await exec(`unzip ${zipFileName}`);
    const csvDataForFirstGroupWidget = await checkForCSVFileNameAndGetCSVData('resource_relation', 3);
    expect(csvDataForFirstGroupWidget[csvDataForFirstGroupWidget.length - 1]).to.include('4812995aa5eb32bc997c4f4dd0d1467e');
    expect(csvDataForFirstGroupWidget[csvDataForFirstGroupWidget.length - 1]).to.include('10');
    console.log('4.) Should check for CSV contents for 1st group widget');

    const csvDataForSecondGroupWidget = await checkForCSVFileNameAndGetCSVData('bvd_lwr_demo_group_widget', 5);
    expect(csvDataForSecondGroupWidget[csvDataForSecondGroupWidget.length - 1]).to.include('Boeblingen');
    expect(csvDataForSecondGroupWidget[csvDataForSecondGroupWidget.length - 1]).to.include('10');
    console.log('6.) Should check for CSV contents for the 2nd group widget\n');

    await cleanUpZipAndCsv();
    console.log('CSV export flow executed successfully for multiple group widgets\n');
    return;
  } catch (err) {
    await cleanUpZipAndCsv();
    console.log(err);
    return;
  }
};

const testCSVExportForGroupWidgetWithAbsoluteDateTimeParameters = async () => {
  const dashboardUrlWithMultipleGroupWidget = `"${SUITE_URL}/bvd/#/show/SystemCPU-TopN?params=Calendar:start%3D2022-03-05%2000:00:00;Calendar:end%3D2022-03-07%2023:59:00"`;
  const zipFileName = 'ReportWithSingleGroupWidgetWithParameters.zip';
  try {
    let stdout = await exec(`${webToPdfCli} --strict_host_check "no" --user ${user} --pass ${pass} --suite_url ${SUITE_URL} --url ${dashboardUrlWithMultipleGroupWidget} --out ReportWithSingleGroupWidgetWithParameters.zip --format CSV`);
    console.log(`1.) Should generate the ${zipFileName}`);

    stdout = await exec(`ls -lrt | grep ${zipFileName} | wc -l`);
    console.log(`2.) Should check for the generated ZIP - ${zipFileName}`);
    expect(stdout.stdout).to.be.equal('1\n');

    await exec(`unzip ${zipFileName}`);

    const csvDataForGroupWidget = await checkForCSVFileNameAndGetCSVData('resource_relation', 3);
    expect(csvDataForGroupWidget[csvDataForGroupWidget.length - 1]).to.include('4812995aa5eb32bc997c4f4dd0d1467e');
    expect(csvDataForGroupWidget[csvDataForGroupWidget.length - 1]).to.include('10');
    console.log('4.) Should check for CSV contents for 1st group widget\n');

    await cleanUpZipAndCsv();
    console.log('CSV export flow executed successfully for group widget with parameters\n');
    return;
  } catch (err) {
    await cleanUpZipAndCsv();
    console.log(err);
    return;
  }
};

const testCSVExportForMultiSeriesLineAndBarChart = async () => {
  let dashboardUrlMultipleWidgets = `"${SUITE_URL}/bvd/#/show/TestCSVExport?params=none"`;
  const zipFileName = 'TestCSVExport.zip';
  try {
    let stdout = await exec(`${webToPdfCli} --strict_host_check "no" --user ${user} --pass ${pass} --suite_url ${SUITE_URL} --url ${dashboardUrlMultipleWidgets} --out ${zipFileName} --format CSV`);
    console.log(`1.) Should generate the ${zipFileName}`);

    stdout = await exec(`ls -lrt | grep ${zipFileName} | wc -l`);
    console.log(`2.) Should check for the generated ZIP - ${zipFileName}`);
    expect(stdout.stdout).to.be.equal('1\n');

    await exec(`unzip ${zipFileName}`);
    let barChartCSVData = await checkForCSVFileNameAndGetCSVData('BarChartDataChannel', 3);
    console.log('4.) Should check for the data count in bar chart');
    expect(barChartCSVData.length - 1).to.be.equal(20);

    await cleanUpZipAndCsv();
    const xAuthToken = await getIdmToken(user);
    console.log('5.) Should update the time zone value to Asia/Calcutta');
    expect(await updateUserSettings('Asia/Calcutta', xAuthToken)).to.equal('User settings updated successfully'); // Updating the system time to Asia/Calcutta to check values of timestamps changing in exported CSV

    dashboardUrlMultipleWidgets = `"${SUITE_URL}/bvd/#/show/TestCSVExport?params=id%3D5"`;

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --user ${user} --pass ${pass} --suite_url ${SUITE_URL} --url ${dashboardUrlMultipleWidgets} --out ${zipFileName} --format CSV`);
    console.log(`6.) Should generate the ${zipFileName}`);

    await exec(`unzip ${zipFileName}`);

    barChartCSVData = await checkForCSVFileNameAndGetCSVData('BarChartDataChannel', 7);
    console.log('8.) Should check for the data count in bar chart after applying the parameters');
    expect(barChartCSVData.length - 1).to.be.equal(1);

    const lineChartCSVData = await checkForCSVFileNameAndGetCSVData('LineChartDataChannel', 9);
    console.log('10.) Should check for the time stamp in line chart data after updating the system time zone to Asia/Calcutta\n');
    expect(lineChartCSVData[1]).to.include('2021-10-22 14:00:00');

    await cleanUpZipAndCsv();
    console.log('CSV export flow executed successfully for multiple widgets');
    await updateUserSettings('Asia/Calcutta', xAuthToken, true); // Updating the system time back to UTC timezone
    return;
  } catch (err) {
    await cleanUpZipAndCsv();
    console.log(err);
    return;
  }
};

const testScheduleJob = async () => {
  try {
    let stdout = await exec(`${webToPdfCli} --strict_host_check "no" --list_jobs --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
    console.log('1.) Should throw no jobs found');
    expect(stdout.stdout).to.be.equal('No jobs found\n');

    const scheduleTimeStamp = moment(new Date().getTime() + 60000).format('YYYY-MM-DD HH:mm:ss'); // getting the timestamp for 1min later
    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --create_job --schedule "${scheduleTimeStamp}" --user ${user} --pass ${pass} --suite_url ${SUITE_URL} --url ${PRINT_URL} --to "jitesh.singh@microfocus.com" --schedule_label "One time scheduled job"`);
    const jobId = stdout.stdout.split('ID -')[1].trim();

    expect(stdout.stdout.includes(`Job has been created successfully with ID - ${jobId}`)).to.be.true;
    console.log('2.) Job should be created which will execute after 1 min');

    await delay(120000); // Wait for the PDF to be generated

    stdout = await exec(`curl -k ${SUITE_URL}/webtopdf/v1/jobs/${jobId}/output?getPdf=true --output output.pdf`);
    console.log('3.) Should download the PDF by calling the /output API');

    stdout = await exec(`ls -lrt | grep output.pdf | wc -l`);
    console.log('4.) Should check for the generated PDF - output.pdf');
    expect(stdout.stdout).to.be.equal('1\n');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --job_status ${jobId} --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
    console.log('5.) Should throw requested job doesn\'t exist');
    expect(stdout.stdout).to.be.equal('Requested job does not exist\n');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --list_jobs --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
    console.log('6.) Should throw no jobs found\n');
    expect(stdout.stdout).to.be.equal('No jobs found\n');

    console.log('Schedule job flow executed successfully\n');
    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

const testJobManagement = async () => {
  try {
    let stdout = await exec(`${webToPdfCli} --strict_host_check "no" --list_jobs --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
    console.log('1.) Should throw no jobs found');
    expect(stdout.stdout).to.be.equal('No jobs found\n');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --create_job --schedule "0 16 * * sun" --to "jitesh.singh@microfocus.com" --user ${user} --pass ${pass} --suite_url ${SUITE_URL} --url ${PRINT_URL} --schedule_label "Run every Sunday"`);
    const jobId = stdout.stdout.split('ID -')[1].trim();
    console.log('2.) Job should be created');
    expect(stdout.stdout.includes(`Job has been created successfully with ID - ${jobId}`)).to.be.true;

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --list_jobs --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
    console.log('3.) Should check list of jobs should not be empty');
    expect(stdout.stdout.includes(jobId)).to.be.true;

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --job_status ${jobId} --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
    console.log('4.) Should check the status of the job');
    expect(stdout.stdout.includes(jobId)).to.be.true;

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --delete_job ${jobId} --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
    console.log('5.) Should delete the job');
    expect(stdout.stdout).to.be.equal('Job has been deleted successfully\n');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --job_status ${jobId} --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
    console.log('6.) Should throw requested job doesn\'t exist');
    expect(stdout.stdout).to.be.equal('Requested job does not exist\n');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --list_jobs --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
    console.log('7.) Should throw no jobs found\n');
    expect(stdout.stdout).to.be.equal('No jobs found\n');

    console.log('Job management flow executed successfully');
    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

const getIdmToken = userName => new Promise((resolve, reject) => {
  superagent.post(`${SUITE_URL}/idm-service/v3.0/tokens?generateHPSSO=true`).send(
    {
      passwordCredentials: {
        username: `${userName}`,
        password: 'Control@123'
      },
      tenantName: 'Provider'
    }
  ).disableTLSCerts().end((err, res) => {
    if (err) {
      console.error('Failed to get the IDM Token. Error:"%s" "', err);
      return reject(err);
    }
    return resolve(JSON.parse(res.text).token.id);
  });
});

const createUserInIdm = (userName, idmToken) => new Promise((resolve, reject) => {
  superagent.post(`${SUITE_URL}/idm-service/api/scim/organizations/Provider/dbusers`).set('X-Auth-Token', `${idmToken}`).send(
    {
      name: `${userName}`,
      password: 'Control@123',
      type: 'SEEDED_USER'
    }
  ).disableTLSCerts().end((err, res) => {
    if (err) {
      if (err.status === 409) {
        // user already exists
        return resolve(err);
      }
      console.error('Failed to create the user in IDM. Error:"%s" "', err);
      return reject(err);
    }

    if (res) {
      return resolve(res);
    }
  });
});

const createGroup = idmToken => new Promise((resolve, reject) => {
  superagent.post(`${SUITE_URL}/idm-service/api/scim/organizations/Provider/groups`).set('X-Auth-Token', `${idmToken}`).send(
    {
      name: 'testGroup',
      displayName: 'testGroup',
      groupInfo: 'this is for test group'
    }
  ).disableTLSCerts().end((err, res) => {
    if (err) {
      if (err.response.status === 409) {
        // user already exists
        return resolve(err);
      }
      console.error('Failed to create the group. Error:"%s" "', err);
      return reject(err);
    }

    if (res) {
      return resolve(res);
    }
  });
});

const addUserToGroup = (userName, idmToken) => new Promise((resolve, reject) => {
  superagent.post(`${SUITE_URL}/idm-service/api/scim/organizations/Provider/groups/testGroup/members`).set('X-Auth-Token', `${idmToken}`).send(
    {
      userReference: `${userName}`
    }
  ).disableTLSCerts().end((err, res) => {
    if (err) {
      if (err.response.status === 409) {
        // user already exists
        return resolve(err);
      }
      console.error('Failed to add the user to group. Error:"%s" "', err);
      return reject(err);
    }

    if (res) {
      return resolve(res);
    }
  });
});

const createUserInBvd = (userName, idmToken) => new Promise((resolve, reject) => {
  superagent.get(`${SUITE_URL}/bvd`).set('X-Auth-Token', `${idmToken}`).send(
    {
      userReference: `${userName}`
    }
  ).disableTLSCerts().end((err, res) => {
    if (err) {
      return reject(err);
    }
    if (res) {
      return resolve(res);
    }
  });
});

const testRbac = async () => {
  // user1 and user2 are non admin users
  try {
    let idmToken = await getIdmToken('admin');
    await createUserInIdm('user1', idmToken);
    await createUserInIdm('user2', idmToken);
    await createGroup(idmToken);
    await addUserToGroup('user1', idmToken);
    await addUserToGroup('user2', idmToken);
    idmToken = await getIdmToken('user1');
    await createUserInBvd('user1', idmToken);
    idmToken = await getIdmToken('user2');
    await createUserInBvd('user2', idmToken);

    let stdout = await exec(`${webToPdfCli} --strict_host_check "no" --list_jobs --user user1 --pass ${pass} --suite_url ${SUITE_URL}`);
    console.log('1.) Should throw no jobs found');
    expect(stdout.stdout).to.be.equal('No jobs found\n');
    const scheduleTimeStamp = moment(new Date().getTime() + (30 * 60 * 1000)).format('YYYY-MM-DD HH:mm:ss');
    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --create_job --schedule "${scheduleTimeStamp}" --user user1 --pass ${pass} --suite_url ${SUITE_URL} --url ${PRINT_URL} --to "jitesh.singh@microfocus.com" --schedule_label "Runs only once as its a timestamp"`);
    expect(stdout.stdout.includes('Job has been created successfully with')).to.be.true;
    console.log('2.) non admin user should be able to create the job ');
    const jobId = stdout.stdout.split('ID -')[1].trim();

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --list_jobs --user user1 --pass ${pass} --suite_url ${SUITE_URL}`);
    expect(stdout.stdout.includes(jobId)).to.be.true;
    console.log('3.) non admin user should be able to see the list of jobs created by himself');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --job_status ${jobId} --user user1 --pass ${pass} --suite_url ${SUITE_URL}`);
    expect(stdout.stdout.includes(jobId)).to.be.true;
    console.log('4.) non admin user should be able to view job created by himself.');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --list_jobs --user user2 --pass ${pass} --suite_url ${SUITE_URL}`);
    expect(stdout.stdout).to.be.equal('No jobs found\n');
    console.log('5.) list of jobs for user2 should be empty');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --job_status ${jobId} --user user2 --pass ${pass} --suite_url ${SUITE_URL}`);
    expect(stdout.stdout).to.be.equal('Requested job does not exist\n');
    console.log('6.) non admin user user2 should not be able to view job of user1');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --delete_job ${jobId} --user user2 --pass ${pass} --suite_url ${SUITE_URL}`);
    expect(stdout.stdout).to.be.equal('Requested job does not exist\n');
    console.log('7.) non admin user user2 should not be able to delete job of user1');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --list_jobs --user admin --pass ${pass} --suite_url ${SUITE_URL}`);
    expect(stdout.stdout.includes(jobId)).to.be.true;
    console.log('8.) admin should be able to see the job created by non admin user in list of jobs.');

    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --job_status ${jobId} --user admin --pass ${pass} --suite_url ${SUITE_URL}`);
    expect(stdout.stdout.includes(jobId)).to.be.true;
    console.log('9.) admin should be able to view job created by non admin user.');
    
    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --delete_job ${jobId} --user admin --pass ${pass} --suite_url ${SUITE_URL}`);
    expect(stdout.stdout).to.be.equal('Job has been deleted successfully\n');
    console.log('10.) admin should be able to delete job created by non admin user.');
    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

const testForProperFonts = async () => {
  try {
    let stdout = await exec(`${webToPdfCli} --strict_host_check "no" --list_jobs --user ${user} --pass ${pass} --suite_url ${SUITE_URL}`);
    expect(stdout.stdout).to.be.equal('No jobs found\n');
    console.log('1.) Should throw no jobs found');
    stdout = await exec(`${webToPdfCli} --strict_host_check "no" --user ${user} --pass ${pass} --suite_url ${SUITE_URL} --url ${SUITE_URL}/bvd/#/show/fonts?params=none --out fonts.pdf`);
    expect(stdout.stdout.includes('PDF is generated\nSaved file: fonts.pdf')).to.be.true;
    stdout = await exec('strings fonts.pdf | grep FontName');
    expect(stdout.stdout).to.be.equal(`/FontName /AAAAAA+LiberationSerif\n/FontName /BAAAAA+IrishGrover-Regular\n/FontName /CAAAAA+Aladin-Regular\n/FontName /DAAAAA+Creepster-Regular\n/FontName /EAAAAA+Vollkorn-Italic\n/FontName /FAAAAA+Stalemate-Regular\n/FontName /GAAAAA+Kranky-Regular\n/FontName /HAAAAA+Rancho-Regular\n/FontName /IAAAAA+Ultra-Regular\n/FontName /JAAAAA+Syncopate-Regular\n/FontName /KAAAAA+OpenSans-SemiBold\n/FontName /LAAAAA+Iceberg-Regular\n`);
    exec('rm -rf *.pdf');
    console.log('Test for proper fonts executed successfully');
    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

const startTest = async () => {
  try {
    await importBVDFiles();
    await testPrintNow();
    await testCSVExportForSingleGroupWidget();
    await testCSVExportForMultipleGroupWidgets();
    await testCSVExportForGroupWidgetWithAbsoluteDateTimeParameters();
    await testCSVExportForMultiSeriesLineAndBarChart();
    await testJobManagement();
    await testRbac();
    await testScheduleJob();
    await testForProperFonts();
    await testPrintNowNonProvider();
    await exec('rm -rf *.pdf');
  } catch (err) {
    await exec('rm -rf *.pdf');
    return err;
  }
};

const cleanUp = async () => {
  try {
    await setPreRequisiteForTest();
    await cleanUpExistingJobs();
  } catch (err) {
    return err;
  }
}

cleanUp(); // Need to clean up existing jobs before running the test
