// server.js
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 6969;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Dados em memória (in-memory)
let fila = [];
let historico = [];
let contadores = {};
let relatorios = []; // **Novo** - Lista de relatórios

// Funções para salvar e carregar dados
function salvarDados() {
    const dados = { fila, historico, contadores, relatorios };
    fs.writeFileSync('dados.json', JSON.stringify(dados));
}

function carregarDados() {
    if (fs.existsSync('dados.json')) {
        const dados = JSON.parse(fs.readFileSync('dados.json'));
        fila = dados.fila || [];
        historico = dados.historico || [];
        contadores = dados.contadores || {};
        relatorios = dados.relatorios || []; // **Novo**
        console.log('Dados carregados com sucesso.');
    } else {
        console.log('Nenhum dado existente encontrado. Iniciando com dados vazios.');
    }
}

// Carrega os dados ao iniciar o servidor
carregarDados();

// Rotas da API

// Obter todos os dados
app.get('/api/dados', (req, res) => {
    res.json({ fila, historico, contadores });
});

// Adicionar pessoa à fila
app.post('/api/adicionar', (req, res) => {
    const nome = req.body.nome;
    if (nome && !fila.includes(nome)) {
        fila.push(nome);
        contadores[nome] = 0;
        salvarDados(); // Salva os dados após adicionar
        res.json({ sucesso: true });
    } else {
        res.json({ sucesso: false, mensagem: 'Nome inválido ou já existente' });
    }
});

// Marcar que fez o café (pessoa da vez)
app.post('/api/fez-cafe', (req, res) => {
    if (fila.length > 0) {
        const pessoa = fila.shift();
        historico.push(pessoa);
        contadores[pessoa] += 1;
        fila.push(pessoa);
        salvarDados(); // Salva os dados após atualizar
        res.json({ sucesso: true });
    } else {
        res.json({ sucesso: false, mensagem: 'Fila vazia' });
    }
});

// Marcar que outra pessoa fez o café
app.post('/api/outro-fez-cafe', (req, res) => {
    const nome = req.body.nome;
    if (nome && fila.includes(nome)) {
        fila.splice(fila.indexOf(nome), 1);
        historico.push(nome);
        contadores[nome] += 1;
        fila.push(nome);
        salvarDados(); // Salva os dados após atualizar
        res.json({ sucesso: true });
    } else {
        res.json({ sucesso: false, mensagem: 'Nome não encontrado na fila' });
    }
});

// Reordenar a fila
app.post('/api/reordenar', (req, res) => {
    const novaFila = req.body.fila;
    if (Array.isArray(novaFila)) {
        fila = novaFila;
        salvarDados(); // Salva os dados após reordenar
        res.json({ sucesso: true });
    } else {
        res.json({ sucesso: false, mensagem: 'Formato inválido' });
    }
});

// **Novo** - Gerar relatório e resetar contadores
app.post('/api/gerar-relatorio', (req, res) => {
    if (Object.keys(contadores).length === 0) {
        return res.json({ sucesso: false, mensagem: 'Não há dados para gerar relatório.' });
    }

    // Determinar quem mais e quem menos fez café
    let max = -1;
    let min = Infinity;
    let quemMais = '';
    let quemMenos = '';
    let maxContador = 0;
    let minContador = 0;

    for (let pessoa in contadores) {
        if (contadores[pessoa] > max) {
            max = contadores[pessoa];
            quemMais = pessoa;
            maxContador = contadores[pessoa];
        }
        if (contadores[pessoa] < min) {
            min = contadores[pessoa];
            quemMenos = pessoa;
            minContador = contadores[pessoa];
        }
    }

    // Criar relatório
    const relatorio = {
        data: new Date().toLocaleString('pt-BR'),
        contadores: { ...contadores },
        quemMais,
        quemMenos,
        maxContador,
        minContador
    };

    // Adicionar relatório à lista (limitar a 2 relatórios)
    relatorios.unshift(relatorio);
    if (relatorios.length > 2) {
        relatorios.pop();
    }

    // Resetar contadores
    for (let pessoa in contadores) {
        contadores[pessoa] = 0;
    }

    salvarDados(); // Salva os dados após gerar relatório
    res.json({ sucesso: true });
});

// **Novo** - Obter relatórios
app.get('/api/relatorios', (req, res) => {
    res.json({ relatorios });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
