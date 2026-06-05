# Como Rodar o Projeto Localmente

Este guia explica como clonar e executar a **Academia RB Segurança Eletrônica** no seu computador.

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

| Ferramenta | Versão mínima | Download |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| pnpm | 10+ | `npm install -g pnpm` |
| MySQL | 8.0+ | https://dev.mysql.com/downloads/ |
| Git | qualquer | https://git-scm.com |

---

## 1. Clonar o Repositório

```bash
git clone https://github.com/Kauast/academia-rb-seguranca-eletronica.git
cd academia-rb-seguranca-eletronica
```

---

## 2. Instalar Dependências

```bash
pnpm install
```

---

## 3. Configurar a Base de Dados

Crie um banco de dados MySQL vazio:

```sql
CREATE DATABASE academia_rb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 4. Configurar as Variáveis de Ambiente

Crie um ficheiro `.env` na raiz do projeto com o seguinte conteúdo (substitua os valores):

```env
# Base de Dados
DATABASE_URL=mysql://root:SUA_SENHA@localhost:3306/academia_rb

# Autenticação Manus OAuth
VITE_APP_ID=SEU_APP_ID
JWT_SECRET=uma-chave-secreta-longa-e-aleatoria
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im

# Owner (admin principal)
OWNER_OPEN_ID=SEU_OPEN_ID
OWNER_NAME=Seu Nome

# APIs Manus (para notificações — pode deixar vazio em dev)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

> **Onde obter o `VITE_APP_ID`?**
> Acesse o painel do projeto em https://manus.im → Settings → App ID.

---

## 5. Criar as Tabelas na Base de Dados

```bash
pnpm db:push
```

Este comando executa as migrações do Drizzle ORM e cria todas as tabelas necessárias.

---

## 6. Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

O servidor inicia em **http://localhost:3000** (ou na próxima porta disponível).

---

## 7. Primeiro Acesso como Administrador

Após fazer login pela primeira vez:

1. Acesse o banco de dados MySQL e execute:
   ```sql
   UPDATE users SET role = 'admin' WHERE openId = 'SEU_OPEN_ID';
   ```
2. Acesse `/admin/trilhas` no browser
3. Clique em **"Criar 8 trilhas padrão"** para popular a plataforma

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `pnpm dev` | Inicia o servidor de desenvolvimento (frontend + backend) |
| `pnpm build` | Gera o build de produção |
| `pnpm start` | Inicia o servidor em modo produção (requer build) |
| `pnpm test` | Executa os testes Vitest |
| `pnpm db:push` | Aplica as migrações da base de dados |
| `pnpm check` | Verifica erros TypeScript |

---

## Estrutura do Projeto

```
academia-rb-seguranca-eletronica/
├── client/                  # Frontend React
│   ├── src/
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── components/      # Componentes reutilizáveis (shadcn/ui)
│   │   └── index.css        # Tema visual (paleta dourada)
│   └── index.html           # HTML principal com fontes Google
├── server/                  # Backend Express + tRPC
│   ├── routers.ts           # Todos os endpoints da API
│   ├── db.ts                # Helpers de base de dados
│   └── _core/               # Infraestrutura (OAuth, contexto, env)
├── drizzle/                 # Schema e migrações da base de dados
│   └── schema.ts            # Definição de todas as tabelas
├── shared/                  # Tipos e constantes partilhados
├── CHANGELOG.md             # Histórico de versões
└── README-LOCAL.md          # Este ficheiro
```

---

## Variáveis de Ambiente — Referência Completa

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | String de conexão MySQL |
| `VITE_APP_ID` | Sim | ID da aplicação Manus OAuth |
| `JWT_SECRET` | Sim | Chave para assinar cookies de sessão |
| `OAUTH_SERVER_URL` | Sim | URL do servidor OAuth Manus |
| `VITE_OAUTH_PORTAL_URL` | Sim | URL do portal de login Manus |
| `OWNER_OPEN_ID` | Sim | OpenID do utilizador owner (admin) |
| `OWNER_NAME` | Não | Nome do owner |
| `BUILT_IN_FORGE_API_URL` | Não | URL das APIs Manus (notificações) |
| `BUILT_IN_FORGE_API_KEY` | Não | Chave das APIs Manus (server-side) |
| `VITE_FRONTEND_FORGE_API_KEY` | Não | Chave das APIs Manus (frontend) |
| `VITE_FRONTEND_FORGE_API_URL` | Não | URL das APIs Manus (frontend) |
| `VITE_ANALYTICS_ENDPOINT` | Não | Endpoint de analytics (Umami) |
| `VITE_ANALYTICS_WEBSITE_ID` | Não | ID do site no analytics |

---

## Solução de Problemas

**Erro: `DATABASE_URL is required`**
Verifique se o ficheiro `.env` existe na raiz do projeto e se `DATABASE_URL` está preenchido.

**Erro de conexão com o banco de dados**
Confirme que o MySQL está a correr e que as credenciais estão corretas.

**Erro: `Cannot find module`**
Execute `pnpm install` novamente para garantir que todas as dependências estão instaladas.

**Porta 3000 em uso**
O servidor detecta automaticamente a próxima porta disponível (3001, 3002, etc.).

**Login não funciona localmente**
O Manus OAuth requer que o `VITE_APP_ID` esteja configurado e que o domínio de callback esteja registado no painel Manus.
