import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface MetalRates {
    gold24k: number;
    gold22k: number;
    silver: number;
}

interface RateContextType {
    rates: MetalRates;
    updateRate: (metal: keyof MetalRates, value: number) => void;
}

const DEFAULT_RATES: MetalRates = {
    gold24k: 6850,
    gold22k: 6650,
    silver: 92
};

const RateContext = createContext<RateContextType | undefined>(undefined);

export const RateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [rates, setRates] = useState<MetalRates>(() => {
        const stored = localStorage.getItem('metal_rates');
        return stored ? JSON.parse(stored) : DEFAULT_RATES;
    });

    useEffect(() => {
        localStorage.setItem('metal_rates', JSON.stringify(rates));
    }, [rates]);

    const updateRate = (metal: keyof MetalRates, value: number) => {
        setRates(prev => ({ ...prev, [metal]: value }));
    };

    return (
        <RateContext.Provider value={{ rates, updateRate }}>
            {children}
        </RateContext.Provider>
    );
};

export const useRates = () => {
    const context = useContext(RateContext);
    if (!context) {
        throw new Error('useRates must be used within a RateProvider');
    }
    return context;
};
