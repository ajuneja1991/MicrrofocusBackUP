import { getToken } from './getSecureModifyToken';
const MINUTE_IN_MS = 60000;
export const uploadFileRequest = (fileToUpload, uploadUrl, defaultTimeoutInMinute = 1, typeOfFile = 'dashboardFile', user = Cypress.env('username'), password = Cypress.env('password'), tenant = Cypress.env('tenant')) => {
  const formData = new FormData();

  cy.intercept({
    method: 'POST',
    url: uploadUrl
  })
    .as('fileUpload')
    .window()
    .then(win => {
      cy.fixture(fileToUpload, 'binary')
        .then(binary => Cypress.Blob.binaryStringToBlob(binary))
        .then(blob => {
          getToken(user, password, tenant).then(xSecureModifyToken => {
            const xhr = new win.XMLHttpRequest();
            formData.set(typeOfFile, blob, fileToUpload);
            if (typeOfFile === 'dataCollectorsFile') {
              formData.set('import', '{"onCollision":"overwrite"}');
            }
            xhr.open('POST', uploadUrl);
            xhr.setRequestHeader('x-secure-modify-token', xSecureModifyToken);
            xhr.send(formData);
          });
        });
    }).wait('@fileUpload', { timeout: defaultTimeoutInMinute * MINUTE_IN_MS });
};
