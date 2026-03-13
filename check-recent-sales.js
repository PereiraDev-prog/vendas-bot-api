const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

async function checkRecentSales() {
    const auth = new google.auth.GoogleAuth({
        keyFile: './credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const SPREADSHEET_ID = '1MxL-Z61mNOM6Zipb5f4NjR1-hlA2zeZDvhVoG2nD7bI';
    const SHEET_NAME = 'ESTOQUE';

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1:F`,
        });

        const rows = res.data.values || [];
        console.log('--- RECENT SALES (VENDIDO) ---');
        rows.slice(1).forEach((row, index) => {
            if (row[2] === 'VENDIDO') {
                console.log(`Linha ${index + 2}: ID=${row[0]}, KEY=${row[1]}, STATUS=${row[2]}, CLIENTE=${row[3]}, DATA=${row[4]}, TIPO=${row[5] || 'SEM TIPO'}`);
            }
        });
        console.log('------------------------------');

        const disponiveis = rows.slice(1).filter(row => row[2] === 'DISPONIVEL');
        console.log(`Total Disponíveis: ${disponiveis.length}`);
        
        const tipos = [...new Set(disponiveis.map(row => row[5] || 'SEM TIPO'))];
        console.log(`Tipos disponíveis: ${tipos.join(', ')}`);

    } catch (err) {
        console.error('Erro:', err.message);
    }
}

checkRecentSales();
