const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), meta: { requiresAuth: true } },
      {
        path: 'directDebit/list',
        component: () => import('pages/DirectDebit/DirectDebitList.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'category/list',
        component: () => import('pages/Category/CategoryList.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'buy/list',
        component: () => import('pages/Buy/BuyList.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'sale/list',
        component: () => import('pages/Sale/SaleList.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'supplier/list',
        component: () => import('pages/Supplier/SupplierList.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'client/list',
        component: () => import('pages/Client/ClientList.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LoginPage.vue'), meta: { requiresAuth: false } },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { requiresAuth: false },
  },
]

export default routes
