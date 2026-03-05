import type { Product } from '../types/Dashboard.types';
import type { Customer } from '../types/Customer';

// Re-export types if needed or just use them here. 
// Note: Customer interface is exported from CustomerManagement.tsx. 
// Ideally types should be in types/ folder but for now this is fine.

export const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Royal Wedding Band',
        sku: 'GLD-8821',
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAd1AMtPlbjIYbpF71baxIk8Zqo6O5tJJmuDIytLBbWcOKrwO2bnT32hEP22qOf2OStUq5aN4cqX3mCC4_q9hroZ9rPZO8NbME9tb6Ud7w_pi9837YWt--tQ6VhMW9rNTQPaxrYtPA4SzbfCAzuP-QAyzFs04-2Yj2_T4J1Ps7MNcAYPeJlziefDlVCyu3-HRXl7F3mn7h5lRoMPlaCuHLQul9x1TvEoxWnuf9FQn7ljgb7yWKmdqXXqDoB8licD6bOnOhDz_7FXaKP'],
        category: 'Ring',
        material: '22k Gold',
        weight: 12.50,
        price: 1200,
        status: 'In Stock',
        quantity: 10,
        lastModified: '2024-02-04T10:00:00Z'
    },
    {
        id: '2',
        name: 'Sterling Curb Chain',
        sku: 'SLV-4420',
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCBt-OeQFfbg1hfg1wzPiMmwGgYmVt9KY1Vb6QPH7R-thm4VySLD0I6O0SO2cQOsi3SIfzHIQBmmCjFvkU52yilr5B9X6zNfmXxpdxIBaThaVO_qkL83Xze0dmcVVoxK26UAc2zmH7jTv215z-F_XZFsopVZRuQ8-R202mRoh4IysLRLUmhkRh3Ht_Ebdz6iLTwQRRJfAiup0YjEQw6FFgH-ZwO2gWcn_Jij7Lhv0Hwb4oVjPdvLTgMrUZeqAVwEqEvfSdbYynbbBwN'],
        category: 'Necklace',
        material: '925 Silver',
        weight: 45.00,
        price: 120,
        status: 'Low Stock',
        quantity: 3,
        lastModified: '2024-02-04T09:30:00Z'
    },
    {
        id: '3',
        name: 'Lakshmi Pendant',
        sku: 'GLD-9901',
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDh2PIDApmSlL8VBQbLQR4rHnYQd48S3K88IN2l22vDhsrZzG0ZHNbAetrDQzpERI7Zp5LCaGv93aHgvjgNQYfE4SsE50CRVku1JColRPhYq7ULiEhwDI1CeapW0ObjM4JTjhUuwNTUEGkL_a0yGou27tFZyj6DsqAiY8Gx5XaA5vDYEw6t4WvyI1j2tloNBKNnhEhvVnbp9PCGv0JnLNlhELMF4wa4k90OLZBNOVj0DIpaXWsIkuCnSK3b9dilBrO6KXrY2JZD0p92'],
        category: 'Pendant',
        material: '24k Gold',
        weight: 8.00,
        price: 950,
        status: 'In Stock',
        quantity: 5,
        lastModified: '2024-02-03T15:00:00Z'
    },
    {
        id: '4',
        name: 'Classic Hoops',
        sku: 'SLV-1029',
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCIbe_3Zag1UMx1GwawJfDbognzyuNx19OarD3eWoBH2zvDjEe1dJFPHWhxsgfImmWcLqqlYr0d3Zp4JWZ558EJmtOglwuuzSfK4-cTvDqPNGHiP-WCv3ZoZhwHhMqUqRhMLKQmkNzVC4JHoOGpUtQZ-TlFvq71YstV7GCWpy2m9c8Umw8neq7k0HNrkUnjoElt5Ba23Qzf8kuFpd7UvHOwbXYhF2wpZjtoWqv1cRYEFcs8gRJg5ooCyX1Iw_j5-1yOGkE49Ur184R0'],
        category: 'Earrings',
        material: '925 Silver',
        weight: 6.50,
        price: 55,
        status: 'Out of Stock',
        quantity: 0,
        lastModified: '2024-02-02T11:00:00Z'
    },
    {
        id: '5',
        name: 'Antique Bangle',
        sku: 'GLD-3341',
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCmRgeDNhQ4QS1zo_0v8iqBnjOhpFTXusW2bWRf9wmCxd4L-Du2GbZ4sazehBU3hoG4EGDW-s75uhfMxchOiPtfLfFMYP1gPdvmOCrA6O-QmhmoWKEXdq66K_ZVdgri8rGwnWWFy-QqznFyS3cSS1Ky4TlPlvb0G-Ah0C2kTScszqFZd01BBF1gKJLmQO_jlJlELFBC8HRTOSX56NpGwl8PX4dSXiGb2_ABIBw_zqXqmlDY7_X-lE4LmU-4Z3NcPpN3VKPUCW_ENCgx'],
        category: 'Bracelet',
        material: '22k Gold',
        weight: 24.20,
        price: 2100,
        status: 'In Stock',
        quantity: 7,
        lastModified: '2024-02-04T12:00:00Z'
    }
];

export const INITIAL_CUSTOMERS: Customer[] = [
    {
        id: 'CUST-001',
        name: 'Priya Sharma',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX4IJ-Tf4fZxUAOf8otcDuseJKiXSVl6ukF-10vM0JiQVRrGXEpzgL-BWSRrlqt8TqYuQ1MlMYaah-31PW-1tCMs8GPnfKf79pJXtvMmFSdOeiOoqep25ekEU0sszWUKPWSLFCdZEQxAdH66sIOFYEn5CZsejDCmH3fBDOS3xolGIS6JF0v1O2JorqmJJnGxSrRgQXvF1As5zeEoZbQRzOZ2MCymfpGrSxjnAXCJCmSOVyBvMVlc2zeZQWlEurcO_GkgCssrE4Eq4A',
        joinedDate: 'Jan 2023',
        phone: '+91 98765 43210',
        email: 'priya.s@example.com',
        totalSpend: 450000,
        transactionCount: 12,
        lastVisit: '2 days ago',
        notes: [
            {
                id: '1',
                date: 'Oct 12, 2023',
                author: 'Sarah J.',
                text: "Client mentioned looking for a silver bracelet for daughter's graduation in June. Prefers minimalist designs."
            }
        ]
    },
    {
        id: 'CUST-002',
        name: 'Rahul Verma',
        joinedDate: 'Mar 2023',
        phone: '+91 99887 76655',
        email: 'rahul.v@example.com',
        totalSpend: 120000,
        transactionCount: 4,
        lastVisit: '1 week ago'
    },
    {
        id: 'CUST-003',
        name: 'Amit Patel',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgLHuv_MRwF0QECYCoqX9poazmEMmlcJpb1xBG8XU3OViRuqjGC6e1w7Pt9kAJ59zbrhkaLAsjfZ1g4fN-u3EgJdkDCP0LAb9aQw-m07hi1ttZ1cLJSwcMuX87Gxrhc9VgmdrtvpLxdJn-XGbgkCl-nc-zeDWqRkUedrng8h3qYZC14FJmup1Au_Cb-cru9lW3yYOE9rVVPW7HvUu4ohVydIJltv7fCBCHAEK589-RNNqxqk3w8HiCbMO7adx8sxs1HCIze9DkMMXp',
        joinedDate: 'Dec 2022',
        phone: '+91 91234 56789',
        email: 'amit.patel@business.com',
        totalSpend: 890000,
        transactionCount: 18,
        lastVisit: '3 days ago',
        notes: [
            {
                id: '2',
                date: 'Jan 05, 2023',
                author: 'James A.',
                text: 'Ring size updated to 7.5. Prefers Rose Gold over Yellow Gold.'
            }
        ]
    },
    {
        id: 'CUST-004',
        name: 'Sneha Reddy',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfF8rOj-tqEbOzrhTCc8nCu1x8U--72bj39i1zwzcDa_QrlEomjr3V_4lw1azmTR15jw_ksGUb-4ZU0zVjCbXGzXaSy6rVDOexIBIKA6XMZC2HcQOmcoNfJRFg50-KODv7gDhaXyWwmps4lqx4dq477ntHYdxWkb300NOLdN439qe4qnfOOdCZaskDHJO4NCGModpgtHO-RR2wR0ygaOyPFkaROwqUAVyv7b2sTIvIajVHSCMTmVlg9x_dWT_9XbsUABsEVo-geaiM',
        joinedDate: 'Jun 2023',
        phone: '+91 95544 33221',
        email: 'sneha.r@example.com',
        totalSpend: 45000,
        transactionCount: 1,
        lastVisit: '1 month ago'
    },
    {
        id: 'CUST-005',
        name: 'Vikram Singh',
        joinedDate: 'Nov 2021',
        phone: '+91 90000 11111',
        email: 'v.singh@royal.com',
        totalSpend: 1200000,
        transactionCount: 24,
        lastVisit: 'Today, 10:30 AM'
    }
];
