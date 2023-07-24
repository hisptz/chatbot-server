pm.test("Status code is 202", function () {
    pm.response.to.have.status(202);
});


pm.test("Response is valid", function () {
    const responseData = pm.response.json()

    pm.expect(responseData.enabled).to.eql(false);
    pm.expect(responseData.job.id).to.eql(pm.collectionVariables.get("jobId"));
    pm.expect(responseData.cron).to.eql("*/5 * * * *");

})

postman.setNextRequest("Get all schedules");
