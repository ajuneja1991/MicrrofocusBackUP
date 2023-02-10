const user = require('../../../shared/utils/user');

describe('user Utils', () => {
  it('isStrongPassword', done => {
    expect(user.isStrongPassword('ABcd1234!')).to.be.true;
    expect(user.isStrongPassword('ABcd1234')).to.be.true;
    expect(user.isStrongPassword('ABcd1234!')).to.be.true;
    expect(user.isStrongPassword('ABCD1234!')).to.be.true;
    expect(user.isStrongPassword('abcd1234!')).to.be.true;
    expect(user.isStrongPassword('ABCDefgh!')).to.be.true;
    expect(user.isStrongPassword('ABcd123')).to.be.false;
    expect(user.isStrongPassword('ABCD1234')).to.be.false;
    expect(user.isStrongPassword('abcd1234')).to.be.false;
    done();
  });
});
