import { supabase } from '../services/supabaseClient';
import { accessPreviewEnabled } from './api';
import { createOrdersClient } from './orders-client';
// Independent readiness flag: preview access alone must never call a missing order API.
export const ordersApi = createOrdersClient({ enabled: accessPreviewEnabled && import.meta.env.VITE_RENTAL_ORDERS_API === 'true',
    async readSession() {
        if (!supabase)
            return null;
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session || data.session.user.is_anonymous)
            return null;
        return { owner: data.session.user.id, token: data.session.access_token };
    } });
