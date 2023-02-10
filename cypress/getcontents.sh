#!/bin/sh
REPORT_FOLDER=$1
CYPRESS_FOUNDATION_REPORT_FOLDER=$2
CYPRESS_REPORTING_REPORT_FOLDER=$3
TESTTYPE=$4
FOUNDATION_SERVER_FOLDER=$5
REPORTING_SERVER_FOLDER=$6
echo "report folder = ", ${REPORT_FOLDER}
echo "cypress_foundation_folder_name = ", ${CYPRESS_FOUNDATION_REPORT_FOLDER}
echo "cypress_reporting_folder_name = ", ${CYPRESS_REPORTING_REPORT_FOLDER}
echo "test type = ", ${TESTTYPE}
echo "cypress_foundation_server_name = ", ${FOUNDATION_SERVER_FOLDER}
echo "cypress_reporting_server_name = ", ${REPORTING_SERVER_FOLDER}
export TESTREPORTSRV="orelinci004.itom.aws.swinfra.net"

suites=`jq '.stats.suites' /tmp/${CYPRESS_FOUNDATION_REPORT_FOLDER}/mochawesome.json`
tests=`jq '.stats.tests' /tmp/${CYPRESS_FOUNDATION_REPORT_FOLDER}/mochawesome.json`
passes=`jq '.stats.passes' /tmp/${CYPRESS_FOUNDATION_REPORT_FOLDER}/mochawesome.json`
failures=`jq '.stats.failures' /tmp/${CYPRESS_FOUNDATION_REPORT_FOLDER}/mochawesome.json`
pending=`jq '.stats.pending' /tmp/${CYPRESS_FOUNDATION_REPORT_FOLDER}/mochawesome.json`
skips=`jq '.stats.skipped' /tmp/${CYPRESS_FOUNDATION_REPORT_FOLDER}/mochawesome.json`

rm -rf /tmp/${CYPRESS_FOUNDATION_REPORT_FOLDER}/content.html
html="/tmp/${CYPRESS_FOUNDATION_REPORT_FOLDER}/content.html"

echo "<html><head></head><body>" >> $html
echo "<table border=1>" >> $html
echo "<tr style="background-color:silver"><td>Suites Executed</td><td>Total Tests</td><td>Tests Passed</td><td>Tests Failed</td><td>Tests Pending</td><td>Tests Skipped</td></tr>" >> $html
echo "<tr>" >> $html
echo "  <td style="background-color:silver">$suites</td>" >> $html
echo "  <td style="background-color:silver">$tests</td>" >> $html
echo "  <td style="background-color:green">$passes</td>" >> $html
echo "  <td style="background-color:red">$failures</td>" >> $html
echo "  <td style="background-color:blue">$pending</td>" >> $html
echo "  <td style="background-color:yellow">$skips</td>" >> $html
echo "</tr>" >> $html
echo "</table>" >> $html
echo "</body></html>" >> $html
echo "<br><a href=\"https://${TESTREPORTSRV}/UIS/${TESTTYPE}/${REPORT_FOLDER}/FOUNDATION/cypress/${FOUNDATION_SERVER_FOLDER}/bvd_explore_cypress_tests.html\">Complete Cypress Foundation Test Report</a></br>" >> $html

suites=`jq '.stats.suites' /tmp/${CYPRESS_REPORTING_REPORT_FOLDER}/mochawesome.json`
tests=`jq '.stats.tests' /tmp/${CYPRESS_REPORTING_REPORT_FOLDER}/mochawesome.json`
passes=`jq '.stats.passes' /tmp/${CYPRESS_REPORTING_REPORT_FOLDER}/mochawesome.json`
failures=`jq '.stats.failures' /tmp/${CYPRESS_REPORTING_REPORT_FOLDER}/mochawesome.json`
pending=`jq '.stats.pending' /tmp/${CYPRESS_REPORTING_REPORT_FOLDER}/mochawesome.json`
skips=`jq '.stats.skipped' /tmp/${CYPRESS_REPORTING_REPORT_FOLDER}/mochawesome.json`

rm -rf /tmp/${CYPRESS_REPORTING_REPORT_FOLDER}/content.html
mkdir -p /tmp/${CYPRESS_REPORTING_REPORT_FOLDER}/
reporthtml="/tmp/${CYPRESS_REPORTING_REPORT_FOLDER}/content.html"

echo "<html><head></head><body>" >> $reporthtml
echo "<table border=1>" >> $reporthtml
echo "<tr style="background-color:silver"><td>Suites Executed</td><td>Total Tests</td><td>Tests Passed</td><td>Tests Failed</td><td>Tests Pending</td><td>Tests Skipped</td></tr>" >> $reporthtml
echo "<tr>" >> $reporthtml
echo "  <td style="background-color:silver">$suites</td>" >> $reporthtml
echo "  <td style="background-color:silver">$tests</td>" >> $reporthtml
echo "  <td style="background-color:green">$passes</td>" >> $reporthtml
echo "  <td style="background-color:red">$failures</td>" >> $reporthtml
echo "  <td style="background-color:blue">$pending</td>" >> $reporthtml
echo "  <td style="background-color:yellow">$skips</td>" >> $reporthtml
echo "</tr>" >> $reporthtml
echo "</table>" >> $reporthtml
echo "</body></html>" >> $reporthtml
echo "<br><a href=\"https://${TESTREPORTSRV}/UIS/${TESTTYPE}/${REPORT_FOLDER}/REPORTING/cypress/${REPORTING_SERVER_FOLDER}/bvd_reporting_cypress_tests.html\">Complete Cypress Reporting Test Report</a></br>" >> $reporthtml
