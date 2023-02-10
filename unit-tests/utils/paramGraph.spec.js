const ParamGraph = require('../../../shared/utils/paramGraph');

describe('paramGraph', () => {
  it('should create graph object', () => {
    const parameterGraph = new ParamGraph();
    expect(parameterGraph).to.not.be.undefined;
    expect(parameterGraph).to.not.be.null;
    expect(parameterGraph.adjacencyList).to.be.an('object');
  });

  it('should add vertex', () => {
    const parameterGraph = new ParamGraph();
    parameterGraph.addVertex('param1', parameterGraph.adjacencyList);
    expect(parameterGraph.adjacencyList.param1).to.be.an('array');
  });

  it('should add edge', () => {
    const parameterGraph = new ParamGraph();
    parameterGraph.addVertex('sold_item', parameterGraph.adjacencyList);
    parameterGraph.addVertex('location', parameterGraph.adjacencyList);
    parameterGraph.addEdge('sold_item', 'location', parameterGraph.adjacencyList);
    expect(parameterGraph.adjacencyList.sold_item.length).to.equal(1);
    expect(parameterGraph.adjacencyList.sold_item).to.include('location');
    expect(parameterGraph.adjacencyList.location.length).to.equal(0);
  });

  it('should fetch parameter path', () => {
    const parameterGraph = new ParamGraph();
    parameterGraph.addVertex('sold_item', parameterGraph.adjacencyList);
    parameterGraph.addVertex('location', parameterGraph.adjacencyList);
    parameterGraph.addEdge('sold_item', 'location', parameterGraph.adjacencyList);
    parameterGraph.addVertex('region', parameterGraph.adjacencyList);
    parameterGraph.addEdge('location', 'region', parameterGraph.adjacencyList);
    const path = parameterGraph.getPath('sold_item', true);
    const members = parameterGraph.getAllParamsFromPath(path.sold_item, 'sold_item');
    expect(members).to.have.ordered.members(['sold_item', 'location', 'region']);
  });

  it('should detect cycle', () => {
    const parameterGraph = new ParamGraph();
    parameterGraph.addVertex('sold_item', parameterGraph.adjacencyList);
    parameterGraph.addVertex('location', parameterGraph.adjacencyList);
    parameterGraph.addEdge('sold_item', 'location', parameterGraph.adjacencyList);
    parameterGraph.addVertex('region', parameterGraph.adjacencyList);
    parameterGraph.addEdge('location', 'region', parameterGraph.adjacencyList);
    expect(parameterGraph.detectCycle(parameterGraph.adjacencyList)).to.equal(false);
    parameterGraph.addEdge('region', 'sold_item', parameterGraph.adjacencyList);
    expect(parameterGraph.detectCycle(parameterGraph.adjacencyList)).to.equal(true);
  });
});
