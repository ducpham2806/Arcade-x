import { getCloudDatabase } from '../cloudStore';

// One shared client for every SupabaseService domain module.
export const cloudDb = getCloudDatabase();
