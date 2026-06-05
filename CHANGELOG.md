# Changelog — Academia RB Segurança Eletrônica

Todas as alterações relevantes do projeto estão documentadas neste ficheiro.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [v3] — 2026-06-05 — Identidade Visual Premium

### Adicionado
- **Logo da empresa** (leão com escudo) exibido ao lado de "Academia RB" em **todos os cabeçalhos** da plataforma: Landing Page, Dashboard, Trilha, Aula, Quiz, Perfil e Painel Administrativo
- **Favicon** personalizado com o logo da empresa na aba do browser
- **Fonte Plus Jakarta Sans** para títulos e headings (via Google Fonts), mantendo Inter para corpo de texto
- **Scrollbar personalizada** com acento dourado ao passar o cursor
- **Animações suaves** nos cards (elevação ao hover com `translate-y`)
- Subtítulo "SEGURANÇA ELETRÔNICA" abaixo do nome nos cabeçalhos

### Alterado
- **Paleta de cores principal**: migrada de azul (`oklch 250`) para **dourado premium** (`oklch(0.76 0.14 80)`) — combina com o escudo do logo
- Fundo mantido em azul-marinho escuro profissional para contraste elegante
- Botões primários ("Entrar", "Começar Agora") com brilho dourado (`glow-primary`)
- Bordas e anéis de foco atualizados para o dourado
- Sidebar do painel admin com logo e label "Painel Admin" em dourado
- Gradiente hero com brilho dourado suave no centro da página

---

## [v2] — 2026-06-05 — Certificados, Navegação e Notificações

### Adicionado
- **Certificado digital com nome do titular**: o nome do aluno e o nome da trilha são agora guardados permanentemente na base de dados no momento da emissão
- **Página de certificado redesenhada** como página web profissional com:
  - Nome do titular em destaque
  - Código único de verificação
  - Botões de Compartilhar, Copiar link e Imprimir/PDF
  - URL pública verificável: `/certificado/CÓDIGO`
- **Navegação entre aulas**: botões "Anterior" e "Próxima" na página de aula, tanto no cabeçalho como no rodapé, com título da aula adjacente visível
- **Notificações automáticas ao owner** (via `notifyOwner`) sempre que:
  - Um aluno conclui uma aula
  - Um certificado é emitido

### Alterado
- Schema da tabela `certificates`: adicionados campos `studentName` e `trailName`
- Endpoint `certificates.issue`: passa a guardar nome do aluno e da trilha
- Endpoint `lessons.adjacent`: novo endpoint para obter aula anterior/próxima

---

## [v1] — 2026-06-05 — Plataforma Completa (Lançamento)

### Adicionado

#### Base de Dados (MySQL / TiDB)
- Tabela `trails` — 8 trilhas de aprendizagem
- Tabela `courses` — cursos por trilha
- Tabela `lessons` — aulas com suporte a apostila (Markdown) e videoaula (URL)
- Tabela `questions` — questões de avaliação por trilha
- Tabela `quizAttempts` — tentativas de quiz com respostas e pontuação
- Tabela `lessonProgress` — progresso de conclusão de aulas por aluno
- Tabela `certificates` — certificados digitais com código único

#### Backend (tRPC + Express)
- Router `trails`: listar (público/admin), criar, editar, apagar, seed das 8 trilhas padrão
- Router `courses`: listar por trilha, criar, editar, apagar
- Router `lessons`: listar por curso, criar, editar, apagar, marcar como concluída
- Router `questions`: listar por trilha, criar, editar, apagar
- Router `quiz`: submeter tentativa com **regra de 90% de aprovação** e **limite de 1 tentativa por dia**
- Router `progress`: progresso por trilha e overview geral do aluno
- Router `certificates`: emitir (com validação de conclusão completa), listar por aluno, verificar por código
- Router `admin`: seed inicial, listar alunos, listar certificados emitidos

#### Frontend — Área Pública
- **Landing page** com hero, métricas (8 trilhas, 100+ horas, acesso vitalício), cards das 8 trilhas e CTA
- Autenticação via **Manus OAuth** (sem senha, login seguro)

#### Frontend — Área do Aluno (autenticado)
- **Dashboard** com progresso geral, trilhas em andamento e certificados obtidos
- **Página de trilha** com lista de cursos, aulas e progresso por curso
- **Página de aula** com renderização de apostila em Markdown e embed de videoaula (YouTube/direto)
- Marcação de aula como concluída com atualização de progresso em tempo real
- **Quiz** com 15 questões, submissão única por dia, resultado com percentagem e feedback
- **Página de perfil** com histórico de avaliações e certificados
- **Certificado digital** com página web verificável publicamente

#### Frontend — Painel Administrativo (role=admin)
- Rota `/admin` protegida por `role=admin`
- **Gestão de trilhas**: listar, criar, editar, apagar, seed das 8 trilhas padrão com 1 clique
- **Gestão de cursos**: listar por trilha, criar, editar, apagar
- **Gestão de aulas**: listar por curso, criar, editar, apagar (suporte a apostila e videoaula)
- **Gestão de questões**: listar por trilha, criar, editar, apagar (alerta quando < 15 questões)
- **Visão geral de alunos**: lista de utilizadores com contagem de certificados

#### Qualidade
- 12 testes Vitest cobrindo:
  - Regra de aprovação mínima de 90% (14/15 aprovado, 13/15 reprovado)
  - Limite de 1 tentativa de quiz por dia
  - Elegibilidade para emissão de certificado
  - Prevenção de duplicação de certificados

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

## Regras de Negócio Não Negociáveis

| Regra | Detalhe |
|---|---|
| Aprovação mínima no quiz | 90% (mínimo 14 de 15 questões corretas) |
| Tentativas de quiz | Máximo 1 por dia por trilha |
| Emissão de certificado | Exige conclusão de **todas** as aulas + aprovação em **todas** as avaliações da trilha |
| Autenticação | Exclusivamente via Manus OAuth |

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Tailwind CSS 4, shadcn/ui, Wouter |
| Backend | Express 4, tRPC 11, Zod |
| Base de dados | MySQL/TiDB via Drizzle ORM |
| Autenticação | Manus OAuth 2.0 |
| Testes | Vitest |
| Tipagem | TypeScript 5.9 end-to-end |
