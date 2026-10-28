import { alunosService } from '../components/students/components/alunosService';
import { professoresService } from '../components/professors/components/professoresService';

export const MENSAGEM_EMAIL_DUPLICADO = 'Este e-mail já está cadastrado para um aluno ou professor.';

const normalizarEmail = (email) => String(email ?? '').trim().toLowerCase();

const extrairLista = (resposta) => {
  if (Array.isArray(resposta)) return resposta;
  if (Array.isArray(resposta?.content)) return resposta.content;
  if (Array.isArray(resposta?.data)) return resposta.data;
  if (Array.isArray(resposta?.data?.content)) return resposta.data.content;
  return [];
};

export async function emailJaCadastrado(email, registroAtual = {}) {
  const emailNormalizado = normalizarEmail(email);
  const [alunosAtivos, alunosInativos, respostaProfessores] = await Promise.all([
    alunosService.listarTodos({ ativo: true }),
    alunosService.listarTodos({ ativo: false }),
    professoresService.listar(),
  ]);
  const alunos = [...alunosAtivos, ...alunosInativos];
  const professores = extrairLista(respostaProfessores);

  const temEmailEmOutroRegistro = (registro, tipo) =>
    normalizarEmail(registro.email) === emailNormalizado
    && !(registroAtual.tipo === tipo
      && registroAtual.id != null
      && String(registro.id) === String(registroAtual.id));

  return alunos.some((aluno) => temEmailEmOutroRegistro(aluno, 'aluno'))
    || professores.some((professor) => temEmailEmOutroRegistro(professor, 'professor'));
}