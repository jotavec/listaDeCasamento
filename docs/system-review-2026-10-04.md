# Revisão do sistema — 04/10/2026

## Resultado e publicação

A aplicação está hospedada na Vercel. `/casamento` passa a ser a entrada pública; a raiz redireciona para esse caminho. O monograma volta ao topo da página e não abre mais o login. Login e painel continuam acessíveis diretamente, protegidos por autenticação, autorização explícita e MFA. Rotas de autenticação, administração e API recebem `X-Robots-Tag: noindex, nofollow, noarchive`. Isso reduz indexação; não torna o endereço secreto nem substitui autorização.

A divisão de responsabilidades está no README: GitHub para código, Vercel para execução, Supabase para banco/autenticação e Hostinger para domínio/DNS. A integração da Hostinger disponível nesta sessão oferece o construtor de sites, não operações de domínio/DNS. Sua listagem falhou com `This app tool requires a non-empty string link_id argument`, após a tentativa inicial de autenticação. Não foi possível listar os domínios da Hostinger. Nenhum DNS, domínio, plano ou site da Hostinger foi alterado ou removido.

## Alterações aplicadas

- Next.js e eslint-config-next atualizados de 16.2.6 para 16.3.8. Dependências transitivas atualizadas sem downgrade forçado.
- Cabeçalhos contra incorporação indevida em frames e detecção incorreta de conteúdo; restrições de câmera, microfone e geolocalização. Política CSP limitada a `frame-ancestors`, `base-uri` e `object-src`, sem afirmar cobertura completa contra XSS.
- Respostas de API e callbacks de autenticação sem cache compartilhado; páginas de autenticação não enviam Referer.
- APIs RSVP exigem JSON e origem correspondente ao site, limitam o corpo a 64 KiB mesmo sem Content-Length e rejeitam valores nulos, tipos inválidos e cookies malformados sem erro 500.
- Encerramento de sessão rejeita submissões de outros sites.
- Cliente anônimo do Supabase compartilhado pelas três rotas RSVP, sem herdar sessão administrativa.
- Dashboard valida autorização e MFA antes de buscar dados, além das proteções do layout e RLS.
- Busca de convidados cancela requisições anteriores, ignora respostas obsoletas e distingue falha de serviço de ausência de resultados.
- Banco: validação de nomes, idades, arrays e presença nula; busca trata `%` e `_` como texto; confirmação bloqueia a linha do convite durante a transação para evitar alterações concorrentes inconsistentes.
- Índice em `invitations.createdby` adicionado. O aviso de chave estrangeira sem índice desapareceu.
- Migração e teste SQL versionados. Arquivo gerado `*.tsbuildinfo` passa a ser ignorado pelo Git.

## Controles verificados e pendências de segurança

RLS está habilitada nas tabelas `invitations`, `companions`, `children` e `private.authorized_users`. As três tabelas públicas permitem acesso direto somente ao papel authenticated, condicionado a `can_access_sensitive_data()`, que verifica autorização e nível MFA `aal2`. O papel anônimo não possui SELECT direto nas tabelas. As funções SECURITY DEFINER verificadas fixam `search_path = ''`.

**Prioridade alta — RSVP ainda identifica convidados por nome.** As funções públicas de sugestão e busca são intencionais no fluxo atual, mas permitem descobrir nomes e obter a credencial do convite a partir de um nome conhecido. Portanto, alguém pode confirmar em nome de outro convidado. Os controles HTTP não impedem chamadas diretas às funções públicas do Supabase. Para privacidade e identificação mais fortes, a próxima alteração deve trocar esse fluxo por link/código individual de convite, retirar a enumeração pública e definir proteção contra abuso no ponto que realmente dá acesso aos dados. Não foi feita essa mudança de produto silenciosamente. A tabela continha zero convites na revisão.

**Proteção contra senhas vazadas desativada no Supabase.** Não foi alterada a configuração de Auth pela integração. Verificar disponibilidade no plano e ativar no painel, sem contratar upgrade automaticamente. [Orientação oficial](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

**Domínio e recuperação de senha.** O código não usa localhost como URL de recuperação em produção. As referências restantes a localhost são de desenvolvimento. A configuração atual de Site URL/Redirect URLs no painel Auth não pôde ser relida nesta revisão; deve ser confirmada quando o domínio definitivo for definido. A regra de oito caracteres da aplicação foi preservada; a configuração correspondente no Auth precisa continuar compatível.

**Dependências de desenvolvimento.** A auditoria completa ainda registra cinco entradas de severidade alta na cadeia `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`, originadas no aviso de exaustão da pilha do braces. O audit sugere downgrade incompatível para Next 14; isso não foi aplicado. Não é uma dependência executada pelo site em produção. [Advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

O aviso de RLS sem policies em `private.authorized_users` é consistente com a intenção de impedir acesso direto: o schema e a tabela não dão permissões a anon/authenticated, e a consulta é feita pela função de autorização. Não criar uma policy permissiva apenas para eliminar esse aviso. Os avisos de execução de SECURITY DEFINER precisam ser interpretados por função: os dois verificadores administrativos são necessários; as três funções públicas RSVP estão relacionadas à pendência descrita acima. [Orientação oficial](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable).

## Arquivos sem referência encontrados — preservados

| Arquivo | Evidência | Tamanho aproximado |
| --- | --- | --- |
| `app/admin/adminShell.module.css` | Nenhum import; o layout usa `adminLayout.module.css` | 1 KB |
| `components/RsvpSection.module.css` | Nenhum import; o componente usa `RsvpModal.module.css` | 7,4 KB |
| `public/monograma-jj.png` | Monograma antigo com fundo; nenhum componente atual aponta para ele | 251 KB |
| `public/monograma-jj-monocromatico.png` | Tentativa local anterior, sem referência e fora da publicação | 401 KB |

O arquivo em uso é `public/monograma-jj-transparente.png`, fornecido pelo usuário. CSS sem import não entra no bundle; imagens sem referência não são baixadas pela página. Excluir esses itens no futuro reduziria resíduos do projeto, mas não deve ser apresentado como grande ganho de velocidade de carregamento.

Os índices `invitationsnameindex`, `invitationsstatusindex`, `invitationssideindex` e o recém-criado `invitations_createdby_idx` aparecem sem uso nas estatísticas. Com a tabela vazia e um índice recém-criado, isso não justifica removê-los. [Orientação oficial](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

Presentes, financeiro e relatórios administrativos ainda são módulos de apresentação, sem a implementação completa. Não são código morto: estão nas rotas e na navegação. Os scripts SQL antigos também não foram classificados como descartáveis apenas por não serem importados pelo JavaScript.

## Verificação

- Build de produção e TypeScript aprovados com Next.js 16.3.8. A publicação usa `next build --webpack`: o Turbopack falhou no carregador de fontes Google no ambiente Vercel após a atualização. As mesmas fontes e a versão corrigida do framework foram preservadas.
- ESLint: zero erros; aviso anterior de `<img>` no QR code do MFA permanece.
- `npm audit --omit=dev`: zero vulnerabilidades conhecidas na data da consulta.
- Teste SQL: busca normalizada, curingas tratados literalmente, rejeição de token incorreto/dados nulos/capacidade excedida, confirmação e recusa válidas. Todos os dados sintéticos foram revertidos na mesma transação.
- 29 verificações HTTP aprovadas, versionadas em `scripts/check-security.py`: página pública, ausência de link de login, redirecionamento, cabeçalhos, bloqueio anônimo do painel e entradas inválidas das APIs.

Esta revisão cobre código, dependências, rotas e controles do projeto acessível. Não certifica ausência de falhas nem conclui a configuração de DNS, políticas da organização GitHub, backups ou opções de Auth indisponíveis à conexão.
