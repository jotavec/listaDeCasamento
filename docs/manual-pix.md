# Pix direto e conferência manual

Em `/admin/financeiro`, um administrador autorizado com MFA cadastra a chave Pix, o nome e a cidade do titular e ativa o recebimento. A configuração inicial permanece vazia e desativada: nunca usar uma chave de exemplo em produção.

O convidado escolhe um presente, informa seu nome (e o nome do pagador, se diferente), recebe o QR Code/Copia e Cola e clica em **Já fiz o pagamento** após transferir pelo banco. O agradecimento registra apenas o aviso, sem declarar confirmação bancária ou mostrar uma fila de aprovação.

O Pix é um BR Code estático, criado localmente com a chave, o valor em centavos e uma referência de até 25 caracteres. Não utiliza Checkout Mercado Pago, token bancário, webhook de pagamento ou serviço externo para gerar QR Codes. O pagamento vai à conta associada à chave cadastrada. A aplicação não verifica a titularidade da chave nem se o Pix foi liquidado.

`gift_payment_reports` guarda o aviso privado e as informações apresentadas ao convidado. Seus dados são declarações não verificadas; só entram no total recebido depois da conferência humana. Alterar ou remover um presente não apaga os avisos anteriores. Apenas administradores autorizados com MFA podem ler os avisos ou alterar seus estados:

- `reported`: pagamento informado; aguarda conferência interna.
- `confirmed`: recebimento localizado no extrato, com data e administrador registrados pelo banco de dados.
- `not_found`: pagamento não localizado; pode voltar para conferência.

O formulário mantém a tentativa na sessão do navegador para permitir repetir o envio após falha de conexão. A chave primária bloqueia duplicidades da mesma tentativa. A conferência usa `updated_at` para evitar sobrescrever a ação de outro administrador. Nomes, valores informados e confirmações nunca ficam disponíveis para leitura anônima.

## Validação

- `node --experimental-strip-types --test scripts/test-pix.mts scripts/test-gifts.mts`
- `npm run lint` e `npx tsc --noEmit`
- `npm run build`
- `supabase/tests/manual_pix.sql`: casos com dados sintéticos e rollback para verificar permissões, confirmação, reversão, duplicidade, concorrência e preservação de histórico. Também validado localmente em PostgreSQL via PGlite.

O script antigo `scripts/check-security.py` ainda espera que o brasão público não aponte para `/login`; essa expectativa já divergia de `SiteHeader.tsx` antes desta alteração. As rotas novas foram verificadas separadamente quanto a JSON inválido, origem externa, tipo de conteúdo, limite de corpo e proteção do financeiro.
