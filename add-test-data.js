const { google } = require('googleapis');

async function addTestData() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: './credentials.json',
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = '1MxL-Z61mNOM6Zipb5f4NjR1-hlA2zeZDvhVoG2nD7bI';

        // Primeiro, vamos garantir os cabeçalhos na linha 1
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'ESTOQUE!A1:E1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [['ID', 'KEY', 'STATUS', 'CLIENTE', 'DATA']]
            }
        });

        // Adiciona 3 keys de teste
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'ESTOQUE!A2:C4', // Preenche ID, KEY e STATUS para 3 linhas
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    ['1', 'ABCD-1234-EFGH', 'DISPONIVEL'],
                    ['2', 'IJKL-5678-MNOP', 'DISPONIVEL'],
                    ['3', 'QRST-9012-UVWX', 'DISPONIVEL']
                ]
            }
        });

        console.log('✅ Dados de teste inseridos com sucesso na aba ESTOQUE!');
    } catch (err) {
        console.error('❌ Erro ao inserir dados:', err.message);
        if (err.message.includes('not found')) {
            console.log('DICA: Você renomeou a aba para ESTOQUE no Google Sheets?');
        }
    }
}

addTestData();
