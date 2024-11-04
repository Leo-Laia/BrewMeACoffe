const express = require('express');
const router = express.Router();
const fs = require('fs');


let fila = [];
let historico = [];
let contadores = {};
let relatorios = [];

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
        relatorios = dados.relatorios || [];
        console.log('Dados carregados com sucesso.');
    } else {
        console.log('Nenhum dado existente encontrado. Iniciando com dados vazios.');
    }
}


carregarDados();

router.get('/dados', (req, res) => {
    res.json({ fila, historico, contadores });
});

router.post('/adicionar', (req, res) => {
    const nome = req.body.nome;
    if (nome && !fila.includes(nome)) {
        fila.push(nome);
        contadores[nome] = 0;
        salvarDados();
        res.json({ sucesso: true });
    } else {
        res.json({ sucesso: false, mensagem: 'Nome inválido ou já existente' });
    }
});

router.post('/fez-cafe', (req, res) => {
    if (fila.length > 0) {
        const pessoa = fila.shift();
        historico.push(pessoa);
        contadores[pessoa] += 1;
        fila.push(pessoa);
        salvarDados();
        res.json({ sucesso: true });
    } else {
        res.json({ sucesso: false, mensagem: 'Fila vazia' });
    }
});

router.post('/outro-fez-cafe', (req, res) => {
    const nome = req.body.nome;
    if (nome && fila.includes(nome)) {
        fila.splice(fila.indexOf(nome), 1);
        historico.push(nome);
        contadores[nome] += 1;
        fila.push(nome);
        salvarDados();
        res.json({ sucesso: true });
    } else {
        res.json({ sucesso: false, mensagem: 'Nome não encontrado na fila' });
    }
});

router.post('/reordenar', (req, res) => {
    const novaFila = req.body.fila;
    if (Array.isArray(novaFila)) {
        fila = novaFila;
        salvarDados();
        res.json({ sucesso: true });
    } else {
        res.json({ sucesso: false, mensagem: 'Formato inválido' });
    }
});

router.post('/gerar-relatorio', (req, res) => {
    if (Object.keys(contadores).length === 0) {
        return res.json({ sucesso: false, mensagem: 'Não há dados para gerar relatório.' });
    }

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

    const relatorio = {
        data: new Date().toLocaleString('pt-BR'),
        contadores: { ...contadores },
        quemMais,
        quemMenos,
        maxContador,
        minContador
    };

    relatorios.unshift(relatorio);
    if (relatorios.length > 2) {
        relatorios.pop();
    }

    for (let pessoa in contadores) {
        contadores[pessoa] = 0;
    }

    salvarDados();
    res.json({ sucesso: true });
});

router.get('/relatorios', (req, res) => {
    res.json({ relatorios });
});

module.exports = router;
