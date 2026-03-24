import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';

import { AuditLogService, BackendConnectivityService, FraudActionsService, ORDER_STATUS_SELECT_OPTIONS, OrderService, OrderStatus, ProductCatalogService, TranslateService } from '../../../../core';
import {
  buildInventoryCreateDetail,
  buildInventoryPriceDetail,
  buildInventoryRemoveDetail,
  buildInventoryStockDetail
} from '../../../../core/utils/inventory-audit';
import { PageHeaderComponent, PriceComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-admin',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PageHeaderComponent,
    PriceComponent,
    TranslatePipe
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly productCatalogService = inject(ProductCatalogService);
  private readonly auditLogService = inject(AuditLogService);
  private readonly fraudActions = inject(FraudActionsService);
  private readonly backendConnectivity = inject(BackendConnectivityService);
  private readonly translateService = inject(TranslateService);

  readonly orders = this.orderService.orders;
  readonly products = this.productCatalogService.products;
  readonly blockedPayments24h = this.fraudActions.blockedCountLast24h;
  readonly openFraudCases = this.fraudActions.openCount;
  readonly auditEntryCount = computed(() => this.auditLogService.entries().length);
  readonly auditChainValid = this.auditLogService.chainValid;
  readonly backendStatus = this.backendConnectivity.status;
  readonly backendIsHealthy = this.backendConnectivity.isHealthy;
  readonly backendIsDegraded = this.backendConnectivity.isDegraded;
  readonly backendIsOffline = this.backendConnectivity.isOffline;
  readonly productError = signal('');

  readonly createProductForm = this.fb.nonNullable.group({
    sku: ['', [Validators.required, Validators.minLength(3)]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', [Validators.required, Validators.minLength(2)]],
    imageUrl: ['', [Validators.required, Validators.minLength(8)]],
    price: this.fb.nonNullable.control(0, [Validators.min(0)]),
    stock: this.fb.nonNullable.control(0, [Validators.min(0)])
  });

  readonly orderCount = computed(() => this.orders().length);
  readonly orderStatusOptions = ORDER_STATUS_SELECT_OPTIONS;
  readonly lowStockProducts = computed(() =>
    this.products().filter((product) => product.stock > 0 && product.stock < 15)
  );

  setOrderStatus(orderId: string, value: string): void {
    this.orderService.updateStatus(orderId, value as OrderStatus);
  }

  approveReturn(orderId: string): void {
    this.orderService.approveReturn(orderId);
  }

  markReturnInTransit(orderId: string): void {
    this.orderService.markReturnInTransit(orderId);
  }

  markReturnReceived(orderId: string): void {
    this.orderService.markReturnReceived(orderId);
  }

  markRefunded(orderId: string): void {
    this.orderService.markRefunded(orderId);
  }

  setProductStock(sku: string, value: string): void {
    const stock = Number(value);
    if (Number.isNaN(stock)) {
      return;
    }
    this.productCatalogService.updateStock(sku, stock);
    this.auditLogService.log('inventory', 'set-stock', sku, buildInventoryStockDetail(stock));
  }

  setProductPrice(sku: string, value: string): void {
    const price = Number(value);
    if (Number.isNaN(price)) {
      return;
    }
    this.productCatalogService.updateProduct(sku, { price });
    this.auditLogService.log('inventory', 'set-price', sku, buildInventoryPriceDetail(price));
  }

  setProductName(sku: string, value: string): void {
    const name = value.trim();
    if (!name) {
      return;
    }
    this.productCatalogService.updateProduct(sku, { name });
    this.auditLogService.log('inventory', 'set-name', sku, name);
  }

  removeProduct(sku: string): void {
    this.productCatalogService.removeProduct(sku);
    this.auditLogService.log('inventory', 'remove-product', sku, buildInventoryRemoveDetail());
  }

  createProduct(): void {
    if (this.createProductForm.invalid) {
      this.createProductForm.markAllAsTouched();
      return;
    }

    const value = this.createProductForm.getRawValue();
    const ok = this.productCatalogService.addProduct({
      sku: value.sku,
      name: value.name,
      category: value.category,
      imageUrl: value.imageUrl,
      price: value.price,
      stock: value.stock
    });

    if (!ok) {
      this.productError.set(this.translateService.t('account.admin.errors.duplicateSku'));
      return;
    }

    this.productError.set('');
    this.auditLogService.log('inventory', 'create-product', value.sku, buildInventoryCreateDetail(value.name, value.category));
    this.createProductForm.reset({
      sku: '',
      name: '',
      category: '',
      imageUrl: '',
      price: 0,
      stock: 0
    });
  }
}
