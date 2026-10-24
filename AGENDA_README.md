# Tela de Agenda 📅

## Descrição

A tela de agenda foi criada com comportamento similar ao Google Calendar, exibindo aulas em uma grade com horários de 7:00 até 20:00 e dias da semana de segunda a sábado.

## Características ✨

- Os botões `+` de adicionar evento estão temporariamente ocultos.
- Blocos com várias aulas só recebem o estilo de cancelamento quando todas as aulas do bloco estão canceladas; ao expandir, cada aula mantém seu próprio status.
- ✅ **Grid de horários**: Exibe 6 dias da semana (Segunda a Sábado) com horas de 7:00 a 20:00
- ✅ **Eventos proporcionais**: A altura do evento é calculada automaticamente baseada na duração (horaFim - horaInicio)
- ✅ **Detecção de conflitos**: Se dois eventos se sobrepõem no mesmo dia, eles são posicionados lado a lado
- ✅ **Alinhamento dos blocos**: Aulas individuais e agrupadas usam recuos iguais de 4px em cada lado do intervalo, inclusive quando dividem a coluna com outras aulas.
- ✅ **Interface responsiva**: Design semelhante ao design especificado
- ✅ **Abas**: Chatbot (ativa por padrão) e Filtros para expansão futura
- ✅ **Acesso público**: Disponível em `/aulas` sem necessidade de login

## Estrutura de Pastas

```
src/
└── components/
    └── agenda/
        ├── Agenda.jsx      # Componente principal
        └── Agenda.css      # Estilos
```

## Schema de Dados

O componente espera receber dados no seguinte formato:

```json
[
  {
    "id": 0,
    "data": "2026-07-08",
    "horaInicio": "08:00",
    "horaFim": "10:00",
    "status": "AGENDADA",
    "presenca": true,
    "contratoId": 0,
    "professor": "Prof. João",
    "turma": "Turma 10"
  }
]
```

### Campos Obrigatórios
- `id`: Identificador único da aula
- `data`: Data em formato YYYY-MM-DD
- `horaInicio`: Hora de início em formato HH:mm
- `horaFim`: Hora de término em formato HH:mm
- `status`: Status da aula (ex: "AGENDADA")
- `contratoId`: ID do contrato associado

### Campos Opcionais (para exibição)
- `professor`: Nome do professor
- `turma`: Nome da turma
- `presenca`: Booleano indicando presença

## Integração com Backend

A agenda consulta `GET /aulas` com o período da semana. Quando uma aula de turma
vem sem o campo `professor`, consulta `GET /turmas` e resolve o nome pelo
`turmaId`, usando `nomeProfessor`. O nome resolvido é usado nos blocos, filtros
e detalhes. A consulta adicional não ocorre quando os nomes já estão presentes.
Se o professor não for identificado, o bloco da turma omite o trecho
`· Prof. NOME_PROFESSOR`, mantendo o nome da turma e a quantidade de alunos.
Falhas na requisição de turmas continuam sendo exibidas como erro de carregamento.

## Cálculo de Altura dos Eventos

A altura dos eventos é calculada proporcionalmente:

- **Unidade base**: 60px por hora
- **Cálculo**: `altura = (duração em minutos / 60) * 60px`

Exemplos:
- Evento de 1 hora (08:00 - 09:00) = 60px
- Evento de 2 horas (08:00 - 10:00) = 120px
- Evento de 30 minutos (08:00 - 08:30) = 30px (mínimo: 40px)

## Remarcação

O campo Nova data é somente leitura e acompanha o dia selecionado na grade,
na mesma semana (segunda a domingo) da aula original. Apenas um horário pode
ser selecionado. O envio fecha o formulário imediatamente e bloqueia novos envios
até a conclusão. Em caso de erro, o formulário reabre preservando data, horário
selecionado e motivo para permitir uma nova tentativa.

## Detecção de Conflitos

Quando dois eventos se sobrepõem:
1. O sistema detecta o conflito comparando `horaInicio` e `horaFim`
2. Os eventos são posicionados lado a lado
3. A largura é automaticamente ajustada para acomodar múltiplos eventos

## Cores e Estilo

- **Aula individual**: `Individual · Prof. NOME_PROFESSOR`, seguido de `Aluno(a) NOME_ALUNO` na segunda linha.
- **Aula em turma**: `NOME_TURMA · Prof. NOME_PROFESSOR`, seguido da quantidade de alunos na segunda linha.
- **Mais de uma aula no mesmo horário**: o bloco fechado mostra apenas `QTD_DE_AULAS aulas`; ao expandir, cada aula segue o formato correspondente acima.
- **Aulas canceladas**: mantêm a aparência atenuada e riscada, com indicação de cancelamento ao passar o mouse e nos detalhes.

- **Background**: Gradiente azul escuro (#0f1f3f a #1a2e4a)
- **Eventos**: Gradiente azul (#2d5a7a a #1f3f5a)
- **Fonte**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Responsividade**: Adapta-se a diferentes tamanhos de tela

## Como Usar

1. A rota `/aulas` é acessível sem login
2. A página carrega automaticamente os dados de aulas
3. Os eventos são renderizados em tempo real
4. Clicar no botão "Editar" de um evento (ainda precisa de implementação)

## Dados de Teste

O componente inclui dados de exemplo para teste:

- **Quarta (08/07)**: 2 eventos (08:00-10:00 e 10:00-11:00)
- **Quinta (09/07)**: 1 evento (09:00-11:00)
- **Sexta (10/07)**: 1 evento (15:00-17:00)

## Próximas Melhorias

- [ ] Implementar funcionalidade de filtros
- [ ] Adicionar modal para editar/criar aulas
- [ ] Navegação de semanas (próxima/anterior)
- [ ] Integração real com API backend
- [ ] Status visual diferente por status da aula
- [ ] Cores diferentes por professor/turma
