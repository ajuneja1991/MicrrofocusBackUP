#!/bin/sh

export TESTREPORTSRV="orelinci004.itom.aws.swinfra.net"

suites=`jq '.stats.suites' /tmp/mochawesome.json`
tests=`jq '.stats.tests' /tmp/mochawesome.json`
passes=`jq '.stats.passes' /tmp/mochawesome.json`
failures=`jq '.stats.failures' /tmp/mochawesome.json`
skips=`jq '.stats.pending' /tmp/mochawesome.json`

rm -rf /tmp/content.html
html="/tmp/content.html"

echo "<html><head></head><body>" >> $html
echo "<table border=1>" >> $html
echo "<tr style="background-color:silver"><td>Suites Executed</td><td>Total Tests</td><td>Tests Passed</td><td>Tests Failed</td><td>Tests Skipped</td></tr>" >> $html
echo "<tr>" >> $html
    echo "  <td style="background-color:silver">$suites</td>" >> $html
    echo "  <td style="background-color:silver">$tests</td>" >> $html
        echo "  <td style="background-color:green">$passes</td>" >> $html
        echo "  <td style="background-color:red">$failures</td>" >> $html
        echo "  <td style="background-color:yellow">$skips</td>" >> $html
    echo "</tr>" >> $html
echo "</table>" >> $html
echo "</body></html>" >> $html
echo "<br><a href=\"https://${TESTREPORTSRV}/BVD/CHO/FOUNDATION/cypress/cypress_test_report/bvd_explore_cypress_tests.html\">Complete Cypress Foundation Test Report</a></br>" >> $html

suites=`jq '.stats.suites' /tmp/bvd_cypress_reports/mochawesome.json`
tests=`jq '.stats.tests' /tmp/bvd_cypress_reports/mochawesome.json`
passes=`jq '.stats.passes' /tmp/bvd_cypress_reports/mochawesome.json`
failures=`jq '.stats.failures' /tmp/bvd_cypress_reports/mochawesome.json`
skips=`jq '.stats.pending' /tmp/bvd_cypress_reports/mochawesome.json`

rm -rf /tmp/bvd_cypress_reports/content.html
mkdir -p /tmp/bvd_cypress_reports/
reporthtml="/tmp/bvd_cypress_reports/content.html"

echo "<html><head></head><body>" >> $reporthtml
echo "<table border=1>" >> $reporthtml
echo "<tr style="background-color:silver"><td>Suites Executed</td><td>Total Tests</td><td>Tests Passed</td><td>Tests Failed</td><td>Tests Skipped</td></tr>" >> $reporthtml
echo "<tr>" >> $reporthtml
echo "  <td style="background-color:silver">$suites</td>" >> $reporthtml
echo "  <td style="background-color:silver">$tests</td>" >> $reporthtml
echo "  <td style="background-color:green">$passes</td>" >> $reporthtml
echo "  <td style="background-color:red">$failures</td>" >> $reporthtml
echo "  <td style="background-color:yellow">$skips</td>" >> $reporthtml
echo "</tr>" >> $reporthtml
echo "</table>" >> $reporthtml
echo "</body></html>" >> $reporthtml
echo "<br><a href=\"https://${TESTREPORTSRV}/BVD/CHO/REPORTING/cypress/cypress_reporting_test_report/bvd_reporting_cypress_tests.html\">Complete Cypress Reporting Test Report</a></br>" >> $reporthtml
