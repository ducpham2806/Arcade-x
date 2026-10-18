import { supabase } from '../services/supabaseClient';
import { accessPreviewEnabled } from './api';
import { createOrdersClient } from './orders-client';
export async function readRentalSession() {
    if (!supabase)
        return null;
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session || data.session.user.is_anonymous)
        return null;
    return { owner: data.session.user.id, token: data.session.access_token };
}
// Independent readiness flag: preview access alone must never call a missing order API.
export const ordersApi = createOrdersClient({ enabled: accessPreviewEnabled && import.meta.env.VITE_RENTAL_ORDERS_API === 'true', readSession: readRentalSession });
