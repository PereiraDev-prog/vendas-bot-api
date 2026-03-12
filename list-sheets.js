const { google } = require('googleapis');

async function listSheets() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: './credentials.json',
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.get({
            spreadsheetId: '1MxL-Z61mNOM6Zipb5f4NjR1-hlA2zeZDvhVoG2nD7bI',
        });

        console.log('--- ABAS ENCONTRADAS ---');
        res.data.sheets.forEach(s => console.log(`- ${s.properties.title}`));
        console.log('------------------------');
    } catch (err) {
        console.error('Erro ao listar abas:', err.message);
    }
}

listSheets();
