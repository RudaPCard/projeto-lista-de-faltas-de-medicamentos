let medicamentos = [];
let selectedIndex = -1;
let ignoreNextInputEvent = false;

async function carregarMedicamentos() {
    try {
        const response = await fetch('medicamentos.json');
        medicamentos = await response.json();
        console.log('Medicamentos carregados:', medicamentos);
    } catch (error) {
        console.error('Erro ao carregar medicamentos:', error);
    }
}

carregarMedicamentos();

document.getElementById('textoInput').addEventListener('input', function () {
    if (ignoreNextInputEvent) {
        ignoreNextInputEvent = false;
        return;
    }

    const input = this.value.toLowerCase();
    const suggestions = medicamentos.filter(medicamento =>
        medicamento.nome && medicamento.nome.toLowerCase().startsWith(input)
    );

    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '';
    selectedIndex = -1;

    suggestions.forEach((suggestion, index) => {
        const li = document.createElement('li');
        li.textContent = suggestion.nome;
        li.className = 'suggestion-item';
        li.onclick = function () {
            document.getElementById('textoInput').value = suggestion.nome;
            suggestionsList.innerHTML = '';
        };
        li.dataset.index = index;
        suggestionsList.appendChild(li);
    });
});

document.getElementById('textoInput').addEventListener('keydown', function (event) {
    const suggestionsList = document.getElementById('suggestionsList');
    const items = suggestionsList.getElementsByClassName('suggestion-item');

    if (event.key === 'ArrowDown') {
        selectedIndex = (selectedIndex + 1) % items.length;
        updateSuggestionHighlight(items);
        event.preventDefault();
    } else if (event.key === 'ArrowUp') {
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateSuggestionHighlight(items);
        event.preventDefault();
    } else if (event.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
            document.getElementById('textoInput').value = items[selectedIndex].textContent;
            suggestionsList.innerHTML = '';
        }
    }
});

function updateSuggestionHighlight(items) {
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('highlight');
    }
    if (selectedIndex >= 0 && selectedIndex < items.length) {
        items[selectedIndex].classList.add('highlight');
    }
}

function enviarTexto() {
    const textoInput = document.getElementById('textoInput').value.toUpperCase();
    const colunaPalavras = document.getElementById('colunaPalavras');

    if (textoInput && !isMedicamentoNaLista(textoInput)) {
        const div = document.createElement('div');
        div.className = 'med-item item-container';

        const p = document.createElement('p');
        p.textContent = textoInput;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Deletar';
        deleteButton.onclick = function () {
            colunaPalavras.removeChild(div);
        };

        const encomendaCheckbox = document.createElement('input');
        encomendaCheckbox.type = 'checkbox';
        encomendaCheckbox.className = 'encomenda-checkbox';
        encomendaCheckbox.onchange = function () {
            if (this.checked) {
                quantidadeInput.style.display = 'inline';
            } else {
                quantidadeInput.style.display = 'none';
            }
        };

        const quantidadeInput = document.createElement('input');
        quantidadeInput.type = 'number';
        quantidadeInput.min = '1';
        quantidadeInput.placeholder = 'Qtd';
        quantidadeInput.className = 'quantidade-input';
        quantidadeInput.style.display = 'none';

        div.appendChild(p);
        div.appendChild(quantidadeInput);
        div.appendChild(encomendaCheckbox);
        div.appendChild(deleteButton);
        colunaPalavras.appendChild(div);

        document.getElementById('textoInput').value = '';
        document.getElementById('suggestionsList').innerHTML = '';
        document.getElementById('textoInput').focus();
    } else {
        alert('Esse medicamento já está na lista.');
    }
}

function isMedicamentoNaLista(nome) {
    const items = document.querySelectorAll('#colunaPalavras p');
    for (let item of items) {
        if (item.textContent === nome) {
            return true;
        }
    }
    return false;
}

function limparCaixaArmazenamento(id) {
    document.getElementById(id).innerHTML = '';
}

document.getElementById('generate-pdf').addEventListener('click', function () {
    const element = document.getElementById('colunaPalavras');

    const title = document.createElement('h1');
    title.textContent = 'LISTA DE FALTAS';
    title.style.textAlign = 'center';

    const container = document.createElement('div');
    container.style.margin = '20px';
    container.appendChild(title);

    const clonedElement = element.cloneNode(true);

    clonedElement.querySelectorAll('.med-item').forEach(item => {
        const p = item.querySelector('p').cloneNode(true);
        const quantidade = item.querySelector('input[type="number"]').value;
        if (quantidade) {
            p.textContent += ` - ${quantidade} caixas`;
        }
        const line = document.createElement('div');
        line.appendChild(p);
        line.style.borderBottom = '1px solid #000';
        line.style.marginBottom = '10px';
        container.appendChild(line);
    });

    html2pdf()
        .from(container)
        .set({
            margin: 1,
            filename: 'relatorio_faltas.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
        })
        .save();
});






