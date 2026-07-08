# Tela de Agenda 📅

## Descrição

A tela de agenda foi criada com comportamento similar ao Google Calendar, exibindo aulas em uma grade com horários de 7:00 até 20:00 e dias da semana de segunda a sábado.

## Características ✨

- ✅ **Grid de horários**: Exibe 6 dias da semana (Segunda a Sábado) com horas de 7:00 a 20:00
- ✅ **Eventos proporcionais**: A altura do evento é calculada automaticamente baseada na duração (horaFim - horaInicio)
- ✅ **Detecção de conflitos**: Se dois eventos se sobrepõem no mesmo dia, eles são posicionados lado a lado
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

Para conectar com o backend, descomente a seção no arquivo `Agenda.jsx`:

```javascript
// Atualmente está usando dados mockados, descomente para usar API real:
// const response = await axios.get('/aulas');
// setAulas(response.data);
```

O componente está configurado para fazer uma requisição GET para `/aulas` que retorna um array de aulas.

## Cálculo de Altura dos Eventos

A altura dos eventos é calculada proporcionalmente:

- **Unidade base**: 60px por hora
- **Cálculo**: `altura = (duração em minutos / 60) * 60px`

Exemplos:
- Evento de 1 hora (08:00 - 09:00) = 60px
- Evento de 2 horas (08:00 - 10:00) = 120px
- Evento de 30 minutos (08:00 - 08:30) = 30px (mínimo: 40px)

## Detecção de Conflitos

Quando dois eventos se sobrepõem:
1. O sistema detecta o conflito comparando `horaInicio` e `horaFim`
2. Os eventos são posicionados lado a lado
3. A largura é automaticamente ajustada para acomodar múltiplos eventos

## Cores e Estilo

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
