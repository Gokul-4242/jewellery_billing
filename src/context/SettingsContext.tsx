import React, { useMemo, useCallback, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  updateSettings as updateSettingsAction,
  type ShopSettings,
} from '../store/slices/settingsSlice';

export type { ShopSettings };

export interface SettingsContextType {
  settings: ShopSettings;
  updateSettings: (newSettings: ShopSettings) => void;
}

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useSettings = (): SettingsContextType => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings.settings);

  const updateSettings = useCallback(
    (newSettings: ShopSettings) => {
      dispatch(updateSettingsAction(newSettings));
    },
    [dispatch]
  );

  return useMemo(
    () => ({
      settings,
      updateSettings,
    }),
    [settings, updateSettings]
  );
};
