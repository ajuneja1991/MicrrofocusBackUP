// <reference types="Cypress" />
const shared = require('../../shared/shared');
const cheerio = require('cheerio');

describe('BVD CLI tests', shared.defaultTestOptions, () => {
  const bvdCliFilePath = 'cypress/integration/bvd/reporting/cli/bvd-cli-linux';
  const testFileDirectory = '../../cli/test/test-files/';
  const outputDirectory = '../../cli/test/';

  it('check if SVG file exist', () => {
    cy.exec(`"${bvdCliFilePath}" -g -f=noSvgFile.svg -m=Testing`, { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Failed to read dashboard file');
  });

  it('check for empty key in SVG', () => {
    cy.exec(`"${bvdCliFilePath}" --generate --file "${testFileDirectory}withoutAnyKey.svg" --messagecatalogue Testing`)
      .its('stdout')
      .should('contain', 'No localization key found');
  });

  it('check for duplicate keys in SVG', () => {
    cy.exec(`"${bvdCliFilePath}" --generate --file "${testFileDirectory}duplicateKeys.svg" --messagecatalogue Testing`)
      .its('stderr')
      .should('contain', 'duplicate localization key with different strings');
  });

  it('check for generating message catalogue if message catalogue file name has file extension', () => {
    const outFile = 'Testing.json';
    cy.exec(`"${bvdCliFilePath}" --generate --file "${testFileDirectory}singleLocalizationkey.svg" --messagecatalogue ${outputDirectory}${outFile}`).then(res => {
      cy.readFile(`../../cli/test/${outFile}`, 'utf-8').then(messageCatalogue => {
        let generatedMessageCatalogue;
        try {
          generatedMessageCatalogue = JSON.parse(JSON.stringify(messageCatalogue));
          expect(res.stdout).to.include('Message catalogue has been generated successfully');
          expect(generatedMessageCatalogue.test).to.equal('Date Label');
        } catch (err) {
          cy.log(err);
        }
      });
    });
  });

  it('check for generating message catalogue if dashboard file name has no file extension', () => {
    const outFile = 'Testing.json';
    cy.exec(`"${bvdCliFilePath}" --generate --file "${testFileDirectory}singleLocalizationkey" --messagecatalogue "${outputDirectory}${outFile}"`).then(res => {
      cy.readFile(`${outputDirectory}${outFile}`, 'utf-8').then(messageCatalogue => {
        let generatedMessageCatalogue;
        try {
          generatedMessageCatalogue = JSON.parse(JSON.stringify(messageCatalogue));
          expect(res.stdout).to.include('Message catalogue has been generated successfully');
          expect(generatedMessageCatalogue.test).to.equal('Date Label');
        } catch (err) {
          cy.log(err);
        }
      });
    });
  });

  it('should check for message catalogue while translating the dashboard', () => {
    cy.exec(`"${bvdCliFilePath}" --translate --file "${testFileDirectory}singleLocalizationkey.svg" --messagecatalogue Translated.json --translatedDashboard translatedDashboard`, { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Failed to read message catalogue');
  });

  it('should check for corrupted message catalogue and should not translate the dashboard', () => {
    cy.exec(`"${bvdCliFilePath}" --translate --file "${testFileDirectory}singleLocalizationkey.svg" --messagecatalogue "${testFileDirectory}invalid.json" --translatedDashboard translatedDashboard`, { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Failed to read message catalogue file')
      .and('contain', 'Unexpected string in JSON at position');
  });

  it('should check for translated dashboard file name in arguments passed', () => {
    cy.exec(`"${bvdCliFilePath}" --translate --file "${testFileDirectory}singleLocalizationkey.svg" --messagecatalogue "${testFileDirectory}singleLocalizedKey.json" --translatedDashboard`, { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Missing arguments: --translatedDashboard');
  });

  it('should translate the dashboard', () => {
    cy.exec(`"${bvdCliFilePath}" --translate --file "${testFileDirectory}singleLocalizationkey.svg" --messagecatalogue "${testFileDirectory}singleLocalizedKey.json" --translatedDashboard ${outputDirectory}translatedDashboard`).then(res => {
      cy.readFile(`${outputDirectory}translatedDashboard.svg`).then(svgContents => {
        const svgDOM = cheerio.load(svgContents, {
          decodeEntities: false,
          xmlMode: true
        });
        const gArray = svgDOM('[opr_l10n_key]');
        gArray.each((_index, gElement) => {
          const textNode = cheerio.load(gElement);
          const testString = 'Dashboard has been translated successfully';
          expect(gElement.attribs.opr_l10n_key).to.equal('test');
          expect(textNode('text').text()).to.equal('Bar Label');
          expect(res.stdout).to.include(testString);
        });
      });
    });
  });

  it('should translate the dashboard if message catalogue file does not contain file extension', () => {
    cy.exec(`"${bvdCliFilePath}" --translate --file "${testFileDirectory}singleLocalizationkey.svg" --messagecatalogue "${testFileDirectory}singleLocalizedKey" --translatedDashboard ${outputDirectory}translatedDashboard`)
      .its('stdout')
      .should('contain', 'Dashboard has been translated successfully');
  });

  it('should translate the dashboard if both dashboard file and translated dashboard file does not contain file extension', () => {
    cy.exec(`"${bvdCliFilePath}" --translate --file "${testFileDirectory}singleLocalizationkey" --messagecatalogue "${testFileDirectory}singleLocalizedKey" --translatedDashboard ${outputDirectory}translatedDashboard`).then(res => {
      cy.readFile(`${outputDirectory}translatedDashboard.svg`).then(svgContents => {
        const svgDOM = cheerio.load(svgContents, {
          decodeEntities: false,
          xmlMode: true
        });
        const gArray = svgDOM('[opr_l10n_key]');
        gArray.each((_index, gElement) => {
          const textNode = cheerio.load(gElement);
          const testString = 'Dashboard has been translated successfully';
          expect(gElement.attribs.opr_l10n_key).to.equal('test');
          expect(textNode('text').text()).to.equal('Bar Label');
          expect(res.stdout).to.include(testString);
        });
      });
    });
  });

  it('Verify the new message catalogue format', () => {
    const outfile = 'Testing_new.json';
    cy.exec(`"${bvdCliFilePath}" --multiLocale --generate --file "${testFileDirectory}singleLocalizationkey.svg" --messagecatalogue "${outputDirectory}${outfile}"`).then(res => {
      cy.readFile(`${outputDirectory}${outfile}`, 'utf-8').then(messageCatalogue => {
        let generatedMessageCatalogue;
        try {
          generatedMessageCatalogue = JSON.parse(JSON.stringify(messageCatalogue));
          expect(generatedMessageCatalogue.localization).to.be.an('array');
          expect(generatedMessageCatalogue.localization[0].locale).to.equal('default');
          expect(generatedMessageCatalogue.localization[0].message.test).to.equal('Date Label');
        } catch (ex) {
          cy.log(ex);
        }
        expect(res.stdout).to.include('Message catalogue has been generated successfully');
      });
    });
  });

  it('Translate the dashboard using new message catalogue file', () => {
    const outfile = 'Testing_new.json';
    const translatedFile = 'newFormat.svg';
    cy.exec(`"${bvdCliFilePath}" --translate --file "${testFileDirectory}singleLocalizationkey" --messagecatalogue "${outputDirectory}${outfile}" --translatedDashboard "${outputDirectory}${translatedFile}"`).then(res => {
      cy.readFile(`${outputDirectory}${translatedFile}`).then(svgContents => {
        const svgDOM = cheerio.load(svgContents, {
          decodeEntities: false,
          xmlMode: true
        });
        const gArray = svgDOM('opr_dashboard_l10n_options');
        gArray.each((_index, gElement) => {
          const textNode = cheerio.load(gElement);
          try {
            const generatedMessageCatalogue = JSON.parse(textNode.text());
            expect(generatedMessageCatalogue.localization).to.be.an('array');
            expect(generatedMessageCatalogue.localization[0].locale).to.equal('default');
            expect(generatedMessageCatalogue.localization[0].message.test).to.equal('Date Label');
          } catch (error) {
            cy.log(error);
          }
        });
        expect(res.stdout).to.include('Dashboard has been translated successfully');
      });
    });
  });

  it('Translate the dashboard using new message catalogue file for multiple locales', () => {
    const outfile = 'multiLocale_singleLocalizedKey.json';
    const translatedFile = 'newFormat.svg';
    cy.exec(`"${bvdCliFilePath}" --translate --file "${testFileDirectory}singleLocalizationkey" --messagecatalogue "${testFileDirectory}${outfile}" --translatedDashboard "${outputDirectory}${translatedFile}"`).then(res => {
      cy.readFile(`${outputDirectory}${translatedFile}`).then(svgContents => {
        const svgDOM = cheerio.load(svgContents, {
          decodeEntities: false,
          xmlMode: true
        });
        const gArray = svgDOM('opr_dashboard_l10n_options');
        // let errorFound;
        gArray.each((_index, gElement) => {
          const textNode = cheerio.load(gElement);
          try {
            const generatedMessageCatalogue = JSON.parse(textNode.text());
            expect(generatedMessageCatalogue.localization).to.be.an('array');
            expect(generatedMessageCatalogue.localization.length).to.equal(3);
            const allLocalesFound = generatedMessageCatalogue.localization.filter(l10n => l10n.locale === 'default' || l10n.locale === 'de' || l10n.locale === 'zh');
            expect(allLocalesFound.length).to.equal(3);
            expect(res.stdout).to.include('Dashboard has been translated successfully');
          } catch (error) {
            cy.log(error);
          }
        });
      });
    });
  });

  after(() => {
    cy.exec(`rm -rf ${outputDirectory}*.json`);
    cy.exec(`rm -rf ${outputDirectory}*.svg`);
  });
});
