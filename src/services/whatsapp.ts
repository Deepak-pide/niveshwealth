import axios from 'axios';

const GUPSHUP_API_KEY = process.env.GUPSHUP_API_KEY;
const GUPSHUP_APP_NAME = process.env.GUPSHUP_APP_NAME;
const GUPSHUP_API_URL = 'https://api.gupshup.io/wa/api/v1/template/msg';

interface WithdrawalApprovedParams {
    phone: string;
    customerName: string;
    amount: string;
    date: string;
}

export const sendWithdrawalApprovedMessage = async (params: WithdrawalApprovedParams) => {
    if (!GUPSHUP_API_KEY || !GUPSHUP_APP_NAME) {
        throw new Error("Gupshup API key or App name is not configured.");
    }
    
    // Gupshup requires the phone number to be just the digits, without '+' or country code if it's already included in the number.
    // Assuming the provided number includes the country code.
    const recipientPhone = params.phone.replace(/\D/g, '');

    const requestBody = {
        template_id: "782fc962-9e0a-4a25-a131-01f2e6e73f94", // This should be the template ID from Gupshup
        source: "918919139850", // Your WhatsApp Business number
        destination: recipientPhone,
        template_params: [
            params.customerName,
            params.amount,
            params.date
        ],
        src_name: GUPSHUP_APP_NAME
    };
    
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'apikey': GUPSHUP_API_KEY,
        }
    };
    
    try {
        const response = await axios.post(GUPSHUP_API_URL, new URLSearchParams(requestBody as any).toString(), config);
        return response.data;
    } catch (error: any) {
        console.error('Error sending WhatsApp message:', error.response ? error.response.data : error.message);
        throw new Error('Failed to send WhatsApp message.');
    }
};
