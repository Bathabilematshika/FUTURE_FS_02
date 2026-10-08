const API_URL = 'http://localhost:5000/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  localStorage.setItem('token', data.token);
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (res.status === 401) {
    logout();
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const getLeads = () => request('/leads');

export const createLead = (lead) =>
  request('/leads', { method: 'POST', body: JSON.stringify(lead) });

export const updateLead = (id, changes) =>
  request(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(changes) });

export const addNote = (id, note) =>
  request(`/leads/${id}/notes`, { method: 'POST', body: JSON.stringify(note) });

export const deleteLead = (id) => request(`/leads/${id}`, { method: 'DELETE' });