# Domínio zavita.online

Atualização de 05/10/2026.

## Resultado solicitado

- `https://zavita.online/`: preservar o Zavita CV Studio existente, incluindo páginas, arquivos, login e painel.
- `https://zavita.online/casamento`: servir o casamento pela Vercel.
- Manter o projeto antigo no Lovable e o casamento no GitHub, Supabase e Vercel.
- Não excluir projetos, arquivos, dados ou registros de domínio.

**A integração ainda não está concluída. Não substituir o registro A apenas porque a Vercel verificou a associação do domínio.** O projeto do casamento hoje redireciona a raiz para `/casamento`; apontar o domínio para ele nesse estado interromperia o acesso normal ao Zavita antigo.

## Identificação confirmada

A conexão Lovable correta é a conta JOTAVE. A consulta anterior pela outra conta não tinha acesso ao projeto.

| Item | Valor |
| --- | --- |
| Projeto antigo | Zavita CV Studio |
| ID Lovable | aa4d3412-c26e-4068-a870-fc77cc20c701 |
| Editor | https://lovable.dev/projects/aa4d3412-c26e-4068-a870-fc77cc20c701 |
| Origem publicada, informada pelo Lovable | https://zavita-curriculo-elegante.lovable.app |
| Domínio principal, informado pelo Lovable | zavita.online, ativo |
| Domínio adicional, informado pelo Lovable | www.zavita.online, com redirecionamento para a raiz |
| Casamento na Vercel | https://lista-de-casamento-smoky.vercel.app/casamento |
| Repositório do casamento | jotavec/listaDeCasamento |

A confirmação do Lovable foi uma consulta em modo de planejamento, somente leitura. Não foi solicitado editar ou publicar o projeto antigo. A consulta HTTP independente às origens não pôde ser concluída neste ambiente; estes dados de domínio vêm do painel interno do Lovable, não de um teste funcional de navegação.

## Rotas que precisam ser preservadas

O código atual do Zavita usa TanStack Start e inclui `/`, `/login`, `/painel`, `/painel/novo`, `/painel/pedidos`, `/modelo/$template`, `/pedido/enviado` e `/$slug`. Também há arquivos públicos de currículos e imagens.

O casamento ainda usa rotas de autenticação, administração e API fora de `/casamento`, incluindo `/login`, `/admin`, `/mfa`, `/auth/recuperar` e `/api/rsvp/*`. Esses caminhos não foram migrados nesta consulta. O login público não aparece na página do casamento; autorização de administrador e MFA continuam obrigatórios.

Antes de compartilhar o domínio, é necessário isolar as rotas, recursos e cookies do casamento, preservando a recuperação de senha já configurada. Em particular, `/login` deve continuar pertencendo ao Zavita antigo no domínio compartilhado.

## Encaminhamento e redirecionamentos

DNS escolhe o servidor do domínio inteiro, não o caminho `/casamento`. A separação depende de um proxy com regras por caminho.

Uma possibilidade a validar é usar a Vercel como entrada: atender o casamento e encaminhar as demais rotas para a origem publicada do Lovable. Isso ainda não está configurado.

Há um requisito anterior ao proxy: o Lovable informa `zavita.online` como domínio principal. Segundo sua documentação, os demais domínios redirecionam para o principal. Encaminhar solicitações à origem `.lovable.app` sem verificar esse comportamento pode criar um ciclo de redirecionamentos. É necessário confirmar a configuração de proxy/domínio principal e testar raiz, páginas de currículo, login, painel e arquivos antes de qualquer troca de DNS.

Referências:
- https://docs.lovable.dev/features/custom-domain
- https://vercel.com/docs/routing/rewrites

## Estado da Vercel e do DNS

O domínio `zavita.online` está associado ao projeto `lista-de-casamento` na Vercel. A API informa `verified: true`; isso confirma a associação, não que DNS e HTTPS estejam prontos. Em 04/10 o painel exibia **Invalid Configuration**. Não houve nova verificação funcional do DNS em 05/10.

O valor A `216.198.79.1` foi indicado pelo painel Vercel em 04/10. É apenas uma referência do diagnóstico anterior, **não uma instrução para substituir o registro atual**. A exigência deve ser consultada novamente quando o encaminhamento estiver testado.

Não foram alterados registros DNS, nameservers, e-mail ou renovação na Hostinger. O plugin disponível oferece operações do AI Builder, não DNS. O painel restringe login pelo navegador em nuvem, impedindo concluir a configuração por esse caminho.

## Autenticação e validação pendentes

A configuração de produção de `NEXT_PUBLIC_SITE_URL` e as URLs de recuperação do Supabase ainda usam o endereço Vercel existente. Devem ser ajustadas em conjunto com as novas rotas, somente quando o destino estiver validado e com HTTPS funcional. Preservar os links de recuperação já enviados.

Sequência pendente:
1. Preparar e testar o isolamento das rotas e cookies do casamento em uma versão de prévia.
2. Confirmar uma origem Lovable acessível sem redirecionamento circular e testar o encaminhamento do Zavita.
3. Concluir DNS e HTTPS por uma integração autorizada que disponibilize essa operação.
4. Validar os dois sites, suas rotas privadas, sessões, arquivos e recuperação de senha antes de concluir a mudança.

Nenhum código funcional, conteúdo do Zavita ou dado de banco foi alterado nesta consulta. A configuração atual deve ser preservada até que as etapas acima possam ser validadas.
