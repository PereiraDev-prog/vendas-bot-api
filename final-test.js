const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID = '1MxL-Z61mNOM6Zipb5f4NjR1-hlA2zeZDvhVoG2nD7bI';
const SHEET_NAME = 'ESTOQUE';

async function getSheetData() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:E`,
    });
    return response.data.values || [];
}

async function test() {
    try {
        const rows = await getSheetData();
        console.log('Rows found:', rows.length);
        const temDisponivel = rows.some(row => row[2] === 'DISPONIVEL');
        console.log('Tem disponível:', temDisponivel);
    } catch (err) {
        console.error('ERRO NO TESTE FINAL:');
        console.error(err);
    }
}

test();
