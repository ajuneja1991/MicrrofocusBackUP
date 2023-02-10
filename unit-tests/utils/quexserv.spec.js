const quexserv = require('../../../shared/utils/quexserv');

describe('quexserv util', () => {
  it('should verify a valid query', () => {
    const query = 'select * from my_db';
    expect(quexserv.isValidQuery(query)).to.be.true;
    const query2 = 'SELECT * from my_db';
    expect(quexserv.isValidQuery(query2)).to.be.true;
  });

  it('should verify an invalid query containing semicolon', () => {
    const query = 'select * from my_db;';
    expect(quexserv.isValidQuery(query)).to.be.false;
  });

  it('should verify an invalid query not starting with select', () => {
    const query = 'INSERT * from my_db;';
    expect(quexserv.isValidQuery(query)).to.be.false;
  });
});
