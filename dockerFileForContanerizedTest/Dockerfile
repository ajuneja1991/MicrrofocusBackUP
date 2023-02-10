FROM itom-docker.orgartifactory.swinfra.net/test/opsb-node-build:101

WORKDIR /


COPY runCypressTests.sh ./
RUN chmod +x runCypressTests.sh
ENTRYPOINT ["/runCypressTests.sh"]


