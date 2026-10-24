# React + Vite

## Cadastro de aluno e contrato

Ao salvar um novo aluno, a configuração do contrato abre sem alerta de conclusão.
O alerta final exibe o código de acesso após criar o contrato ou confirmar a saída
sem contrato (Cancelar, X ou clique fora do modal).

Durante o envio do contrato, o formulário fecha e novos envios ficam bloqueados.
Se a API retornar um erro, o formulário reabre com os dados preenchidos para tentar
novamente. Ao concluir, o estado de navegação do cadastro é limpo para não reabrir
o fluxo ao atualizar a página.

Na edição de alunos, alterações não salvas pedem confirmação ao cancelar, clicar
no X ou fora do modal. Continuar a edição mantém os dados preenchidos; confirmar
a saída descarta as alterações.

## Status dos alunos

As abas Ativos e Inativos consultam `GET /alunos` com `ativo=true` ou
`ativo=false`, incluindo busca por nome e paginação. O cache local antigo de
inativos não é usado para listar ou ocultar alunos.

Inativar usa `DELETE /alunos/{id}` (soft delete definido pelo backend); reativar
usa `PATCH /alunos/{id}/reativar`. Cliques repetidos ficam bloqueados durante
a alteração, erros são exibidos e a lista é consultada novamente após o sucesso.
O comportamento do backend foi mantido: inativar também remove os contratos e
limpa os horários; reativar não restaura esses vínculos.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
