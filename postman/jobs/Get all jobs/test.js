pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

const responseData = pm.response.json();

pm.test("Response is array", function () {
    pm.expect(Array.isArray(responseData)).to.be.true;
})

pm.test("Response has at least one valid job", function () {
    const job = responseData.find((job) => job.id === pm.collectionVariables.get("jobId"));
    pm.expect(job).to.not.be.undefined;
})

postman.setNextRequest("Create a new schedule");
