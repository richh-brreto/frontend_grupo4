import { usePermissoesDisponiveis } from './usePermissoesDisponiveis';
import './SeletorPermissoes.css';

// Caixas de marcação das telas liberadas. As opções vêm do catálogo do banco,
// então cadastrar uma tela nova no banco já faz ela aparecer aqui.
export default function SeletorPermissoes({ selecionadas = [], onChange }) {
  const { disponiveis, carregando, erro } = usePermissoesDisponiveis();

  function alternar(nome) {
    const proximas = selecionadas.includes(nome)
      ? selecionadas.filter((item) => item !== nome)
      : [...selecionadas, nome];

    onChange(proximas);
  }

  function selecionarTodas() {
    onChange(disponiveis.map((item) => item.nome));
  }

  function limparTodas() {
    onChange([]);
  }

  if (carregando) {
    return <p className="permissoes-status">Carregando telas...</p>;
  }

  if (erro) {
    return <p className="permissoes-status erro">Não foi possível carregar as telas: {erro}</p>;
  }

  if (disponiveis.length === 0) {
    return (
      <p className="permissoes-status">
        Nenhuma tela cadastrada no banco (tabela <code>permissao</code>).
      </p>
    );
  }

  const todasMarcadas = selecionadas.length === disponiveis.length;

  return (
    <div className="permissoes-seletor">
      <div className="permissoes-seletor-topo">
        <span>Telas liberadas</span>
        <div className="permissoes-seletor-acoes">
          <button type="button" onClick={selecionarTodas}>
            Marcar todas
          </button>
          <button type="button" onClick={limparTodas}>
            Limpar
          </button>
        </div>
      </div>

      <div className="permissoes-lista">
        {disponiveis.map((permissao) => (
          <label key={permissao.nome} className="permissoes-item">
            <input
              type="checkbox"
              checked={todasMarcadas || selecionadas.includes(permissao.nome)}
              onChange={() => alternar(permissao.nome)}
            />
            <span>{permissao.nome}</span>
          </label>
        ))}
      </div>

      <p className="permissoes-contagem">
        {selecionadas.length} de {disponiveis.length} telas liberadas
      </p>
    </div>
  );
}
