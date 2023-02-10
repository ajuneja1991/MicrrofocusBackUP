*****************Variables to be Exported for the container*********************
Before running the container please export below variables into the container
[WORKSPACE, CYPRESS_username, CYPRESS_password, CYPRESS_baseUrl, CYPRESS_IDM_BASE_URL,  CYPRESS_TestEnvironment, BVD_SERVICE_URL, BVD_VERSION] as shown in below example :
export WORKSPACE=/bvd
export CYPRESS_username=admin
export CYPRESS_password=Control@123
export CYPRESS_baseUrl=https://omidock.mambo.net:19443/ui
export CYPRESS_IDM_BASE_URL=https://omidock.mambo.net:19443
export BVD_SERVICE_URL=https://omidock.mambo.net:19443/bvd
export BVD_VERSION=11.10.9

*****************Reports can be found at below paths in the container*********************
for foundation/uif - ${WORKSPACE}/dashboard/cypress_test_report/
for reporting/bvd - ${WORKSPACE}/dashboard/cypress_reporting_test_report/


