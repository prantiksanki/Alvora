import api from './api';

export const emailService = {
  getAccounts: () => api.get('/emails').then((r) => r.data),
  connectGmail: () => api.get('/emails/connect-gmail').then((r) => r.data),
  deleteAccount: (id) => api.delete(`/emails/${id}`).then((r) => r.data),
  syncAccount: (id) => api.post(`/emails/${id}/sync`).then((r) => r.data),
  getEmailBody: (accountId, messageId) =>
    api.get(`/emails/${accountId}/message/${messageId}`).then((r) => r.data),
};
