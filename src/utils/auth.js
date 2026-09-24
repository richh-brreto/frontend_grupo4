// Lê as authorities do JWT salvo apenas para ajustar a interface
// (ex.: esconder botões). A autorização real é sempre feita no backend.
function lerAuthorities() {
  const token = localStorage.getItem('authToken');
  if (!token) return [];

  try {
    const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(payloadBase64));
    return String(payload.authorities || '').split(',');
  } catch {
    return [];
  }
}

export function isCoordenador() {
  return lerAuthorities().includes('ROLE_COORDENADOR');
}
