describe('Category List', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/#/category/list')
  })

  it('shows all categories', () => {
    cy.get('table tbody tr').should('have.length', 5)
  })

  it('the adult row shows its quota', () => {
    cy.contains('tbody tr', 'adult').should('contain', '535')
  })

  it('a specific cell has the expected value', () => {
    cy.contains('tbody tr', 'jovenil')
      .find('td')
      .eq(2)
      .should('contain', '220')
  })
})