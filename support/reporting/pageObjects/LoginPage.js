class LoginPage {
  constructor() {
    this.userName = 'input[id*="user"]';
    this.userPwd = '#password';
    this.submitbtn = 'button[id*="submit"]';
  }

  loginUI(userNameValue, passwdValue) {
    cy.get(this.userName).click.focused.type(userNameValue);
    cy.get(this.userPwd).click().focused().type(passwdValue);
    cy.get(this.submitbtn).should('be.visible').click();
  }
}

export default new LoginPage();
