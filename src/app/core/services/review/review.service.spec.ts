import { TestBed } from '@angular/core/testing';

import { ReviewService } from './review.service';

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [ReviewService] });
    service = TestBed.inject(ReviewService);
  });

  it('adds reviews with normalized values', () => {
    service.addReview({
      sku: 'PET-001',
      author: '  Casey  ',
      rating: 9,
      comment: '  Great product  '
    });

    const reviews = service.getBySku('PET-001');
    expect(reviews.length).toBe(1);
    expect(reviews[0].author).toBe('Casey');
    expect(reviews[0].rating).toBe(5);
    expect(reviews[0].comment).toBe('Great product');
  });

  it('returns reviews sorted by newest first', () => {
    service.addReview({ sku: 'PET-001', author: 'A', rating: 3, comment: 'First' });
    service.addReview({ sku: 'PET-001', author: 'B', rating: 4, comment: 'Second' });

    const reviews = service.getBySku('PET-001');
    expect(reviews[0].comment).toBe('Second');
    expect(reviews[1].comment).toBe('First');
  });
});
