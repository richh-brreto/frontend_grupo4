import axios from '../../utils/axiosConfig';

const CHAT_URL = '/chat';
const RELATORIO_CSV_URL = '/relatorio/csv';

function extrairNomeArquivo(headers) {
  const disposicao = headers?.['content-disposition'] || headers?.['Content-Disposition'];
  if (!disposicao) return null;

  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposicao);
  return match ? decodeURIComponent(match[1]) : null;
}

function dispararDownload(blob, nomeArquivo) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const chatService = {
  perguntar(mensagem) {
    return axios.post(CHAT_URL, { tipo: 'PERGUNTA', mensagem }).then((res) => res.data);
  },

  gerarRelatorio() {
    return axios.post(CHAT_URL, { tipo: 'RELATORIO' }).then((res) => res.data);
  },

  async baixarCsv({ inicio, fim } = {}) {
    const params = {};
    if (inicio) params.startDate = inicio;
    if (fim) params.endDate = fim;

    const response = await axios.get(RELATORIO_CSV_URL, { params, responseType: 'blob' });

    const nomeArquivo = extrairNomeArquivo(response.headers)
      || `relatorio-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;

    dispararDownload(response.data, nomeArquivo);
  }
};
