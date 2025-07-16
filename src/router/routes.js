const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'category/list', component: () => import('pages/Category/CategoryList.vue') },
      { path: 'budgetItem/list', component: () => import('pages/BudgetItem/BudgetItemList.vue') },
      { path: 'buy/list', component: () => import('pages/Buy/BuyList.vue') },
    ],
  },
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
