// services/auth.service.js
import http from 'utils/http';

export const authService = {
    async login(credentials) {
        const response = await http.post('/user/login', credentials);
        return response.data;
    },

    async register(user) {
        const response = await http.post('/user/register', user);
        return response.data;
    },

    async sendMFACode({ userId, email, mobileNo, method }) {
        const endpoint = method === 'email' ? '/verify/email' : '/verify/phone';
        const payload = {
            email,
            ...(method === 'sms' && { phoneNo: mobileNo })
        };
        const response = await http.post(endpoint, payload);
        return response.data;
    },

    async verifyMFACode({ email, otp, method }) {
        const endpoint = method === 'email' 
            ? '/verify/email-otp' 
            : '/verify/phone-otp';
        const response = await http.post(endpoint, {
            email,
            otp
        });
        return response.data;
    }
};