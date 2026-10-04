# Lista de Casamento

Site de Jéssica e João Vítor, desenvolvido com Next.js, React e TypeScript.

## Produção e responsabilidades

| Serviço | Responsabilidade | Situação |
| --- | --- | --- |
| GitHub | Código, histórico e revisão | `jotavec/listaDeCasamento`, branch `main` |
| Vercel | Aplicação Next.js, HTTPS e publicação a cada commit | Projeto `lista-de-casamento` |
| Supabase | Autenticação, MFA, banco e permissões | Projeto `listaDeCasamento` |
| Hostinger | Domínio e DNS apontando para a Vercel | Domínio e acesso ao DNS ainda pendentes |

Página pública: https://lista-de-casamento-smoky.vercel.app/casamento

A raiz redireciona para `/casamento`. O painel continua em `/admin`, com entrada direta por `/login`; não há atalho administrativo na página pública. Autorização e MFA são obrigatórios para administrar. Não publicar uma segunda cópia da aplicação no construtor da Hostinger.

## Configuração

Copie `.env.example` para `.env.local` e preencha a chave **publicável** do Supabase. Na Vercel, configure as mesmas variáveis no ambiente Production. Nunca coloque chaves `service_role` ou outras credenciais privilegiadas em variáveis `NEXT_PUBLIC_*`.

`NEXT_PUBLIC_SITE_URL` deve conter a origem HTTPS, sem `/casamento`. A recuperação de senha usa `/auth/recuperar` nessa origem. A configuração correspondente no Supabase está descrita em [password-recovery.md](docs/password-recovery.md).

Ao definir o domínio próprio: adicionar o domínio ao projeto Vercel, usar os registros DNS fornecidos pela Vercel na Hostinger, aguardar HTTPS válido, atualizar `NEXT_PUBLIC_SITE_URL` e as URLs de autenticação do Supabase, publicar e testar o fluxo de recuperação. DNS configura nomes de domínio, não o caminho `/casamento`; esse caminho pertence à aplicação.

## Executar localmente

```bash
npm ci
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

## Comandos

- `npm run dev` — inicia o ambiente de desenvolvimento.
- `npm run build` — gera a versão de produção.
- `npm run start` — inicia a versão de produção.
- `npm run lint` — executa a análise estática do código.
- `python scripts/check-security.py` — após o build, verifica rotas, cabeçalhos, bloqueios e validação HTTP em um servidor temporário na porta 3015.

## Estrutura

- `app/` — layout global, estilos e composição da página.
- `components/` — componentes das seções e interações do site.
- `public/` — imagens e ícones públicos.
- `lib/` — autenticação, clientes Supabase e validação de requisições.
- `supabase/migrations/` — alterações novas e versionadas do banco; a migração de validação RSVP de 04/10/2026 já foi aplicada ao projeto.
- `supabase/tests/` — verificações SQL com dados sintéticos e rollback.
- `docs/` — recuperação de senha e [revisão do sistema](docs/system-review-2026-10-04.md).

Os scripts SQL antigos na raiz permanecem como histórico. Não executá-los em lote nem reaplicá-los sobre produção: podem substituir funções por versões antigas. Nenhum arquivo identificado como sem uso foi apagado nesta revisão.
