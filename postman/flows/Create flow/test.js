pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

postman.setNextRequest("Get Flow")