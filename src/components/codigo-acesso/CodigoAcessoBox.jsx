import { useState } from 'react';
import { copiarTexto } from '../../utils/clipboard';
import './CodigoAcessoBox.css';

export default function CodigoAcessoBox({ codigoAcesso, senhaDefinida }) {
  const [copiado, setCopiado] = useState(false);

  if (senhaDefinida !== false || !codigoAcesso) return null;

  const handleCopiar = async () => {
    const ok = await copiarTexto(codigoAcesso);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="codigo-access-box">
      <label className="modal-field-label" htmlFor="codigo-acesso-uso-unico">Código de acesso (uso único):</label>
      <div className="codigo-access-row">
        <input id="codigo-acesso-uso-unico" className="modal-form-control" type="text" value={codigoAcesso} readOnly />
        <button type="button" className="codigo-access-copy" onClick={handleCopiar}>
          {copiado ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}