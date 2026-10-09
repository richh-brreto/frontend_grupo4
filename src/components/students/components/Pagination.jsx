// Monta a lista de botões numéricos: sempre a primeira, a última e as vizinhas da atual,
// com reticências no meio para não estourar a barra quando há muitas páginas
function paginasVisiveis(atual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const paginas = new Set([0, total - 1, atual - 1, atual, atual + 1]);
  const ordenadas = [...paginas].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);

  const resultado = [];
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push(`gap-${p}`);
    resultado.push(p);
  });
  return resultado;
}

export default function Pagination({ pagina, totalPaginas, totalItens, tamanhoPagina, onChange, disabled }) {
  if (totalItens === 0) return null;

  const inicio = pagina * tamanhoPagina + 1;
  const fim = Math.min((pagina + 1) * tamanhoPagina, totalItens);

  return (
    <nav className="student-pagination" aria-label="Paginação de alunos">
      <span className="student-pagination-info">
        Mostrando <strong>{inicio}–{fim}</strong> de <strong>{totalItens}</strong> {totalItens === 1 ? 'aluno' : 'alunos'}
      </span>

      {totalPaginas > 1 && (
        <div className="student-pagination-controls">
          <button
            type="button"
            className="student-pagination-button"
            onClick={() => onChange(pagina - 1)}
            disabled={disabled || pagina === 0}
          >
            ‹ Anterior
          </button>

          {paginasVisiveis(pagina, totalPaginas).map((p) =>
            typeof p === 'string' ? (
              <span key={p} className="student-pagination-gap">…</span>
            ) : (
              <button
                key={p}
                type="button"
                className={`student-pagination-button numero ${p === pagina ? 'active' : ''}`}
                onClick={() => onChange(p)}
                disabled={disabled}
                aria-current={p === pagina ? 'page' : undefined}
              >
                {p + 1}
              </button>
            )
          )}

          <button
            type="button"
            className="student-pagination-button"
            onClick={() => onChange(pagina + 1)}
            disabled={disabled || pagina >= totalPaginas - 1}
          >
            Próxima ›
          </button>
        </div>
      )}
    </nav>
  );
}
