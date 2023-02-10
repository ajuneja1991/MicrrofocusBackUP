#!/bin/sh
echo $WORKSPACE
cd $WORKSPACE/dashboard

curl https://orgartifactory.swinfra.net/artifactory/itom-buildoutput/uis/node_modules_dev/${BVD_VERSION}/node_modules_dev-${BVD_VERSION}.zip -o bvd_node_modules_devel-linux.zip
unzip -o bvd_node_modules_devel-linux.zip

cd ${WORKSPACE}/dashboard; rm -f ./package-lock.json;
rm -rf ${WORKSPACE}/dashboard/test/cypress/reports/mochawesome/*
rm -rf ${WORKSPACE}/dashboard/cypress_test_report/

export CYPRESS_TestEnvironment="systemtest";

cd ${WORKSPACE}/dashboard
echo 'Pushing Pages to UIF'
chmod +x ./test/utils/uploadFoundationCypressTestData.sh
chmod +x ./test/utils/ufc.sh
mkdir -p ${WORKSPACE}/dashboard/cypress_test_report/
mkdir -p ${WORKSPACE}/dashboard/cypress_reporting_test_report/
./test/utils/uploadFoundationCypressTestData.sh -u ${CYPRESS_username} -p ${CYPRESS_password} -s ${CYPRESS_baseUrl} -d ${CYPRESS_IDM_BASE_URL}
cd ${WORKSPACE}/dashboard/test

echo 'Running UIF/Foundation Cypress Tests'

cypress run --spec "cypress/integration/bvd/foundation/smoke/*.smoke.spec.js" --browser chrome --headless || true
node ${WORKSPACE}/dashboard/node_modules/mochawesome-merge/bin/mochawesome-merge ${WORKSPACE}/dashboard/test/cypress/reports/mochawesome/*.json > ${WORKSPACE}/dashboard/cypress_test_report/mochawesome.json
node ${WORKSPACE}/dashboard/node_modules/.bin/marge ${WORKSPACE}/dashboard/cypress_test_report/mochawesome.json -f bvd_explore_cypress_tests -o ${WORKSPACE}/dashboard/cypress_test_report/
ls -al ${WORKSPACE}/dashboard/cypress_test_report/
rm -rf ${WORKSPACE}/dashboard/test/cypress/reports/mochawesome/*

echo 'Running Reporting/BVD Cypress Tests'

export CYPRESS_baseUrl=${BVD_SERVICE_URL};
cypress run --spec "cypress/integration/bvd/reporting/smoke/*.smoke.spec.js" --browser chrome --headless || true
node ${WORKSPACE}/dashboard/node_modules/mochawesome-merge/bin/mochawesome-merge ${WORKSPACE}/dashboard/test/cypress/reports/mochawesome/*.json > ${WORKSPACE}/dashboard/cypress_reporting_test_report/mochawesome.json
node ${WORKSPACE}/dashboard/node_modules/.bin/marge ${WORKSPACE}/dashboard/cypress_reporting_test_report/mochawesome.json -f bvd_reporting_cypress_tests -o ${WORKSPACE}/dashboard/cypress_reporting_test_report/
ls -al ${WORKSPACE}/dashboard/cypress_reporting_test_report/
