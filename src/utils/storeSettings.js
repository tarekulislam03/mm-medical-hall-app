import { Platform } from 'react-native';

const STORAGE_KEY = 'medix_store_settings';

export const DEFAULT_SETTINGS = {
    storeName: 'MM Medical Hall',
    address: 'Boro Masjid Tala, Dudhkalmi',
    phone: '+91 9735377436',
};

/** Read store settings — returns DEFAULT_SETTINGS if nothing saved yet */
export function getStoreSettings() {
    try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
            }
        }
    } catch (_) { /* ignore */ }
    return { ...DEFAULT_SETTINGS };
}

/** Persist store settings */
export function saveStoreSettings(settings) {
    try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
            return true;
        }
    } catch (_) { /* ignore */ }
    return false;
}
