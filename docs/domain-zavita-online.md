# Domínio zavita.online

Atualização de 05/10/2026.

## Organização solicitada

O proprietário informou que excluiu o projeto antigo no Lovable e solicitou seções no mesmo domínio, começando por `/curriculo`. O currículo da Dra. Jéssica já foi copiado para um projeto independente na Vercel. A antiga plataforma de criação de currículos, seus outros perfis e seu painel não fazem parte dessa cópia.

| Caminho | Conteúdo | Projeto Vercel |
| --- | --- | --- |
| `/curriculo` | Perfil profissional da Dra. Jéssica, fotos e currículo PDF | `dra-jessica` |
| `/casamento` | Casamento de Jéssica e João Vitor | `lista-de-casamento` |
| `/` | Redirecionamento existente para `/casamento` | `lista-de-casamento` |

## Encaminhamento

O domínio está associado ao projeto `lista-de-casamento`. Seu `next.config.ts` encaminha `/curriculo` e `/curriculo/*` para `https://dra-jessica-six.vercel.app`, mantendo o caminho e o endereço no navegador.

O projeto `dra-jessica` publica a página em `/curriculo` e todos os seus arquivos sob `/curriculo/`, inclusive os scripts e estilos em `/curriculo/_next`. Isso evita conflito com os arquivos Next.js do casamento. Fotos, prévias, PDF e ícone são locais ao repositório privado `jotavec/dra-jessica`.

Os dois projetos continuam separados no GitHub e na Vercel. Não há encaminhamento ou dependência de execução do Lovable. A página profissional não usa autenticação nem banco.

## Autenticação do casamento

As rotas existentes `/login`, `/admin`, `/mfa`, `/auth/*`, `/api/*`, `/recuperar-senha` e `/redefinir-senha` continuam pertencendo ao casamento. A página pública não mostra um link de login; autorização de administrador e MFA permanecem obrigatórios.

`NEXT_PUBLIC_SITE_URL` e as URLs de recuperação do Supabase continuam usando o endereço Vercel existente. Não foram alteradas nesta reorganização. Uma mudança futura para o domínio deve ocorrer somente depois de DNS e HTTPS funcionais, preservando os links anteriores.

## Situação do domínio

Em 05/10/2026, o painel Vercel ainda apresenta **Invalid Configuration** para `zavita.online`. O registro solicitado pelo painel é A, nome `@`, valor `216.198.79.1`. A API `verified: true` confirma apenas a associação do domínio ao projeto, não a configuração correta de DNS.

A publicação das rotas na Vercel não conclui a ativação do domínio. Os endereços Vercel permitem validar os caminhos enquanto essa etapa permanece pendente.

Não foram alterados registros DNS, nameservers, e-mail ou renovação na Hostinger. O plugin disponível oferece operações do AI Builder, sem operações de DNS. O painel Hostinger restringe login pelo navegador em nuvem; esse acesso não deve ser repetido ou contornado. A etapa de DNS depende de uma integração autorizada que exponha essa operação.

## Validação

Validar `/curriculo`, seus scripts, estilos, fotos, prévias e PDF através do projeto de entrada; confirmar que o endereço permanece no mesmo host. Confirmar que `/casamento` e a proteção das rotas privadas continuam funcionando. Após disponibilização de acesso autorizado ao DNS, verificar o domínio e o HTTPS antes de alterar URLs de autenticação.
