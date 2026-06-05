# Academia RB Segurança Eletrônica

Plataforma de ensino online para cursos profissionais de segurança eletrônica, organizada em trilhas de aprendizagem com área pública, área do aluno e painel administrativo completo.

---

## Demonstração

Acesse a plataforma em produção: **[rbsecurity-f8wxdqtg.manus.space](https://rbsecurity-f8wxdqtg.manus.space)**

---

## Funcionalidades

### Área Pública
- Landing page com apresentação das 8 trilhas de aprendizagem
- Autenticação segura via Manus OAuth (sem senha)

### Área do Aluno
- Dashboard com progresso geral, trilhas em andamento e certificados conquistados
- Página de trilha com lista de cursos e aulas (apostilas e videoaulas)
- Marcação de aula como concluída com atualização de progresso em tempo real
- Navegação entre aulas com botões Anterior e Próxima
- Sistema de avaliação (quiz) com 15 questões, limite de 1 tentativa por dia e aprovação mínima de 90%
- Certificado digital emitido automaticamente ao concluir todos os cursos e aprovações de uma trilha
- Página de perfil com histórico de avaliações e certificados obtidos

### Painel Administrativo
- Gestão completa de trilhas, cursos, aulas e questões de avaliação
- Seed automático das 8 trilhas padrão com um clique
- Visão geral de alunos e certificados emitidos
- Acesso restrito a usuários com `role = admin`

---

## Trilhas Disponíveis

| Trilha | Slug |
|---|---|
| Alarme Monitorado | `alarme-monitorado` |
| Alarme com IA | `alarme-com-ia` |
| CFTV Analógico | `cftv-analogico` |
| CFTV IP | `cftv-ip` |
| CFTV IP com IA | `cftv-ip-com-ia` |
| Rádio Ponto a Ponto | `radio-ponto-a-ponto` |
| Redes Básico | `redes-basico` |
| Redes Avançado | `redes-avancado` |

---

## Regras de Negócio

| Regra | Detalhe |
|---|---|
| Aprovação mínima no quiz | 90% (mínimo 14 de 15 questões corretas) |
| Tentativas de quiz | Máximo 1 por dia por trilha |
| Emissão de certificado | Exige conclusão de **todas** as aulas + aprovação em **todas** as avaliações da trilha |
| Autenticação | Exclusivamente via Manus OAuth |

---

## Como Rodar Localmente

### Pré-requisitos

| Ferramenta | Versão mínima | Download |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| pnpm | 10+ | `npm install -g pnpm` |
| MySQL | 8.0+ | https://dev.mysql.com/downloads/ |
| Git | qualquer | https://git-scm.com |

### Instalação Rápida

```bash
# 1. Clonar o repositório
git clone https://github.com/Kauast/academia-rb-seguranca-eletronica.git
cd academia-rb-seguranca-eletronica

# 2. Instalar dependências
pnpm install

# 3. Criar o banco de dados MySQL
# Execute no MySQL:
# CREATE DATABASE academia_rb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 4. Criar o ficheiro .env na raiz do projeto (veja a seção abaixo)

# 5. Criar as tabelas na base de dados
pnpm db:push

# 6. Iniciar o servidor de desenvolvimento
pnpm dev
# → Acesse em http://localhost:3000
```

### Instalação Automatizada

Para configurar o ambiente automaticamente, execute o script de instalação:

```bash
# Linux / macOS
chmod +x setup.sh && ./setup.sh

# Windows (PowerShell como Administrador)
.\setup.ps1
```

O script verifica os pré-requisitos, instala dependências, cria o banco de dados e configura o arquivo `.env` de forma interativa.

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

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

# APIs Manus (para notificações — pode deixar vazio em desenvolvimento)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

> **Onde obter o `VITE_APP_ID`?** Acesse o painel do projeto em https://manus.im → Settings → App ID.

### Primeiro Acesso como Administrador

Após fazer login pela primeira vez, promova o seu usuário a admin:

```sql
UPDATE users SET role = 'admin' WHERE openId = 'SEU_OPEN_ID';
```

Em seguida, acesse `/admin/trilhas` e clique em **"Criar 8 trilhas padrão"** para popular a plataforma.

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
├── client/                     # Frontend React
│   ├── src/
│   │   ├── pages/              # Páginas da aplicação
│   │   │   ├── Home.tsx        # Landing page pública
│   │   │   ├── Dashboard.tsx   # Dashboard do aluno
│   │   │   ├── TrailPage.tsx   # Página de trilha
│   │   │   ├── LessonPage.tsx  # Página de aula
│   │   │   ├── QuizPage.tsx    # Sistema de avaliação
│   │   │   ├── ProfilePage.tsx # Perfil do aluno
│   │   │   ├── CertificatePage.tsx # Certificado digital
│   │   │   └── admin/          # Painel administrativo
│   │   ├── components/         # Componentes reutilizáveis (shadcn/ui)
│   │   └── index.css           # Tema visual (paleta dourada premium)
│   └── index.html              # HTML principal com fontes Google
├── server/                     # Backend Express + tRPC
│   ├── routers.ts              # Todos os endpoints da API
│   ├── db.ts                   # Helpers de base de dados
│   └── _core/                  # Infraestrutura (OAuth, contexto, env)
├── drizzle/                    # Schema e migrações da base de dados
│   └── schema.ts               # Definição de todas as tabelas
├── shared/                     # Tipos e constantes partilhados
├── setup.sh                    # Script de instalação (Linux/macOS)
├── setup.ps1                   # Script de instalação (Windows)
├── CHANGELOG.md                # Histórico de versões
└── README-LOCAL.md             # Guia detalhado de instalação local
```

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Tailwind CSS 4, shadcn/ui, Wouter |
| Backend | Express 4, tRPC 11, Zod |
| Base de dados | MySQL/TiDB via Drizzle ORM |
| Autenticação | Manus OAuth 2.0 |
| Testes | Vitest (12 testes) |
| Tipagem | TypeScript 5.9 end-to-end |
| Fontes | Plus Jakarta Sans + Inter (Google Fonts) |

---

## Testes

O projeto possui 12 testes automatizados cobrindo as principais regras de negócio:

```bash
pnpm test
```

Os testes validam:
- Aprovação mínima de 90% no quiz (14/15 aprovado, 13/15 reprovado)
- Limite de 1 tentativa de quiz por dia
- Elegibilidade para emissão de certificado
- Prevenção de duplicação de certificados

---

## Histórico de Versões

Consulte o arquivo [CHANGELOG.md](./CHANGELOG.md) para o histórico completo de alterações.

---

## Licença

Este projeto é de uso privado da **RB Segurança Eletrônica**. Todos os direitos reservados.
