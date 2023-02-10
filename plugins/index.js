// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const { initPlugin } = require('cypress-plugin-snapshots/plugin');
const registerCodeCoverageTasks = require('@cypress/code-coverage/task');
const cypressLogToOutput = require('cypress-log-to-output');
const { rmdir } = require('fs');
const StreamZip = require('node-stream-zip');
const { readdir } = require('fs/promises');
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  initPlugin(on, config);

  // Added csv zip validation and delete folder as tasks since we can not use node modules within cypress because cypress executes test code in the browser.
  // To use node modules, we must use tasks (https://stackoverflow.com/questions/59010818/why-do-i-get-error-typeerror-fs-readdir-is-not-a-function-in-cypress)
  on('task', {
    async validateZipFile(filename) {
      // validate the downloaded ZIP file
      // eslint-disable-next-line new-cap
      const zip = new StreamZip.async({ file: filename });
      const zipEntries = await zip.entriesCount;

      await zip.close();
      return zipEntries;
    }
  });

  on('task', {
    deleteFolder(folderName) {
      return new Promise((resolve, reject) => {
        rmdir(folderName, { maxRetries: 10, recursive: true }, err => {
          if (err && err.code !== 'ENOENT') {
            console.error(err);
            return reject(err);
          }
          resolve(null);
        });
      });
    }
  });

  on('task', {
    async readDirectory(folderName) {
      const fileList = await readdir(folderName);
      return fileList;
    }
  });

  on('before:browser:launch', (browser = {}, launchOptions) => {
    launchOptions = cypressLogToOutput.browserLaunchHandler(browser, launchOptions);
    console.log('Using browser family: ', browser.family);
    // https://github.com/cypress-io/cypress/issues/5336
    if (browser.family === 'chromium') {
      console.log('Adding --disable-dev-shm-usage ...');
      launchOptions.args.push('--disable-dev-shm-usage');

      // select language for chrome
      const chromeLanguage = config.env.CHROME_LANGUAGE ? config.env.CHROME_LANGUAGE : 'en';
      console.log('Language for chrome:', chromeLanguage);
      launchOptions.args.push(`--lang=${chromeLanguage}`);

      // Note: If your Chrome has problems with the language, decomment the following line
      // launchOptions.args.push(`--user-data-dir=c:\\chrome-profile-${chromeLanguage}`);
    }
    return launchOptions;
  });

  registerCodeCoverageTasks(on, config);

  return config;
};
