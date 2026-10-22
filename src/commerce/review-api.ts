import { accessPreviewEnabled } from './api';
import { readRentalSession } from './orders-api';
import { createReviewClient } from './review-client';
export const reviewApi = createReviewClient({ enabled: accessPreviewEnabled && import.meta.env.VITE_RENTAL_REVIEW_API === 'true', readSession: readRentalSession });
