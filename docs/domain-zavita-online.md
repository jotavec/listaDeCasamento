# Domínio zavita.online

Atualização de 04/10/2026.

Endereço solicitado: `https://zavita.online/casamento`.

O domínio `zavita.online` foi adicionado ao projeto `lista-de-casamento` na Vercel, na conta do proprietário do projeto. A associação está verificada pela API, mas o painel exibe **Invalid Configuration** para o DNS. Verificação de associação não significa DNS resolvendo nem HTTPS pronto.

Registro exigido pela Vercel, consultado no painel deste projeto:

| Tipo | Nome | Destino |
| --- | --- | --- |
| A | @ | 216.198.79.1 |

Não foram alterados registros DNS, nameservers, e-mail ou renovação na Hostinger. O painel exigiu login e a Hostinger restringe login pelo navegador em nuvem; a conexão disponível não oferece operações de DNS. Não houve tentativa de contornar essa restrição.

A configuração de produção de `NEXT_PUBLIC_SITE_URL` e as URLs de recuperação do Supabase ainda usam o endereço Vercel existente. Devem ser atualizadas em conjunto somente depois que o domínio estiver resolvendo corretamente e com HTTPS válido. Alterar a URL de recuperação antes disso interromperia o fluxo de senha.

O site segue disponível em https://lista-de-casamento-smoky.vercel.app/casamento.

A inclusão de `/casamento` é feita na aplicação; o DNS não recebe esse caminho. O login não aparece na página pública e segue separado em `/login`, protegido pelo fluxo de autenticação e MFA já existente.
