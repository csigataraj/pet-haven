import { TestBed } from '@angular/core/testing';

import { AddressBookService } from './address-book.service';

describe('AddressBookService', () => {
  let service: AddressBookService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [AddressBookService] });
    service = TestBed.inject(AddressBookService);
  });

  it('adds and removes addresses per email', () => {
    const added = service.addForEmail('USER@EXAMPLE.COM', {
      label: 'Home',
      address: 'Main 1',
      city: 'Budapest',
      postalCode: '1111',
      country: 'HU'
    });

    expect(service.getForEmail('user@example.com').length).toBe(1);

    service.removeForEmail('user@example.com', added.id);
    expect(service.getForEmail('user@example.com')).toEqual([]);
  });

  it('detects matching address ignoring case/spacing', () => {
    service.addForEmail('a@example.com', {
      label: 'Office',
      address: 'Main 1',
      city: 'Budapest',
      postalCode: '1111',
      country: 'HU'
    });

    expect(
      service.hasMatchingAddress('A@example.com', {
        address: ' main 1 ',
        city: 'BUDAPEST',
        postalCode: '1111',
        country: 'hu'
      })
    ).toBeTrue();
  });
});
