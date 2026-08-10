describe("Logout", () => {
  it("should respond with a redirect when logging out", () => {
    cy.request({
      url: "/logout",
      followRedirect: false,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([301, 302, 303, 307, 308]);
      expect(response.headers).to.have.property("location");
    });
  });
});
