const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('medicamentos.xlsx');
const sheet_name_list = workbook.SheetNames;
const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

fs.writeFileSync('medicamentos.json', JSON.stringify(jsonData, null, 2));