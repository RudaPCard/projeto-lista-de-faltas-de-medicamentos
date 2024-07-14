let medicamentos = [];
let selectedIndex = -1; // Índice do item selecionado
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
    selectedIndex = -1; // Resetar o índice selecionado

    suggestions.forEach((suggestion, index) => {
        const li = document.createElement('li');
        li.textContent = suggestion.nome;
        li.className = 'suggestion-item';
        li.onclick = function() {
            document.getElementById('textoInput').value = suggestion.nome;
            suggestionsList.innerHTML = '';
        };
        li.dataset.index = index; // Armazenar o índice
        suggestionsList.appendChild(li);
    });
});

document.getElementById('textoInput').addEventListener('keydown', function (event) {
    const suggestionsList = document.getElementById('suggestionsList');
    const items = suggestionsList.getElementsByClassName('suggestion-item');

    if (event.key === 'ArrowDown') {
        selectedIndex = (selectedIndex + 1) % items.length; // Avança no índice
        updateSuggestionHighlight(items);
        event.preventDefault(); // Previne o comportamento padrão
    } else if (event.key === 'ArrowUp') {
        selectedIndex = (selectedIndex - 1 + items.length) % items.length; // Retrocede no índice
        updateSuggestionHighlight(items);
        event.preventDefault(); // Previne o comportamento padrão
    } else if (event.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
            document.getElementById('textoInput').value = items[selectedIndex].textContent;
            suggestionsList.innerHTML = '';
            enviarTexto(); // Chama a função enviarTexto quando Enter é pressionado
        }
    }
});

function updateSuggestionHighlight(items) {
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('highlight');
    }
    if (selectedIndex >= 0 && selectedIndex < items.length) {
        items[selectedIndex].classList.add('highlight'); // Adiciona a classe de destaque
    }
}

function enviarTexto() {
    const textoInput = document.getElementById('textoInput').value.toUpperCase();
    const colunaPalavras = document.getElementById('colunaPalavras');
    const itensExistentes = colunaPalavras.getElementsByTagName('p');
    let jaExiste = false;

    // Verificar se o medicamento já está na lista
    for (let i = 0; i < itensExistentes.length; i++) {
        if (itensExistentes[i].textContent === textoInput) {
            jaExiste = true;
            break;
        }
    }

    if (jaExiste) {
        alert('O medicamento já está na lista de faltas.');
    } else {
        if (textoInput) {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'item-container';

            const p = document.createElement('p');
            p.textContent = textoInput; // Converte o texto para maiúsculas

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function() {
                colunaPalavras.removeChild(itemContainer);
            };

            const encomendaCheckbox = document.createElement('input');
            encomendaCheckbox.type = 'checkbox';
            encomendaCheckbox.className = 'encomenda-checkbox';
            encomendaCheckbox.onchange = function() {
                if (this.checked) {
                    quantidadeInput.style.display = 'inline-block';
                } else {
                    quantidadeInput.style.display = 'none';
                    quantidadeInput.value = ''; // Limpar a quantidade quando desmarcar
                }
            };

            const quantidadeInput = document.createElement('input');
            quantidadeInput.type = 'number';
            quantidadeInput.min = '1';
            quantidadeInput.placeholder = 'Qtd';
            quantidadeInput.className = 'quantidade-input';
            quantidadeInput.style.display = 'none';

            itemContainer.appendChild(p);
            itemContainer.appendChild(encomendaCheckbox);
            itemContainer.appendChild(quantidadeInput);
            itemContainer.appendChild(deleteButton);
            colunaPalavras.appendChild(itemContainer);

            document.getElementById('textoInput').value = ''; // Limpar a input após enviar
            document.getElementById('suggestionsList').innerHTML = ''; // Limpar sugestões após enviar
            document.getElementById('textoInput').focus(); // Retorna o foco para o input
        } else {
            alert('Por favor, digite o nome do medicamento.');
        }
    }
}

document.getElementById('generate-pdf').addEventListener('click', function() {
    const colunaPalavras = document.getElementById('colunaPalavras');

    // Criar um novo elemento para o título
    const title = document.createElement('h1');
    title.textContent = 'LISTA DE FALTAS';
    title.style.textAlign = 'center'; // Centraliza o título

    // Criar um contêiner para o PDF
    const container = document.createElement('div');
    container.style.margin = '20px'; // Margem de 20px em todos os lados
    container.appendChild(title);

    // Clonar cada item sem os botões e checkboxes, mas incluindo a quantidade se for encomenda
    Array.from(colunaPalavras.children).forEach(itemContainer => {
        const clone = itemContainer.cloneNode(true);
        const button = clone.querySelector('button');
        const checkbox = clone.querySelector('.encomenda-checkbox');
        const quantidade = clone.querySelector('.quantidade-input');

        // Remover o botão do clone
        if (button) clone.removeChild(button);

        // Incluir a quantidade se a checkbox estiver marcada
        if (checkbox && checkbox.checked && quantidade && quantidade.value) {
            const quantidadeText = document.createElement('span');
            quantidadeText.textContent = `Quantidade: ${quantidade.value}`;
            quantidadeText.classList.add('quantidade-text'); // Adicionar classe CSS para a linha

            const linha = document.createElement('span');
            linha.classList.add('linha'); // Adicionar classe CSS para a linha

            clone.appendChild(linha);
            clone.appendChild(quantidadeText);
        }

        // Remover o checkbox e o input de quantidade do clone
        if (checkbox) clone.removeChild(checkbox);
        if (quantidade) clone.removeChild(quantidade);

        container.appendChild(clone);
    });

    // Gerar o PDF
    html2pdf()
        .from(container)
        .set({
            margin: 1, // Margens de 1 cm
            filename: 'relatorio_faltas.pdf',
            html2canvas: { scale: 2 }, // Aumenta a escala para melhor qualidade
            jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
        })
        .save();
});





