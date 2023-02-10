describe('channel tests',
  () => {
    // eslint-disable-next-line node/global-require
    const channel = require('../../../shared/channel.js');

    it('channel:escape pipe 1', () => {
      const result = channel.escapePipe('');
      expect(result).equal('');
    });

    it('channel:escape pipe 2', () => {
      const result = channel.escapePipe('hello');
      expect(result).equal('hello');
    });

    it('channel:escape pipe 3', () => {
      const result = channel.escapePipe('aa | bb | cc');
      expect(result).equal('aa <@> bb <@> cc');
    });

    it('channel:unescape pipe 1', () => {
      const result = channel.unescapePipe('');
      expect(result).equal('');
    });

    it('channel:unescape pipe 2', () => {
      const result = channel.unescapePipe('aa');
      expect(result).equal('aa');
    });

    it('channel:unescape pipe 3', () => {
      const result = channel.unescapePipe('aa <@> bb <@> cc');
      expect(result).equal('aa | bb | cc');
    });

    it('channel:escape test 1', () => {
      const result = channel._forTesting.escape('');
      expect(result).equal('');
    });

    it('channel:escape test 2', () => {
      const result = channel._forTesting.escape('hello');
      expect(result).equal('hello');
    });

    it('channel:escape test 3', () => {
      const result = channel._forTesting.escape('aa <> bb <> cc');
      expect(result).equal('aa \\<> bb \\<> cc');
    });

    it('channel:escape test 4', () => {
      const result = channel._forTesting.escape('a;a,a bb | c:c d<>d  ee \\ ee');
      expect(result).equal('a;a,a bb | c:c d\\<>d  ee \\ ee');
    });

    it('channel:escape test 5', () => {
      const result = channel._forTesting.escape('a\\,a , b<>b , c\\<>c , d\\\\<><>e><e');
      expect(result).equal('a\\,a , b\\<>b , c\\\\<>c , d\\\\\\<>\\<>e><e');
    });

    it('channel:unescape test 1', () => {
      const result = channel._forTesting.unescape('');
      expect(result).equal('');
    });

    it('channel:unescape test 2', () => {
      const result = channel._forTesting.unescape('aha');
      expect(result).equal('aha');
    });

    it('channel:unescape test 3', () => {
      const result = channel._forTesting.unescape('aa \\<> bb \\<> cc');
      expect(result).equal('aa <> bb <> cc');
    });

    it('channel:unescape test 4', () => {
      const result = channel._forTesting.unescape('a;a,a bb | c:c d\\<>d  ee \\ ee');
      expect(result).equal('a;a,a bb | c:c d<>d  ee \\ ee');
    });

    it('channel:unescape test 5', () => {
      const result = channel._forTesting.unescape('aa\\,a , b\\<>b , c\\\\<>c , d\\\\\\<>\\<>e><e');
      expect(result).equal('aa\\,a , b<>b , c\\<>c , d\\\\<><>e><e');
    });

    it('channel:unescape test 6', () => {
      let result = channel._forTesting.unescape('a\\,a , b<>b , c\\<>c , d\\\\<>');
      expect(result).equal('a\\,a , b<>b , c<>c , d\\<>');

      result = channel._forTesting.unescape(result);
      expect(result).equal('a\\,a , b<>b , c<>c , d<>');

      result = channel._forTesting.unescape(result);
      expect(result).equal('a\\,a , b<>b , c<>c , d<>');
    });

    it('channel:getEscapedChannel test', () => {
      const msg = {
          // eslint-disable id-length
          a: ' aa ',
          b: ' b , b ',
          x: undefined,
          c: 'c | c',
          d: 'd \\ d',
          y: '',
          e: 'e <> e',
          f: 'f \\<> f',
          g: 'gg><gg'
          // eslint-enable id-length
        },
        tags = [' US , CA ', ' LA | North '],
        dims = ['a', 'z', 'b', 'x', 'c', 'd', 'y', 'e', 'f', 'g'];

      const result = channel.getEscapedChannel(msg, tags, dims);
      expect(result.channelString).equal('US , CA<>LA | North<>aa<>b , b<>c | c<>d \\ d<>e \\<> e<>f \\\\<> f<>gg><gg');
    });

    it('channel:getUnescapedChannel test', () => {
      const chan = channel.getUnescapedChannel(
        'US , CA<>LA | North<>aa<>b , b<>c | c<>d \\ d<>e \\<> e<>f \\\\<> f<>gg\\><\\gg');
      expect(chan.channelString).equal('US , CA<>LA | North<>aa<>b , b<>c | c<>d \\ d<>e <> e<>f \\<> f<>gg\\><\\gg');
    });
  });
