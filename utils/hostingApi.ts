/**
 * Hosting API Client
 * Frontend utility untuk fetch data dari backend hosting API
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

/**
 * Create auth headers
 */
const getAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

/**
 * Generic fetch wrapper dengan error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options?.headers,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Unauthorized - redirect to login
            localStorage.removeItem('auth_token');
            window.location.href = '/';
            throw new Error('Unauthorized');
        }
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

// ==================== WEBSITES ====================

export const getWebsites = async () => {
    return apiFetch<{ success: boolean; data: any[] }>('/api/websites');
};

export const createWebsite = async (domain: string, plan: string) => {
    return apiFetch<{ success: boolean; data: any; message: string }>('/api/websites', {
        method: 'POST',
        body: JSON.stringify({ domain, plan }),
    });
};

export const deleteWebsite = async (id: number) => {
    return apiFetch<{ success: boolean; message: string }>(`/api/websites/${id}`, {
        method: 'DELETE',
    });
};

// ==================== DOMAINS ====================

export const getDomains = async () => {
    const response = await apiFetch<{ success: boolean; domains: any[] }>('/api/domains');
    return {
        success: response.success,
        data: response.domains || []
    };
};

export const registerDomain = async (domainName: string) => {
    return apiFetch<{ success: boolean; data: any; message: string }>('/api/domains', {
        method: 'POST',
        body: JSON.stringify({ domainName }),
    });
};

export const toggleAutoRenew = async (id: number, autoRenew: boolean) => {
    return apiFetch<{ success: boolean; message: string }>(`/api/domains/${id}/auto-renew`, {
        method: 'PATCH',
        body: JSON.stringify({ autoRenew }),
    });
};

// ==================== EMAIL ACCOUNTS ====================

export const getEmails = async () => {
    return apiFetch<{ success: boolean; data: any[] }>('/api/emails');
};

export const createEmail = async (email: string, quotaMb?: number) => {
    return apiFetch<{ success: boolean; data: any; message: string }>('/api/emails', {
        method: 'POST',
        body: JSON.stringify({ email, quotaMb }),
    });
};

// ==================== DATABASES ====================

export const getDatabases = async () => {
    const response = await apiFetch<{ success: boolean; databases: any[]; stats: any }>('/api/databases');
    // Transform to match expected format
    return {
        success: response.success,
        data: response.databases || []
    };
};

export const createDatabase = async (databaseName: string, databaseType: string) => {
    return apiFetch<{ success: boolean; data: any; message: string }>('/api/databases', {
        method: 'POST',
        body: JSON.stringify({ databaseName, databaseType }),
    });
};

// ==================== SSL CERTIFICATES ====================

export const getSSLCertificates = async () => {
    return apiFetch<{ success: boolean; data: any[] }>('/api/ssl');
};

// ==================== INVOICES ====================

export const getInvoices = async () => {
    return apiFetch<{ success: boolean; data: any[] }>('/api/invoices');
};

// ==================== SUPPORT TICKETS ====================

export const getTickets = async () => {
    return apiFetch<{ success: boolean; data: any[] }>('/api/tickets');
};

export const createTicket = async (subject: string, message: string, priority: string) => {
    return apiFetch<{ success: boolean; data: any; message: string }>('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject, message, priority }),
    });
};

// ==================== PAYMENT METHODS ====================

export const getPaymentMethods = async () => {
    return apiFetch<{ success: boolean; data: any[] }>('/api/payment-methods');
};

// ==================== DASHBOARD STATS ====================

/**
 * Get dashboard summary stats
 */
export const getDashboardStats = async () => {
    try {
        const [websites, domains, emails] = await Promise.all([
            getWebsites(),
            getDomains(),
            getEmails(),
        ]);

        return {
            totalWebsites: websites.data?.length || 0,
            totalDomains: domains.data?.length || 0,
            totalEmails: emails.data?.length || 0,
            // Calculate other stats from data
        };
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw error;
    }
};

// Export all as single object
export const hostingApi = {
    // Websites
    getWebsites,
    createWebsite,
    deleteWebsite,

    // Domains
    getDomains,
    registerDomain,
    toggleAutoRenew,

    // Emails
    getEmails,
    createEmail,

    // Databases
    getDatabases,
    createDatabase,

    // SSL
    getSSLCertificates,

    // Invoices
    getInvoices,

    // Tickets
    getTickets,
    createTicket,

    // Payment Methods
    getPaymentMethods,

    // Dashboard
    getDashboardStats,
};

export default hostingApi;
