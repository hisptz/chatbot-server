pm.test("Response is JSON", function () {
    pm.response.to.be.json;
})

const responseData = pm.response.json();

pm.collectionVariables.set("jobId", responseData.id);

postman.setNextRequest("Get a job");
