import React, { createContext, useContext, useState, useEffect } from 'react';

interface ShopSettings {
    name: string;
    location: string;
    address: string;
    gstNo: string;
    email: string;
    contact: string;
}

interface SettingsContextType {
    settings: ShopSettings;
    updateSettings: (newSettings: ShopSettings) => void;
}

const defaultSettings: ShopSettings = {
    name: 'VGH JEWELLERS',
    location: 'Meenakshipuram, Nagercoil-629001',
    address: 'Ammasimadam Street, Meenakshipuram, Nagercoil-629001',
    gstNo: '27AABCU9603R1ZM',
    email: 'vghjewellers@gmail.com',
    contact: '+91 9876543210'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<ShopSettings>(() => {
        const saved = localStorage.getItem('shop_settings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    useEffect(() => {
        localStorage.setItem('shop_settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings: ShopSettings) => {
        setSettings(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
