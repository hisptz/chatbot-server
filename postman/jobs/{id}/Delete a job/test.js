pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

const query = {
    url: `${pm.collectionVariables.get("baseUrl")}/${pm.collectionVariables.get("jobId")}`,
    header: {'x-api-key': pm.collectionVariables.get("apiKey")},
}

pm.test("Job is deleted", function () {
    pm.sendRequest(query, function (err, response) {
        pm.expect(response.code).to.eql(404);
    });
})

postman.setNextRequest("Create flow")
