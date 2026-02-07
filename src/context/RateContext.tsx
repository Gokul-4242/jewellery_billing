import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface MetalRates {
    gold24k: number;
    gold22k: number;
    silver: number;
    previous?: {
        gold24k: number;
        gold22k: number;
        silver: number;
        lastUpdated: string;
    };


}

interface RateContextType {
    rates: MetalRates;

    updateRate: (metal: keyof MetalRates | 'all', value: number | MetalRates) => void;
    getTrend: (current: number, previous?: number) => { percent: string; direction: 'up' | 'down' | 'neutral' };
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

    const updateRate = (metal: keyof MetalRates | 'all', value: number | MetalRates) => {
        if (metal === 'all' && typeof value === 'object') {
            setRates(prev => ({
                ...value as MetalRates,
                previous: {
                    gold24k: prev.gold24k,
                    gold22k: prev.gold22k,
                    silver: prev.silver,
                    lastUpdated: new Date().toISOString()
                }
            }));
        } else if (typeof metal === 'string' && metal !== 'previous') {
            setRates(prev => {
                // Only update history if value actually changes significantly
                if (prev[metal as keyof MetalRates] === value) return prev;

                return {
                    ...prev,
                    [metal]: value,
                    previous: {
                        gold24k: prev.gold24k,
                        gold22k: prev.gold22k,
                        silver: prev.silver,
                        lastUpdated: new Date().toISOString()
                    }
                };
            });
        }
    };

    const getTrend = (current: number, previous?: number) => {
        if (!previous) return { percent: '0.00', direction: 'neutral' as const };
        const diff = current - previous;
        const percent = (diff / previous) * 100;
        return {
            percent: Math.abs(percent).toFixed(2),
            direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral'
        } as const;
    };

    return (
        <RateContext.Provider value={{ rates, updateRate, getTrend }}>
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
