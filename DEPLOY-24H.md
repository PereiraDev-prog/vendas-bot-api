# Guia de Deploy 24/7 (Gratuito) 🚀

Para deixar seu robô ligado 24h sem depender do seu computador, vamos usar o **Render.com**.

## Passo 1: Preparar o Código
1.  Crie uma conta no [GitHub](https://github.com/) (se não tiver).
2.  Crie um novo repositório chamado `vendas-bot-api`.
3.  Suba os arquivos do projeto para lá (**EXCETO** a pasta `node_modules` e o arquivo `.env`).
    *   *Dica: O arquivo `credentials.json` também não deve ir para o GitHub se o repositório for público por segurança.*

## Passo 2: Configurar no Render.com
1.  Crie uma conta no [Render](https://render.com/).
2.  Clique em **New +** e escolha **Web Service**.
3.  Conecte sua conta do GitHub e selecione o repositório `vendas-bot-api`.
4.  **Configurações:**
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
    *   **Instance Type:** `Free`

## Passo 3: Variáveis de Ambiente (Segurança)
No painel do Render, vá em **Environment** e adicione estas chaves:

1.  `GOOGLE_CREDENTIALS_JSON`: Copie e cole **todo o conteúdo** do seu arquivo `credentials.json` aqui.
2.  `GOOGLE_SHEETS_ID`: O ID da sua planilha (aquele que já usamos no .env).

## Passo 4: Atualizar no Bot
Após o deploy, o Render vai te dar uma URL como `https://vendas-bot-api.onrender.com`.

Substitua o link do ngrok no Dashboard do seu bot pelos novos links:
- `https://vendas-bot-api.onrender.com/checar-estoque`
- `https://vendas-bot-api.onrender.com/obter-key`

---
**Observação:** No plano gratuito do Render, o primeiro acesso após muito tempo parado pode demorar uns 30 segundos para "acordar". O Ease Bot tem um limite de 120 segundos, então vai funcionar perfeitamente!
