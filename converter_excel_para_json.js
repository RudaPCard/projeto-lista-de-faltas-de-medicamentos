const xlsx = require('xlsx');
const fs = require('fs');

// Carregue o arquivo Excel
const workbook = xlsx.readFile('C:\\Users\\rudap\\OneDrive\\Área de Trabalho\\Lista de Faltas\\medicamentos.xlsx');
const sheetName = workbook.SheetNames[0]; // Pega a primeira aba
const sheet = workbook.Sheets[sheetName];

// Converta para JSON
const data = xlsx.utils.sheet_to_json(sheet);



// Filtrar apenas os medicamentos
const medicamentos = data.map(item => {
    return { nome: item['Medicamento'] }; // Ajuste o nome da coluna conforme necessário
}).filter(item => item.nome); // Filtra apenas os que têm nome

// Salvar no formato correto
fs.writeFileSync('medicamentos.json', JSON.stringify(medicamentos, null, 2));


