# Recuperação de senha

## Publicação

1. Manter as variáveis existentes `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
2. Configurar `NEXT_PUBLIC_SITE_URL` quando o domínio de produção mudar. O padrão é `https://lista-de-casamento-smoky.vercel.app`.
3. No Supabase, Authentication > URL Configuration, confirmar o Site URL de produção e autorizar exatamente `https://lista-de-casamento-smoky.vercel.app/auth/recuperar` nos Redirect URLs.
4. Usar o modelo padrão de recuperação com `{{ .ConfirmationURL }}`. O servidor inicia PKCE e o callback troca o código por sessão usando o cookie do navegador que solicitou a recuperação.
5. Publicar somente após autorização do responsável.

## Fluxo

- `/login`: link “Esqueci minha senha”. Falhas do serviço de login não são apresentadas como senha incorreta.
- `/recuperar-senha`: solicita o e-mail sem revelar se há cadastro. O Supabase aplica seus limites de envio.
- O titular abre o link no mesmo navegador em que o solicitou.
- `/auth/recuperar`: troca um código PKCE válido por sessão; link ausente, inválido ou reutilizado volta à solicitação. A página seguinte valida a identidade e a autorização administrativa.
- `/redefinir-senha`: exige usuário validado no Auth e autorização administrativa. Se houver fator MFA verificado, exige AAL2 antes de alterar a senha.
- Após a alteração, solicita encerramento global das sessões e retorna ao login. Tokens de acesso já emitidos ainda obedecem à própria validade.

## Validação pendente em produção

A configuração dos Redirect URLs, a entrega do e-mail e o fluxo do titular (link, MFA, senha escolhida e novo login) devem ser verificados após a publicação. Não modificar a senha nem o MFA do titular para testar.
