import { Routes } from '@angular/router';

import { authGuard } from './auth';

export const routes: Routes = [
	{
		path: 'login',
		loadComponent: () =>
			import('../features/auth/pages/login/login.component').then((m) => m.LoginComponent)
	},
	{
		path: 'signup',
		loadComponent: () =>
			import('../features/auth/pages/signup/signup.component').then((m) => m.SignupComponent)
	},
	{
		path: '',
		loadComponent: () =>
			import('../features/shop/pages/home/home.component').then((m) => m.HomeComponent)
	},
	{
		path: 'products/:sku',
		loadComponent: () =>
			import('../features/shop/pages/product-details/product-details.component').then((m) => m.ProductDetailsComponent)
	},
	{
		path: 'cart',
		loadComponent: () =>
			import('../features/shop/pages/cart/cart.component').then((m) => m.CartComponent)
	},
	{
		path: 'wishlist',
		loadComponent: () =>
			import('../features/shop/pages/wishlist/wishlist.component').then((m) => m.WishlistComponent)
	},
	{
		path: 'checkout',
		loadComponent: () =>
			import('../features/shop/pages/checkout/checkout.component').then((m) => m.CheckoutComponent)
	},
	{
		path: 'privacy',
		loadComponent: () =>
			import('../features/shop/pages/privacy/privacy.component').then((m) => m.PrivacyComponent)
	},
	{
		path: 'terms',
		loadComponent: () =>
			import('../features/shop/pages/terms/terms.component').then((m) => m.TermsComponent)
	},
	{
		path: 'contact',
		loadComponent: () =>
			import('../features/shop/pages/contact/contact.component').then((m) => m.ContactComponent)
	},
	{
		path: 'profile',
		canActivate: [authGuard],
		loadComponent: () =>
			import('../features/account/pages/profile/account.component').then((m) => m.AccountComponent)
	},
	{
		path: 'orders',
		canActivate: [authGuard],
		loadComponent: () =>
			import('../features/account/pages/orders/orders.component').then((m) => m.OrdersComponent)
	},
	{
		path: 'orders/:id',
		canActivate: [authGuard],
		loadComponent: () =>
			import('../features/account/pages/order-details/order-details.component').then((m) => m.OrderDetailsComponent)
	},
	{
		path: 'returns',
		canActivate: [authGuard],
		loadComponent: () =>
			import('../features/account/pages/returns/returns.component').then((m) => m.ReturnsComponent)
	},
	{
		path: 'notifications',
		canActivate: [authGuard],
		loadComponent: () =>
			import('../features/account/pages/notifications/notifications.component').then((m) => m.NotificationsComponent)
	},
	{
		path: 'analytics',
		canActivate: [authGuard],
		loadComponent: () =>
			import('../features/account/pages/analytics/analytics.component').then((m) => m.AnalyticsComponent)
	},
	{
		path: 'admin',
		canActivate: [authGuard],
		loadComponent: () =>
			import('../features/account/pages/admin/admin.component').then((m) => m.AdminComponent)
	},
	{
		path: 'admin/fraud-monitoring',
		canActivate: [authGuard],
		loadComponent: () =>
			import('../features/account/pages/admin-fraud/admin-fraud.component').then((m) => m.AdminFraudComponent)
	},
	{
		path: 'admin/audit',
		canActivate: [authGuard],
		loadComponent: () =>
			import('../features/account/pages/admin-audit/admin-audit.component').then((m) => m.AdminAuditComponent)
	},
	{
		path: 'admin/fraud/:id',
		canActivate: [authGuard],
		loadComponent: () =>
			import('../features/account/pages/fraud-case/fraud-case.component').then((m) => m.FraudCaseComponent)
	},
	{ path: 'account', redirectTo: 'profile', pathMatch: 'full' },
	{ path: '**', redirectTo: '' }
];
