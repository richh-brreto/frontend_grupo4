import axios from '../../../utils/axiosConfig';

const BASE_URL = '/alunos';

const extrairAlunos = (resposta) => {
  if (Array.isArray(resposta)) return resposta;
  if (Array.isArray(resposta?.content)) return resposta.content;
  if (Array.isArray(resposta?.data)) return resposta.data;
  if (Array.isArray(resposta?.data?.content)) return resposta.data.content;
  return [];
};

export const alunosService = {
  // Retorna uma página: { content, page, size, totalElements, totalPages, first, last }
  listar({ page = 0, size = 10, nome = '', ativo = true } = {}) {
    const params = { page, size, ativo };
    if (nome.trim()) params.nome = nome.trim();
    return axios.get(BASE_URL, { params }).then((res) => res.data);
  },

  // Para selects que precisam de todos os alunos ativos: percorre as páginas no tamanho máximo da API
  async listarTodos() {
    const alunos = [];
    let page = 0;
    let resposta;
    do {
      resposta = await this.listar({ page, size: 50 });
      const conteudo = extrairAlunos(resposta);
      alunos.push(...conteudo);
      page += 1;
    } while (resposta?.last === false || resposta?.data?.last === false);
    return alunos;
  },

  criar(aluno) {
    return axios.post(BASE_URL, aluno).then((res) => res.data);
  },

  atualizar(id, aluno) {
    return axios.put(`${BASE_URL}/${id}`, aluno).then((res) => res.data);
  },

  excluir(id) {
    return axios.delete(`${BASE_URL}/${id}`);
  },

  inativar(id) {
    // A API usa DELETE como soft delete: altera ativo para false.
    return axios.delete(`${BASE_URL}/${id}`);
  },

  reativar(id) {
    return axios.patch(`${BASE_URL}/${id}/reativar`).then((res) => res.data);
  },
};
