const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'category/list', component: () => import('pages/Category/CategoryList.vue') },
      { path: 'buy/list', component: () => import('pages/Buy/BuyList.vue') },
      { path: 'sale/list', component: () => import('pages/Sale/SaleList.vue') },
      { path: 'supplier/list', component: () => import('pages/Supplier/SupplierList.vue') },
      { path: 'client/list', component: () => import('pages/Client/ClientList.vue') },
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
