import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import {
  AuditArea,
  AuditEntry,
  AuditLogService,
  FraudActionsService,
  OrderService,
  ProductCatalogService,
  BackendConnectivityService,
  TranslateService
} from '../../../../core';
import { AdminComponent } from './admin.component';

const TEST_TRANSLATIONS: Record<string, string> = {
  'account.admin.integrity': 'Integrity: {status}',
  'account.admin.integrityVerified': 'verified',
  'account.admin.integrityTampered': 'tampered',
  'account.admin.errors.duplicateSku': 'SKU already exists. Choose a unique SKU.'
};

const translateMock = {
  translations: signal(TEST_TRANSLATIONS),
  t(key: string, params?: Record<string, string | number>): string {
    let value = TEST_TRANSLATIONS[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replaceAll(`{${k}}`, String(v));
      }
    }
    return value;
  }
};

interface ProductStub {
  sku: string;
  name: string;
  price: number;
  stock: number;
}

describe('AdminComponent', () => {
  let fixture: ComponentFixture<AdminComponent>;
  let component: AdminComponent;
  let chainValidState: ReturnType<typeof signal<boolean>>;
  let productCatalogServiceMock: {
    products: ReturnType<ReturnType<typeof signal<ProductStub[]>>['asReadonly']>;
    updateStock: jasmine.Spy;
    updateProduct: jasmine.Spy;
    removeProduct: jasmine.Spy;
    addProduct: jasmine.Spy;
  };
  let auditService: {
    entries: ReturnType<typeof computed<AuditEntry[]>>;
    chainValid: ReturnType<ReturnType<typeof signal<boolean>>['asReadonly']>;
    log: jasmine.Spy;
  };

  beforeEach(async () => {
    const auditEntriesState = signal<AuditEntry[]>([
      {
        id: 'AL-1',
        timestamp: Date.now(),
        actor: 'Admin User <admin@pethaven.com>',
        area: 'orders' as AuditArea,
        action: 'set-status',
        targetId: 'PH-1001',
        details: 'Order status updated',
        prevHash: 'prev-1',
        hash: 'hash-1'
      },
      {
        id: 'AL-2',
        timestamp: Date.now(),
        actor: 'Admin User <admin@pethaven.com>',
        area: 'inventory' as AuditArea,
        action: 'create-product',
        targetId: 'PET-1',
        details: 'Created product',
        prevHash: 'prev-2',
        hash: 'hash-2'
      }
    ]);

    const orderServiceMock = {
      orders: signal([]).asReadonly(),
      updateStatus: jasmine.createSpy('updateStatus'),
      approveReturn: jasmine.createSpy('approveReturn'),
      markReturnInTransit: jasmine.createSpy('markReturnInTransit'),
      markReturnReceived: jasmine.createSpy('markReturnReceived'),
      markRefunded: jasmine.createSpy('markRefunded')
    };

    productCatalogServiceMock = {
      products: signal([]).asReadonly(),
      updateStock: jasmine.createSpy('updateStock'),
      updateProduct: jasmine.createSpy('updateProduct'),
      removeProduct: jasmine.createSpy('removeProduct'),
      addProduct: jasmine.createSpy('addProduct').and.returnValue(true)
    };

    const fraudActionsMock = {
      blockedCountLast24h: computed(() => 0),
      openCount: computed(() => 0),
      escalatedCount: computed(() => 0)
    };

    chainValidState = signal(true);
    auditService = {
      entries: computed(() => auditEntriesState()),
      chainValid: chainValidState.asReadonly(),
      log: jasmine.createSpy('log')
    };

    const backendConnectivityMock = {
      status: signal('disabled').asReadonly(),
      lastCheck: signal(0).asReadonly(),
      isHealthy: computed(() => false),
      isDegraded: computed(() => false),
      isOffline: computed(() => false),
      isDisabled: computed(() => true)
    };

    await TestBed.configureTestingModule({
      imports: [AdminComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: OrderService, useValue: orderServiceMock },
        { provide: ProductCatalogService, useValue: productCatalogServiceMock },
        { provide: FraudActionsService, useValue: fraudActionsMock },
        { provide: AuditLogService, useValue: auditService },
        { provide: BackendConnectivityService, useValue: backendConnectivityMock },
        { provide: TranslateService, useValue: translateMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows current audit summary counts on the dashboard', () => {
    expect(component.auditEntryCount()).toBe(2);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('2');
  });

  it('renders integrity status from chain validity signal', () => {
    let text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Integrity: verified');

    chainValidState.set(false);
    fixture.detectChanges();

    text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Integrity: tampered');
  });

  it('shows a translated duplicate SKU error', () => {
    productCatalogServiceMock.addProduct.and.returnValue(false);

    component.createProductForm.setValue({
      sku: 'PET-1',
      name: 'Pet Toy',
      category: 'Toys',
      imageUrl: 'https://example.com/pet-toy.jpg',
      price: 12,
      stock: 8
    });

    component.createProduct();

    expect(component.productError()).toBe('SKU already exists. Choose a unique SKU.');
  });
});
