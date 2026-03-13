const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const cors = require('cors');

// Configuração das variáveis de ambiente
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Log global para ver TODAS as tentativas do Bot
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Configuração da Google Sheets API
let auth;
if (process.env.GOOGLE_CREDENTIALS_JSON) {
    auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
} else {
    auth = new google.auth.GoogleAuth({
        keyFile: './credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
}

const SPREADSHEET_ID = '1MxL-Z61mNOM6Zipb5f4NjR1-hlA2zeZDvhVoG2nD7bI';
const SHEET_NAME = 'ESTOQUE'; // Vamos pedir ao usuário para renomear a aba para 'ESTOQUE'

/**
 * Normaliza strings para comparação robusta
 */
function normalize(str) {
    if (!str) return '';
    return str.toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .trim();
}

/**
 * Funçao auxiliar para obter todos os dados da planilha
 */
async function getSheetData() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:F`,
    });
    return response.data.values || [];
}

/**
 * Endpoint: POST /checar-estoque
 */
app.all('/checar-estoque', async (req, res) => {
    try {
        console.log('--- CHAMADA /checar-estoque ---');
        const bodyContent = req.body?.data || req.body || {};
        console.log('Payload Recebido:', JSON.stringify(bodyContent, null, 2));

        const rows = await getSheetData();
        const product = bodyContent.product;
        // Tenta pegar o nome da variação (item.name) ou o nome do produto principal (name)
        const tipoSolicitado = normalize(product?.item?.name || product?.name); 
        
        console.log(`Buscando estoque para tipo: "${tipoSolicitado || 'QUALQUER'}"`);

        // Filtra linhas: deve ter key, estar disponível e bater o tipo
        const disponiveis = rows.filter(row => {
            const temKey = row[1] && row[1].trim() !== '';
            const statusOk = normalize(row[2]) === 'disponivel';
            const tipoOfRow = normalize(row[5]);
            
            // Se o usuário não pediu tipo específico, qualquer um serve. 
            // Se pediu, tem que bater ou a linha ser vazia (legado)
            const tipoOk = !tipoSolicitado || tipoOfRow === tipoSolicitado || tipoOfRow === '';
            
            return temKey && statusOk && tipoOk;
        });
        
        const count = disponiveis.length;
        console.log(`Resultado: ${count} itens encontrados.`);

        return res.json({ 
            status: count > 0 ? "continue" : "error",
            stock_count: count,
            reason: count > 0 ? null : `Estoque esgotado para: ${tipoSolicitado || 'Geral'}`
        });
    } catch (error) {
        console.error('Erro ao checar estoque:', error);
        return res.status(200).json({ status: "error", reason: "Erro interno no servidor" });
    }
});

/**
 * Endpoint: POST /obter-key
 */
app.all('/obter-key', async (req, res) => {
    try {
        console.log('--- CHAMADA /obter-key ---');
        const bodyContent = req.body?.data || req.body || {};
        console.log('Payload Recebido:', JSON.stringify(bodyContent, null, 2));

        const { user, order, product } = bodyContent;
        const clienteId = user ? user.id : 'desconhecido';
        const quantidade = order ? Math.max(1, parseInt(order.quantity) || 1) : 1;
        const tipoSolicitado = normalize(product?.item?.name || product?.name); 

        console.log(`Solicitação: ${quantidade}x "${tipoSolicitado || 'QUALQUER'}" para Cliente: ${clienteId}`);

        const rows = await getSheetData();
        const disponiveisIndexes = [];
        
        for (let i = 0; i < rows.length; i++) {
            const temKey = rows[i][1] && rows[i][1].trim() !== '';
            const statusOk = normalize(rows[i][2]) === 'disponivel';
            const tipoOfRow = normalize(rows[i][5]);
            const tipoOk = !tipoSolicitado || tipoOfRow === tipoSolicitado || tipoOfRow === '';

            if (temKey && statusOk && tipoOk) {
                disponiveisIndexes.push(i);
                if (disponiveisIndexes.length >= quantidade) break;
            }
        }

        if (disponiveisIndexes.length < quantidade) {
            console.log('Falha: Estoque insuficiente.');
            return res.json({ 
                status: "error", 
                reason: `Estoque insuficiente para ${tipoSolicitado || 'Geral'}` 
            });
        }

        const keysEntregues = [];
        const dataVenda = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        for (const idx of disponiveisIndexes) {
            const key = rows[idx][1];
            keysEntregues.push(key);
            const rowNumber = idx + 2;

            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!C${rowNumber}:E${rowNumber}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [['VENDIDO', clienteId, dataVenda]]
                }
            });
        }

        console.log(`Sucesso: ${keysEntregues.length} keys marcadas como VENDIDO.`);

        // Retorno exigido pelo Ease Bot Hooks API (E estrito como String)
        return res.json({
            status: "success",
            items: keysEntregues,
            is_to_make_delivery: "true",
            stock_count: rows.length - keysEntregues.length 
        });
    } catch (error) {
        console.error('Erro ao obter key:', error);
        return res.status(200).json({ status: "error", reason: "Erro no processamento da entrega" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
