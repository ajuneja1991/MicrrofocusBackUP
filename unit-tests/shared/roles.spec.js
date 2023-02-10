describe('RolesTest',
  () => {
  // eslint-disable-next-line node/global-require
    const errorHandle = require('../../../shared/utils/idmErrorHandling');
    const err = {
      statusCode: '401'
    };
    const respData = { role: { idmError: '' }};

    it('Check if not authenticated', () => {
      errorHandle.getIDMError(err, respData);
      expect(respData.role.idmError).equal('opr.userMgmt.roles.idm.error');
    });

    it('Check if not authorized', () => {
      err.statusCode = '403';
      errorHandle.getIDMError(err, respData);
      expect(respData.role.idmError).equal('opr.userMgmt.roles.idm.error');
    });

    it('Check if bad request', () => {
      err.statusCode = '400';
      errorHandle.getIDMError(err, respData);
      expect(respData.role.idmError).equal('opr.userMgmt.roles.idm.error');
    });
  });
