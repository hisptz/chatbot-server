pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});


pm.test("Job status created", function () {
    const responseData = pm.response.json();
    pm.expect(responseData.id).to.not.be.undefined;
});

pm.test("Job status to be finished", function () {
    const responseData = pm.response.json();
    pm.expect(responseData.status).to.eql("FINISHED");
})

const responseData = pm.response.json()
pm.collectionVariables.set("jobStatusId", responseData.id)


postman.setNextRequest("Get job status");
