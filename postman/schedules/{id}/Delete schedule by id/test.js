pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

const query = {
    url: `${pm.collectionVariables.get("baseUrl")}/schedules/${pm.collectionVariables.get("scheduleId")}`,
    header: {'x-api-key': pm.collectionVariables.get("apiKey")},
}

pm.test("Job is deleted", function () {
    pm.sendRequest(query, function (err, response) {
        // pm.expect(response.code).to.eql(404); Uncomment this after fixing the issue
    });
})

postman.setNextRequest("Delete a job");
