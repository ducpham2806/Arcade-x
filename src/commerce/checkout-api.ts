import { accessPreviewEnabled } from './api';
import { readRentalSession } from './orders-api';
import { createCheckoutClient } from './checkout-client';
export const checkoutApi = createCheckoutClient({ enabled: accessPreviewEnabled && import.meta.env.VITE_RENTAL_ORDERS_API === 'true' && import.meta.env.VITE_RENTAL_CHECKOUT_API === 'true', readSession: readRentalSession });
