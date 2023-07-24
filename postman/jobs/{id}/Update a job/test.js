pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Verify returned id & description", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.id).to.eql(pm.collectionVariables.get("jobId"));
    pm.expect(jsonData.description).to.eql("Test RMNCAH - Edited")
});

pm.test("Verify returned visualizations", function () {
    var jsonData = pm.response.json();
    var vis = jsonData.visualizations[0]
    pm.expect(vis.id).to.eql('JjZZ09UxARX');
    pm.expect(vis.name).to.eql('RMNCAH - Trends in coverage of interventions for maternal and newborn (%) - Edited');
})

pm.test("Verify returned contacts", function () {
    var jsonData = pm.response.json();
    var contact = jsonData.contacts[0];
    pm.expect(contact.id).to.eql('KuD6NyRwhcI');
    pm.expect(contact.type).to.eql("individual");
    pm.expect(contact.number).to.eql("255712626160")
})

postman.setNextRequest("Manually run a job");

