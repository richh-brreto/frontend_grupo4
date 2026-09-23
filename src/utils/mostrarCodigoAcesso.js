import Swal from 'sweetalert2';
import { copiarTexto } from './clipboard';

const escaparSeguro = (valor) =>
  String(valor ?? '').replace(/[&<>"']/g, (caractere) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[caractere]);

export default function mostrarCodigoAcesso({ nome, codigoAcesso }) {
  const inputId = 'codigo-acesso-copy-input';
  const valorSeguro = escaparSeguro(codigoAcesso);

  return Swal.fire({
    icon: 'success',
    title: `${nome} cadastrado(a)!`,
    html: `
      <p style="text-align:left; color:#475569; font-size:14px; margin:0 0 12px;">
        Repasse este código ao usuário. Ele será usado uma única vez.
      </p>
      <div style="display:flex; gap:8px; align-items:center;">
        <input
          id="${inputId}"
          type="text"
          value="${valorSeguro}"
          readonly
          style="flex:1; min-width:0; padding:12px 14px; border:1px solid #cbd5e1; border-radius:12px; background:#f8fafc; color:#0f1f3f; font-size:16px; font-weight:700; letter-spacing:0.1em; text-align:center;"
        />
        <button
          id="swal-copy-btn"
          type="button"
          style="padding:12px 16px; border:none; border-radius:12px; background:#0f1f3f; color:#fff; font-size:14px; font-weight:600; cursor:pointer; white-space:nowrap;"
        >
          Copiar
        </button>
      </div>
    `,
    confirmButtonText: 'Concluir',
    confirmButtonColor: '#0f1f3f',
    didOpen: () => {
      const botao = document.getElementById('swal-copy-btn');
      const input = document.getElementById(inputId);
      botao?.addEventListener('click', async () => {
        const copiado = await copiarTexto(input?.value ?? '');
        if (copiado && botao) botao.textContent = 'Copiado!';
      });
    },
  });
}