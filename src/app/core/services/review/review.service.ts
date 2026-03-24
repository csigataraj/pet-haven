import { Injectable, signal } from '@angular/core';

import { createPrefixedId } from '../../utils/id';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

export interface ProductReview {
  id: string;
  sku: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const STORAGE_KEY = 'pet1.reviews';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly reviewsState = signal<ProductReview[]>(this.load());

  readonly reviews = this.reviewsState.asReadonly();

  getBySku(sku: string): ProductReview[] {
    return this.reviewsState()
      .filter((review) => review.sku === sku)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  addReview(input: Omit<ProductReview, 'id' | 'createdAt'>): void {
    const review: ProductReview = {
      id: createPrefixedId('RV', 5),
      createdAt: new Date().toISOString(),
      sku: input.sku,
      author: input.author.trim(),
      rating: Math.max(1, Math.min(5, input.rating)),
      comment: input.comment.trim()
    };

    this.reviewsState.update((current) => [review, ...current]);
    this.persist();
  }

  private load(): ProductReview[] {
    return loadFromStorage<ProductReview[]>(STORAGE_KEY, []);
  }

  private persist(): void {
    saveToStorage(STORAGE_KEY, this.reviewsState());
  }
}
