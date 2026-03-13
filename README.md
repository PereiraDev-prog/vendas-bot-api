# Discord Key Delivery API - Google Sheets

Este sistema permite gerenciar e entregar keys de produtos automaticamente no Discord, usando o Google Sheets como banco de dados.

## 🚀 Como Configurar

### 1. Preparar a Planilha no Google Sheets
1. Crie uma nova planilha.
2. Renomeie a página atual para `ESTOQUE_KEYS`.
3. Preencha a primeira linha (cabeçalhos) com:
   `ID | KEY | STATUS | CLIENTE | DATA`
4. Na coluna **STATUS**, use `DISPONIVEL` para itens que podem ser vendidos.
5. Copie o **ID da Planilha** da URL (ex: `https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit`).

### 2. Criar Credenciais no Google Cloud Console
1. Vá para o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto.
3. No menu lateral, vá em **APIs & Services > Library** e ative a **Google Sheets API**.
4. Em **APIs & Services > Credentials**, clique em **Create Credentials > Service Account**.
5. Siga os passos e, ao final, clique no e-mail da conta de serviço criada.
6. Vá na aba **Keys > Add Key > Create new key > JSON**. O download do arquivo será feito.
7. **IMPORTANTE:** Abra a sua planilha e clique em **Compartilhar**. Adicione o e-mail da Conta de Serviço com permissão de **Editor**.

### 3. Configurar o Projeto
1. Clone este repositório ou baixe os arquivos.
2. Renomeie o arquivo `.env.example` para `.env`.
3. Preencha as informações no `.env`:
   - `GOOGLE_SHEETS_ID`: O ID da sua planilha.
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: O e-mail da conta de serviço.
   - `GOOGLE_PRIVATE_KEY`: A chave privada presente no JSON baixado (incluindo as partes `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`).

### 4. Executar
```bash
npm install
npm start
```

## 🛠 Endpoints da API

### `GET /checar-estoque`
Verifica se há keys disponíveis.
**Resposta:** `{ "disponivel": true/false }`

### `POST /obter-key`
Reserva e entrega a primeira key disponível.
**Body:** `{ "clienteId": "ID_DO_DISCORD" }`
**Resposta:** `{ "key": "XXXX-XXXX-XXXX" }`

## 🌐 Hospedagem (Render / Railway)
- **Render:** Crie um novo "Web Service", conecte seu repositório Git e adicione as variáveis do `.env` na aba "Environment".
- **Railway:** Crie um novo projeto, suba o código e adicione as variáveis no painel de "Variables".
