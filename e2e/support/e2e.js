/// <reference types="cypress" />

/**
 * Log in via the API and store the JWT in the localStorage, which is what
 * the guard in `src/router/index.js` checks to allow access to routes with
 * `meta: { requiresAuth: true }`.
 *
 * It's important to store the token BEFORE the SPA starts (onBeforeLoad):
 * if navigation happens first, the guard won't find the token and will redirect to /#/login.
 *
 * cy.session caches the login and restores it between tests of the same spec.
 */
Cypress.Commands.add('login', (email, password) => {
  cy.env(['userEmail', 'userPassword']).then((env) => {
    const credentials = {
      email: email || env.userEmail,
      password: password || env.userPassword,
    }

    cy.session([credentials.email, credentials.password], () => {
      cy.request('POST', `${Cypress.expose('apiUrl')}/login`, credentials)
        .its('body.token')
        .should('be.a', 'string')
        .then((token) => {
          cy.visit('/', {
            onBeforeLoad(win) {
              win.localStorage.setItem('token', token)
            },
          })
        })
    })
  })
})
