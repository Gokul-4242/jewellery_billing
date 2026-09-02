export interface CalculationHistoryItem {
    id: string;
    timestamp: string;
    metalType: 'gold' | 'silver';
    grossWeight: number;
    purity: number | string;
    totalValue: number;
}

export interface ExchangeCalculatorProps {
    onBack?: () => void;
    onAddToInvoice?: (value: number) => void;
}

export interface RateTrend {
    direction: 'up' | 'down' | 'stable';
    percent: string;
}
