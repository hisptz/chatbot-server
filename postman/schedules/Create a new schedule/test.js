const responseData = pm.response.json()
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response should be JSON", function () {
    pm.response.to.be.json;
})

pm.test("Response is valid", function () {
    const responseData = pm.response.json()

    pm.expect(responseData.enabled).to.eql(true);
    pm.expect(responseData.job.id).to.eql(pm.collectionVariables.get("jobId"));
    pm.expect(responseData.cron).to.eql("*/10 * * * *");

})
pm.collectionVariables.set("scheduleId", responseData.id);

postman.setNextRequest("Get schedule by id")
