pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});


pm.test("Returned data is correct", function () {
    const responseData = pm.response.json();
    pm.expect(responseData.cron).to.eql("*/10 * * * *")
    pm.expect(responseData.enabled).to.eql(true);
    pm.expect(responseData.jobId).to.eql(pm.collectionVariables.get("jobId"));
    pm.expect(responseData.id).to.eql(pm.collectionVariables.get("scheduleId"));
});

postman.setNextRequest("Update schedule by id");
