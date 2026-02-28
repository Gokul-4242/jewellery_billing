export interface BillingItem {
    id: string;
    productId: string;
    name: string;
    code: string;
    weight: number;
    purity: string;
    rate: number;
    makingCharges: number;
    wastage?: number; // percentage
    discount?: number;
    total: number;
}

export interface ExchangeItem {
    id: string;
    description: string;
    weight: number;
    purity: number; // percentage
    value: number;
}

export interface CustomerDetails {
    name: string;
    phone: string;
    address: string;
    email?: string;
}

export interface InvoiceData {
    invoiceNo: string;
    date: string;
    customer: CustomerDetails;
    items: BillingItem[];
    exchangeItems: ExchangeItem[];
    subtotal: number;
    gst: number; // calculated tax
    gstRate?: number; // percentage
    discount: number;
    grandTotal: number;
    goldRate: number;
    paymentMethod?: 'Cash' | 'Card' | 'UPI' | 'Split';
    status?: 'Completed' | 'Pending' | 'Cancelled';
}
