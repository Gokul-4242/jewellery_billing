import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ShopSettings {
  name: string;
  location: string;
  address: string;
  gstNo: string;
  email: string;
  contact: string;
  notifications: {
    lowStock: boolean;
    marketAlerts: boolean;
    dailySummary: boolean;
  };
}

export const defaultSettings: ShopSettings = {
  name: 'VGH JEWELLERS',
  location: 'Meenakshipuram, Nagercoil-629001',
  address: 'Ammasimadam Street, Meenakshipuram, Nagercoil-629001',
  gstNo: '27AABCU9603R1ZM',
  email: 'vghjewellers@gmail.com',
  contact: '+91 9876543210',
  notifications: {
    lowStock: true,
    marketAlerts: true,
    dailySummary: false,
  },
};

interface SettingsState {
  settings: ShopSettings;
}

const getInitialSettings = (): ShopSettings => {
  try {
    const saved = localStorage.getItem('shop_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  } catch (err) {
    console.error('Failed to parse shop_settings from localStorage', err);
    return defaultSettings;
  }
};

const initialState: SettingsState = {
  settings: getInitialSettings(),
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<ShopSettings>) => {
      state.settings = action.payload;
      localStorage.setItem('shop_settings', JSON.stringify(action.payload));
    },
  },
});

export const { updateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
