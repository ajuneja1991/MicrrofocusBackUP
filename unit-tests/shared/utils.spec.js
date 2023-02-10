describe('utils tests', () => {
  const utils = require('../../../shared/utils');
  const sleep = require('util').promisify(setTimeout);

  it('utils:replaceAsync', async () => {
    const result = await utils.replaceAsync('This is is the string!', /(\s)/g, async (match, whitepaces) => {
      expect(whitepaces).equal(' ');
      let replace;
      await sleep(1).then(() => {
        replace = '-';
      });
      expect(replace).equal('-');
      return replace;
    });

    expect(result).equal('This-is-is-the-string!');
  });
});
