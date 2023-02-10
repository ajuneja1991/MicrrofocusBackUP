const assert = require('chai').assert;
const util = require('node:util');
const webtopdf = '../dashboard/webtopdf/cli/index.js';
const exec = util.promisify(require('node:child_process').exec);
const pdfParse = require('pdf-parse');
const fs = require('fs-extra');

const userName = 'admin';
const password = 'Control@123';
// eslint-disable-next-line node/no-process-env
const suiteURl = process.env.IDM_URL;

describe('webtopdf tests', () => {
  it('Try multi page report printing multiple times for flakiness', async () => {
    try {
      for (let i = 0; i < 6; i++) {
        // eslint-disable-next-line node/no-process-env
        const output = await exec(`node ${webtopdf} --user ${userName} --strict_host_check "no" --pass ${password} --url "${suiteURl}/bvd/#/show/30PagesReport?params=none&page=1" --suite_url ${suiteURl} --out 30PagesReport.pdf`);
        assert.include(output.stdout, 'PDF is generated\nSaved file: 30PagesReport.pdf', 'Failed to generate the PDF');
        console.log('Successfully printed the PDF. Count:', i + 1);
        const buffer = await fs.readFile('30PagesReport.pdf');
        const data = await pdfParse(buffer);
        assert.include(data.text, 'DCA COMPLIANCE POLICY DETAILS', 'Incorrect PDF content');
        assert.include(data.text, 'RESOURCE NAME', 'Incorrect PDF content');
        assert.equal(data.numpages, 30, 'Missing some pages in PDF');
      }
      fs.remove('30PagesReport.pdf');
    } catch (error) {
      throw new Error(`Test for multiple page report failed: ${error}`);
    }
  }).timeout(30 * 60 * 1000); // PDF generation takes avg 4 min for each run

  it('Advanced PDF Export using cli - Includes Header and Footers,A4', async () => {
    try {
        // eslint-disable-next-line node/no-process-env
        const output = await exec(`node ${webtopdf} --user ${userName} --pass ${password} --url "${suiteURl}/ui/allChartsPage" --suite_url ${suiteURl} --out allChartsPageHeadersA4.pdf --timeout=5 --delay=30 --page_format=A4 --optimize_layout=true --strict_host_check=yes --scale=1 --landscape=false --print_background=false --display_header_footer=true`);
        assert.include(output.stdout, 'PDF is generated\nSaved file: allChartsPageHeadersA4.pdf', 'Failed to generate the PDF');
        const buffer = await fs.readFile('allChartsPageHeadersA4.pdf');
        const data = await pdfParse(buffer);
        assert.include(data.text, 'Report generated on :', 'Incorrect PDF content');
        // assert.include(data.text, 'Report generated for :', 'Incorrect PDF content');
        assert.include(data.text, 'Avg CPU Baseline Chart', 'Incorrect PDF content');
        assert.include(data.text, 'Average CPU Utilization With Change Marker', 'Incorrect PDF content');
        assert.include(data.text, 'Average CPU Utilization - Above Threshold Indicator', 'Incorrect PDF content');
        assert.include(data.text, 'ALL CHARTS PAGE - OPERATIONS BRIDGE (OPSBRIDGE)', 'Incorrect PDF content');
        assert.include(data.text, 'Page 1/3', 'Incorrect PDF content');
        assert.equal(data.numpages, 3, 'Missing some pages in PDF');
      fs.remove('allChartsPageHeadersA4.pdf');
    } catch (error) {
      throw new Error(`Test for advanced PDF export failed: ${error}`);
    }
  }).timeout(2 * 60 * 1000);

  it('Advanced PDF Export using cli - without Header and Footers,A4', async () => {
    try {
        // eslint-disable-next-line node/no-process-env
        const output = await exec(`node ${webtopdf} --user ${userName} --pass ${password} --url "${suiteURl}/ui/allChartsPage" --suite_url ${suiteURl} --out allChartsPageWithoutHeadersA4.pdf --timeout=5 --delay=30 --page_format=A4 --optimize_layout=true --strict_host_check=yes --scale=1 --landscape=false --print_background=false --display_header_footer=false`);
        assert.include(output.stdout, 'PDF is generated\nSaved file: allChartsPageWithoutHeadersA4.pdf', 'Failed to generate the PDF');
        const buffer = await fs.readFile('allChartsPageWithoutHeadersA4.pdf');
        const data = await pdfParse(buffer);
        assert.notInclude(data.text, 'Report generated on :', 'Incorrect PDF content');
        assert.notInclude(data.text, 'Report generated for :', 'Incorrect PDF content');
      fs.remove('allChartsPageWithoutHeadersA4.pdf');
    } catch (error) {
      throw new Error(`Test for advanced PDF export failed: ${error}`);
    }
  }).timeout(2 * 60 * 1000);

  it('Advanced PDF Export using cli - Header and Footers,A4, Landscape', async () => {
    try {
        // eslint-disable-next-line node/no-process-env
        const output = await exec(`node ${webtopdf} --user ${userName} --pass ${password} --url "${suiteURl}/ui/allChartsPage" --suite_url ${suiteURl} --out allChartsPageIncludeHeadersA4Landscape.pdf --timeout=5 --delay=30 --page_format=A4 --optimize_layout=true --landscape=true --print_background=false --display_header_footer=true`);
        assert.include(output.stdout, 'PDF is generated\nSaved file: allChartsPageIncludeHeadersA4Landscape.pdf', 'Failed to generate the PDF');
        const buffer = await fs.readFile('allChartsPageIncludeHeadersA4Landscape.pdf');
        const data = await pdfParse(buffer);
        assert.include(data.text, 'Report generated on :', 'Incorrect PDF content');
        assert.equal(data.numpages, 9, 'Missing some pages in PDF');
      fs.remove('allChartsPageIncludeHeadersA4Landscape.pdf');
    } catch (error) {
      throw new Error(`Test for advanced PDF export failed: ${error}`);
    }
  }).timeout(2 * 60 * 1000);

  it('Advanced PDF Export using cli - Context Information', async () => {
    try {
        // eslint-disable-next-line node/no-process-env
        const output = await exec(`node ${webtopdf} --user ${userName} --pass ${password} --url "${suiteURl}/ui/apptx" --suite_url ${suiteURl} --out apptxIncludesHeaderContextPackInfo.pdf --timeout=5 --delay=30 --page_format=A4 --optimize_layout=true --strict_host_check=yes --scale=1 --landscape=false --print_background=false --display_header_footer=true`);
        assert.include(output.stdout, 'PDF is generated\nSaved file: apptxIncludesHeaderContextPackInfo.pdf', 'Failed to generate the PDF');
        const buffer = await fs.readFile('apptxIncludesHeaderContextPackInfo.pdf');
        const data = await pdfParse(buffer);
        assert.include(data.text, 'Report generated on :', 'Incorrect PDF content');
        assert.include(data.text, 'Content Pack: UIFDEMOCP@1.0', 'Incorrect PDF content');
      fs.remove('apptxIncludesHeaderContextPackInfo.pdf');
    } catch (error) {
      throw new Error(`Test for advanced PDF export failed: ${error}`);
    }
  }).timeout(4 * 60 * 1000);

  it('Print UIF page without default file location', async () => {
    try {
        // eslint-disable-next-line node/no-process-env
        const output = await exec(`node ${webtopdf} --user ${userName} --strict_host_check "no" --pass ${password} --url "${suiteURl}/ui/allChartsPage" --optimize_layout=false --suite_url ${suiteURl}`);
        const pdfFileNameWithTimeStamp = (await fs.readdir('.')).find(fileName => fileName.startsWith('allChartsPage') && fileName.endsWith('.pdf'))
        console.log('Successfully printed the PDF without default file location');
        const buffer = await fs.readFile(pdfFileNameWithTimeStamp);
        const data = await pdfParse(buffer);
        assert.include(data.text, 'Average CPU Utilization With Change Marker', 'Incorrect PDF content');
        assert.include(data.text, 'Dual axis Chart', 'Incorrect PDF content');
        assert.equal(data.numpages, 3, 'Missing some pages in PDF');
        fs.remove(pdfFileNameWithTimeStamp);
    } catch (error) {
      throw new Error(`Test for print UIF page without default file location failed: ${error}`);
    }
  }).timeout(80 * 1000);

  it('Print UIF page in non default tenant', async () => {
    try {
        // eslint-disable-next-line node/no-process-env
        const output = await exec(`node ${webtopdf} --user "customer3Admin@microfocus.com" --strict_host_check "no" --pass ${password} --url "${suiteURl}/ui/allChartsPage?&tenant=Customer3" --suite_url ${suiteURl} --optimize_layout=false --tenant "Customer3" --out nonDefaultTenant.pdf`);
        console.log('Successfully printed the PDF in non default tenant');
        const buffer = await fs.readFile('nonDefaultTenant.pdf');
        const data = await pdfParse(buffer);
        assert.include(data.text, 'Average CPU Utilization With Change Marker', 'Incorrect PDF content');
        assert.include(data.text, 'Dual axis Chart', 'Incorrect PDF content');
        assert.equal(data.numpages, 3, 'Missing some pages in PDF');
        fs.remove('nonDefaultTenant.pdf');
    } catch (error) {
      throw new Error(`Test for print UIF page in non default tenant failed: ${error}`);
    }
  }).timeout(80 * 1000);
});
