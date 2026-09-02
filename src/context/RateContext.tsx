import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api/axios';

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
    updateRate: (metal: keyof MetalRates | 'all', value: number | MetalRates) => Promise<void>;
    getTrend: (current: number, previous?: number) => { percent: string; direction: 'up' | 'down' | 'stable' };
}

const DEFAULT_RATES: MetalRates = {
    gold24k: 6850,
    gold22k: 6650,
    silver: 92
};

const RateContext = createContext<RateContextType | undefined>(undefined);

export const RateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [rates, setRates] = useState<MetalRates>(DEFAULT_RATES);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await api.get('/rates');
                if (res.data?.data) {
                    setRates(prev => ({
                        ...res.data.data,
                        previous: prev.previous
                    }));
                }
            } catch (error) {
                console.error("Failed to load live rates", error);
            }
        };
        fetchRates();
    }, []);

    const updateRate = async (metal: keyof MetalRates | 'all', value: number | MetalRates) => {
        try {
            let payload: Partial<MetalRates> = {};
            if (metal === 'all' && typeof value === 'object') {
                payload = value as MetalRates;
            } else if (typeof metal === 'string' && metal !== 'previous') {
                payload = { ...rates, [metal]: value };
            }

            // Sync with DB
            const res = await api.post('/rates', payload);
            if (res.data?.data) {
                 setRates(prev => ({
                     ...res.data.data,
                     previous: {
                         gold24k: prev.gold24k,
                         gold22k: prev.gold22k,
                         silver: prev.silver,
                         lastUpdated: new Date().toISOString()
                     }
                 }));
            }
        } catch (error) {
             console.error("Failed to update rate", error);
             throw error;
        }
    };

    const getTrend = (current: number, previous?: number) => {
        if (!previous) return { percent: '0.00', direction: 'stable' as const };
        const diff = current - previous;
        const percent = (diff / previous) * 100;
        return {
            percent: Math.abs(percent).toFixed(2),
            direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable'
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
