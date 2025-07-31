# Páginas Externas - TheBakers Vitrine

Este documento descreve as páginas externas criadas para funcionar como vitrine do projeto TheBakers, sem necessidade de autenticação.

## Visão Geral

As páginas externas foram criadas para funcionar em um domínio separado que aponta para o mesmo backend e banco de dados, mas sem autenticação. Elas servem como vitrine pública dos serviços e agendamentos.

## Rotas Disponíveis

### Domínio Principal

- `/external` - Home externa
- `/external/schedule` - Schedule externo

### Domínio Externo (Vitrine)

- `/` - Home externa (rota raiz)
- `/schedule` - Schedule externo

**Nota**: O sistema detecta automaticamente o domínio e usa as rotas apropriadas.

## Estrutura de Arquivos

```
src/
├── components/
│   ├── header.tsx               # Header modificado para suportar páginas externas
│   └── domain-router.tsx        # Router que detecta domínio e renderiza páginas corretas
├── pages/
│   └── external/
│       ├── home/
│       │   └── index.tsx        # Página home externa
│       ├── schedule/
│       │   └── index.tsx        # Página schedule externa
│       └── index.ts             # Exportações
└── services/
    └── api/
        └── external.ts          # APIs externas sem autenticação
```

## APIs Externas

### Configuração

As APIs externas utilizam uma instância do axios separada (`externalApi`) que:

- Não inclui interceptors de autenticação
- Usa a base URL `/external-api`
- Mantém apenas o APP_TOKEN no header

### Endpoints Disponíveis

- `GET /external-api/services` - Lista todos os serviços
- `GET /external-api/services-categories` - Lista todas as categorias
- `GET /external-api/run?date=YYYY-MM-DD` - Lista runs por data

## Diferenças das Páginas Internas

### Home Page

- **Removido**: Verificação de autenticação
- **Removido**: Lógica específica para freelancers
- **Removido**: Nome do usuário logado
- **Mantido**: Todos os carrosséis de serviços
- **Mantido**: Hot Services
- **Mantido**: Organização por categorias

### Schedule Page

- **Removido**: Verificação de autenticação
- **Removido**: Navegação para detalhes da run (double-click)
- **Removido**: Verificação de permissões de freelancer
- **Mantido**: Visualização completa do cronograma
- **Mantido**: Cores dos times
- **Mantido**: Formatação de horários

## Componentes Específicos

### Header Modificado

- Detecta automaticamente quando está em páginas externas ou domínio externo
- Em páginas externas: mostra navegação simplificada (Home, Schedule)
- Em páginas internas: mantém funcionalidade original
- Não redireciona para login em páginas externas
- Mantém o relógio EST em todas as páginas

### DomainRouter

- Detecta automaticamente o domínio atual
- No domínio externo: renderiza páginas externas com rotas limpas (`/`, `/schedule`)
- No domínio principal: renderiza páginas normais com autenticação
- Usa variável de ambiente `VITE_MAIN_DOMAIN` para identificar domínio principal

## Configuração do Backend

Para que as páginas externas funcionem, o backend deve implementar os seguintes endpoints:

```
GET /external-api/services
GET /external-api/services-categories
GET /external-api/run?date=YYYY-MM-DD
```

Estes endpoints devem:

- Não requerer autenticação
- Retornar os mesmos dados das APIs internas
- Usar o mesmo banco de dados
- Incluir apenas dados públicos (sem informações sensíveis)

## Deploy

Para usar em um domínio separado:

1. Configure o domínio para apontar para o mesmo servidor
2. Configure o nginx/apache para servir todas as rotas (o sistema detecta automaticamente)
3. Certifique-se de que as variáveis de ambiente estão configuradas:
   - `VITE_API_BASE_URL`
   - `VITE_APP_TOKEN`
   - `VITE_MAIN_DOMAIN` (domínio principal, ex: "thebakers.work")

### Configuração de Domínio

**Domínio Principal**: `thebakers.work` (ou `www.thebakers.work`)

- Rotas: `/home`, `/schedule`, `/balance`, etc.
- Requer autenticação
- O sistema trata `www.thebakers.work` e `thebakers.work` como o mesmo domínio

**Domínio Externo**: `cornfield.work` (ou `www.cornfield.work`)

- Rotas: `/` (home), `/schedule`
- Sem autenticação
- O sistema trata `www.cornfield.work` e `cornfield.work` como o mesmo domínio

## Segurança

- As páginas externas não têm acesso a dados sensíveis
- Não há funcionalidades de edição ou criação
- Apenas visualização de dados públicos
- APIs externas não requerem token de usuário
