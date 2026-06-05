# Academia RB — TODO

## Base de Dados & Backend
- [x] Schema: tabelas trails, courses, lessons, questions, quizAttempts, lessonProgress, certificates
- [x] Migração db:push executada com sucesso
- [x] Helpers db.ts para todas as entidades
- [x] Router tRPC: trails (listar, criar, editar, apagar, seed 8 trilhas)
- [x] Router tRPC: courses (listar por trilha, criar, editar, apagar)
- [x] Router tRPC: lessons (listar por curso, criar, editar, apagar, marcar concluída)
- [x] Router tRPC: questions (listar por trilha, criar, editar, apagar)
- [x] Router tRPC: quiz (iniciar tentativa, submeter respostas, regra 90%, limite 1/dia)
- [x] Router tRPC: progress (progresso por trilha, geral/overview)
- [x] Router tRPC: certificates (emitir, listar por aluno, verificar por código)
- [x] Router tRPC: admin (seed inicial das 8 trilhas, listar alunos, listar certificados)

## Frontend — Público
- [x] Landing page com hero, métricas e cards das 8 trilhas
- [x] Botão Entrar com fluxo Manus OAuth
- [x] Tema dark tech com variáveis CSS OKLCH

## Frontend — Área do Aluno
- [x] Dashboard com progresso geral, trilhas em andamento e certificados
- [x] Página de trilha com lista de cursos e aulas
- [x] Marcação de aula como concluída (apostila / videoaula)
- [x] Página de aula (LessonPage) com apostila markdown e videoaula embed
- [x] Página de quiz com 15 questões e submissão
- [x] Resultado do quiz com feedback de aprovação/reprovação
- [x] Página de perfil com histórico de avaliações e certificados
- [x] Visualização de certificado digital com verificação pública

## Frontend — Painel Administrativo
- [x] Rota /admin protegida por role=admin
- [x] AdminLayout com sidebar de navegação
- [x] Gestão de trilhas (listar, criar, editar, apagar, seed 8 trilhas)
- [x] Gestão de cursos por trilha (listar, criar, editar, apagar)
- [x] Gestão de aulas por curso (listar, criar, editar, apagar)
- [x] Gestão de questões por trilha (listar, criar, editar, apagar)
- [x] Visão geral de alunos e certificados emitidos

## Qualidade
- [x] Testes Vitest para quiz (regra 90%, limite diário, elegibilidade certificado) — 12 testes passando
- [x] Checkpoint final guardado — versão a1c13e0c

## Melhorias v2
- [x] Certificado: guardar studentName no schema e no endpoint issue
- [x] Certificado: redesenhar como página web profissional com nome do titular visível
- [x] Navegação entre aulas: endpoints previousLesson e nextLesson no backend
- [x] Navegação entre aulas: botões Anterior/Próxima na LessonPage
- [x] Notificações: notifyOwner ao completar aula e ao emitir certificado
- [ ] Domínio próprio: configurar academia.rbseguranca.com.br no painel (requer ação manual no painel Settings → Domains)

## Identidade Visual v3
- [x] Logo da empresa (leão com escudo) em todos os headers (Home, Dashboard, TrailPage, LessonPage, QuizPage, ProfilePage, AdminLayout)
- [x] Paleta de cores dourada premium (OKLCH) com fundo azul-marinho escuro
- [x] Fonte Plus Jakarta Sans para títulos e Inter para corpo
- [x] Favicon do logo no browser
- [x] Scrollbar personalizada com acento dourado
- [x] Animações suaves nos cards (hover translate)
- [x] Checkpoint v3 guardado — versão 286f62d9
