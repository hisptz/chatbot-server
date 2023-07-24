pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});


pm.test("Response is array", function () {
    const responseData = pm.response.json();
    pm.expect(Array.isArray(responseData)).to.be.true;
})

pm.test("Job status of previous manual run exsists", function () {
    const responseData = pm.response.json()
    const jobStatus = responseData.find((status) => status.id === pm.collectionVariables.get("jobStatusId"));
    pm.expect(jobStatus).to.not.be.undefined;
})

postman.setNextRequest("Get all jobs");
