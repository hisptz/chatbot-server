pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
const responseData = pm.response.json();


pm.test("Response is array", function () {
    pm.expect(Array.isArray(responseData)).to.be.true;
})

pm.test("Response has at least one schedule", function () {
    const schedule = responseData.find((schd) => schd.id === pm.collectionVariables.get("scheduleId"));
    pm.expect(schedule).to.not.be.undefined;

})

postman.setNextRequest("Delete schedule by id");
