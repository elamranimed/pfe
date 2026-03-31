import jwt from 'jsonwebtoken';

export function getUserRole(): 'admin' | 'responsable' | null {
 
    // Lire le cookie "token"
  const cookieString = document.cookie;  
  const token = cookieString
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('token='))
    ?.split('=')[1];
  
  if (!token) return null;

  const payload: any = jwt.decode(token);
  console.log("Payload JWT:", payload); // ✅ debug
  const role = payload?.role?.toLowerCase(); // ✅ normalisation

  if (role === 'admin') return 'admin';
  if (role === 'responsable') return 'responsable';
  return null;
}
