const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const cors = require('cors');

// Configuração das variáveis de ambiente
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

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
 * Funçao auxiliar para obter todos os dados da planilha
 */
async function getSheetData() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:F`, // Aumentado para F para incluir o TIPO do produto
    });
    return response.data.values || [];
}

/**
 * Endpoint: POST /checar-estoque
 * Verifica se existe estoque disponível (formato Ease Bot).
 */
app.all('/checar-estoque', async (req, res) => {
    try {
        console.log('--- CHAMADA /checar-estoque ---');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        const rows = await getSheetData();
        const { product } = req.body;
        const tipoSolicitado = product?.item?.name; // Ex: "diario", "Semanal", etc.

        // Filtra linhas com STATUS "DISPONIVEL" e que batem com o TIPO (coluna F - índice 5)
        const disponiveis = rows.filter(row => {
            const statusOk = row[2] === 'DISPONIVEL';
            const tipoOk = !tipoSolicitado || (row[5] && row[5].toLowerCase() === tipoSolicitado.toLowerCase());
            return statusOk && tipoOk;
        });

        const count = disponiveis.length;

        return res.json({
            status: count > 0 ? "continue" : "error",
            stock_count: count,
            reason: count > 0 ? null : `Estoque esgotado para o tipo: ${tipoSolicitado || 'Geral'}`
        });
    } catch (error) {
        console.error('Erro ao checar estoque:', error);
        return res.status(200).json({ status: "error", reason: "Erro interno no servidor" });
    }
});

/**
 * Endpoint: POST /obter-key
 * Busca as keys disponíveis, reserva e retorna (formato Ease Bot).
 */
app.post('/obter-key', async (req, res) => {
    console.log('--- CHAMADA /obter-key ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    const { user, order, product } = req.body;
    const clienteId = user ? user.id : 'desconhecido';
    const quantidade = order ? order.quantity : 1;
    const tipoSolicitado = product?.item?.name; // Ex: "diario", "Semanal", etc.

    try {
        const rows = await getSheetData();
        const disponiveisIndexes = [];

        // Localiza as keys disponíveis que batem com o TIPO (coluna F - índice 5)
        for (let i = 0; i < rows.length; i++) {
            const statusOk = rows[i][2] === 'DISPONIVEL';
            const tipoOfRow = rows[i][5] ? rows[i][5].toLowerCase() : '';
            const tipoOk = !tipoSolicitado || tipoOfRow === tipoSolicitado.toLowerCase();

            if (statusOk && tipoOk) {
                disponiveisIndexes.push(i);
                if (disponiveisIndexes.length >= quantidade) break;
            }
        }

        if (disponiveisIndexes.length < quantidade) {
            return res.json({
                status: "error",
                reason: `Estoque insuficiente para o tipo ${tipoSolicitado || 'Geral'}`
            });
        }

        const keysEntregues = [];
        const dataVenda = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        // Atualiza cada key individualmente na planilha
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

        console.log(`[${dataVenda}] ${quantidade} key(s) entregue(s) para ${clienteId}`);

        // Formato esperado pelo Ease Bot
        return res.json({
            status: "success",
            items: keysEntregues,
            is_to_make_delivery: true,
            stock_count: rows.length - keysEntregues.length // Estimativa simples
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
