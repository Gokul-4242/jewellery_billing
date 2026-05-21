export interface TransactionItem {
    id: string;
    name: string;
    code: string;
    weight: number;
    purity: string;
    rate: number;
    makingCharges: number;
    wastage?: number;
    stoneWeight?: number;
    stoneRate?: number;
    metalType?: string;
    total: number;
}

export interface Transaction {
    _id?: string;
    id: string;

    invoiceNo: string;
    date: string; // ISO string
    customerName: string;
    customerId?: string;
    items: TransactionItem[];
    subtotal: number;
    gst: number;
    gstRate?: number;
    discount: number;
    exchangeTotal: number;
    exchangeItems?: { id: string; name?: string; description?: string; weight: number; purity: number | string; value: number }[];
    grandTotal: number;
    paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Split';
    status: 'Completed' | 'Pending' | 'Cancelled' | 'In Production' | 'Quality Check';
    goldRate?: number;
    imageUrl?: string;
    amountPaid?: number;
    deliveryDate?: string;
    cancellationReason?: string;
}
