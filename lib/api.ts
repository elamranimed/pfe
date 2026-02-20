export const officesApi = {
  getAll: async () => {
    const res = await fetch('/api/offices', { credentials: 'include' });
    if (!res.ok) throw new Error('Erreur chargement bureaux');
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch('/api/offices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur création bureau');
    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await fetch('/api/offices', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, data }),
    });
    if (!res.ok) throw new Error('Erreur modification bureau');
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch('/api/offices', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error('Erreur suppression bureau');
    return res.json();
  },
};