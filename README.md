# Operação Nuvem Literária — LendoMais (Docker + Docker Hub + Render)

Plataforma de catálogo e gerenciamento de livros containerizada com Docker, publicada no Docker Hub e disponibilizada em produção no Render.

---

## Arquitetura de Deploy

| Componente | Stack | Fluxo de Deploy | Variáveis Principais |
| --- | --- | --- | --- |
| **Frontend** | React + Vite + Nginx | `Dockerfile` → Docker Hub → Render (*Existing Image*) | `VITE_API_URL`, `PORT` |
| **Backend API** | Node.js + Express + PostgreSQL | `Dockerfile` → Docker Hub → Render (*Existing Image*) | `DATABASE_URL`, `PORT` |

---

## Entregáveis & Links

- **Docker Hub (Backend):** *(será preenchido após publicação)*
- **Docker Hub (Frontend):** *(será preenchido após publicação)*
- **API Backend (Render):** *(será preenchido após deploy)*
- **Frontend (Render):** *(será preenchido após deploy)*

---

## Maior Desafio Técnico Enfrentado

O principal desafio técnico do deploy em nuvem foi fazer o Frontend em React (Vite) e o Backend em Node.js se comunicarem corretamente no Render utilizando imagens Docker pré-construídas no Docker Hub (*Existing Image*). Como o Vite normalmente embute variáveis `VITE_*` apenas em tempo de build, uma imagem já publicada não enxergaria a variável `VITE_API_URL` configurada depois no painel do Render; para resolver isso, estruturamos um build multi-stage com Nginx e um script de inicialização (`docker-entrypoint.sh`) que injeta `VITE_API_URL` em tempo de execução via `env-config.js`, além de ajustar o Nginx para escutar a porta dinâmica `PORT` do Render e garantir o roteamento SPA (`try_files`). No Backend, foi necessário adaptar a configuração do PostgreSQL para aceitar tanto `DATABASE_URL` com detecção automática de SSL quanto variáveis individuais, mantendo CORS habilitado e a criação automática da tabela `books` na inicialização.

---

## Comandos de Referência (Docker)

```bash
# Build local das imagens
docker build -t SEU_USUARIO/lendomais-backend:latest ./backend
docker build -t SEU_USUARIO/lendomais-frontend:latest ./frontend

# Publicação no Docker Hub
docker push SEU_USUARIO/lendomais-backend:latest
docker push SEU_USUARIO/lendomais-frontend:latest
```
