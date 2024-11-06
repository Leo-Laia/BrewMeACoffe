const express = require('express');
const router = express.Router();
const { Pessoa, Fila, Historico, Contador, Relatorio } = require('../models');


router.get('/dados', async (req, res) => {
    try {
      
      const fila = await Fila.findAll({
        include: [{ model: Pessoa, as: 'pessoa' }],
        order: [['posicao', 'ASC']],
      });
  
      
      const historico = await Historico.findAll({
        include: [{ model: Pessoa, as: 'pessoa' }],
        order: [['createdAt', 'DESC']]
      });
  
      const contadores = await Contador.findAll({
        include: [{ model: Pessoa, as: 'pessoa' }],
      });

      const filaFormatada = fila.map(item => item.pessoa.nome);
      const historicoFormatado = historico.map(item => item.pessoa.nome);
      const contadoresFormatados = {};
      contadores.forEach(item => {
        contadoresFormatados[item.pessoa.nome] = item.contagem;
      });
  
      res.json({
        fila: filaFormatada,
        historico: historicoFormatado,
        contadores: contadoresFormatados,
      });
    } catch (error) {
      console.error('Erro ao obter dados:', error);
      res.status(500).json({ error: 'Erro ao obter dados.' });
    }
  });
  

router.post('/adicionar', async (req, res) => {
  const { nome, telefone } = req.body;
  if (!nome) {
    return res.json({ sucesso: false, mensagem: 'Nome é obrigatório.' });
  }
  try {
    const pessoaExistente = await Pessoa.findOne({ where: { nome } });
    if (pessoaExistente) {
      return res.json({ sucesso: false, mensagem: 'Nome já existente.' });
    }

    const pessoa = await Pessoa.create({ nome, telefone });

    const posicao = await Fila.count();
    await Fila.create({ pessoaId: pessoa.id, posicao });

    await Contador.create({ pessoaId: pessoa.id, contagem: 0 });

    res.json({ sucesso: true });
  } catch (error) {
    console.error('Erro ao adicionar pessoa:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao adicionar pessoa.' });
  }
});


router.post('/fez-cafe', async (req, res) => {
    try {
      const primeiro = await Fila.findOne({
        include: [{ model: Pessoa, as: 'pessoa' }],
        order: [['posicao', 'ASC']],
      });
  
      if (!primeiro) {
        return res.json({ sucesso: false, mensagem: 'Fila vazia.' });
      }
  
      const pessoaId = primeiro.pessoaId;
      await Fila.destroy({ where: { id: primeiro.id } });
  
      // Adicionar ao histórico
      await Historico.create({ pessoaId });
      const contador = await Contador.findOne({ where: { pessoaId } });
      contador.contagem += 1;
      await contador.save();
  
      // Adicionar a pessoa ao final da fila
      const posicao = await Fila.count();
      await Fila.create({ pessoaId, posicao });
  
      res.json({ sucesso: true });
    } catch (error) {
      console.error('Erro ao marcar que fez o café:', error);
      res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar fila.' });
    }
  });
  

router.post('/outro-fez-cafe', async (req, res) => {
    const { nome } = req.body;
    if (!nome) {
      return res.json({ sucesso: false, mensagem: 'Nome é obrigatório.' });
    }
    try {
      const pessoa = await Pessoa.findOne({ where: { nome } });
      if (!pessoa) {
        return res.json({ sucesso: false, mensagem: 'Nome não encontrado.' });
      }
  
      const filaEntry = await Fila.findOne({ where: { pessoaId: pessoa.id } });
      if (filaEntry) {
        await Fila.destroy({ where: { id: filaEntry.id } });
      }
  
      await Historico.create({ pessoaId: pessoa.id });
      const contador = await Contador.findOne({ where: { pessoaId: pessoa.id } });
      contador.contagem += 1;
      await contador.save();
  
      // Adicionar a pessoa ao final da fila
      const posicao = await Fila.count();
      await Fila.create({ pessoaId: pessoa.id, posicao });
  
      res.json({ sucesso: true });
    } catch (error) {
      console.error('Erro ao marcar que outra pessoa fez o café:', error);
      res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar fila.' });
    }
  });
  
router.post('/reordenar', async (req, res) => {
    const { fila: novaFila } = req.body;
    if (!Array.isArray(novaFila)) {
      return res.json({ sucesso: false, mensagem: 'Formato inválido.' });
    }
    try {
      for (let i = 0; i < novaFila.length; i++) {
        const nome = novaFila[i];
        const pessoa = await Pessoa.findOne({ where: { nome } });
        if (pessoa) {
          await Fila.update({ posicao: i }, { where: { pessoaId: pessoa.id } });
        }
      }
      res.json({ sucesso: true });
    } catch (error) {
      console.error('Erro ao reordenar fila:', error);
      res.status(500).json({ sucesso: false, mensagem: 'Erro ao reordenar fila.' });
    }
  });
  
router.post('/gerar-relatorio', async (req, res) => {
    try {
      const contadores = await Contador.findAll({
        include: [{ model: Pessoa, as: 'pessoa' }],
      });
  
      if (contadores.length === 0) {
        return res.json({ sucesso: false, mensagem: 'Não há dados para gerar relatório.' });
      }
  
      let max = -1;
      let min = Infinity;
      let quemMais = '';
      let quemMenos = '';
      let maxContador = 0;
      let minContador = 0;
  
      const contadoresMap = {};
  
      contadores.forEach(item => {
        const nome = item.pessoa.nome;
        const contagem = item.contagem;
        contadoresMap[nome] = contagem;
  
        if (contagem > max) {
          max = contagem;
          quemMais = nome;
          maxContador = contagem;
        }
        if (contagem < min) {
          min = contagem;
          quemMenos = nome;
          minContador = contagem;
        }
      });
  
      await Relatorio.create({
        data: new Date(),
        dados: {
          contadores: contadoresMap,
          quemMais,
          quemMenos,
          maxContador,
          minContador,
        },
      });
  
      // Limite de 2 relatórios
      const totalRelatorios = await Relatorio.count();
      if (totalRelatorios > 2) {
        const relatorioMaisAntigo = await Relatorio.findOne({
          order: [['createdAt', 'ASC']],
        });
        await relatorioMaisAntigo.destroy();
      }
  
      for (let item of contadores) {
        item.contagem = 0;
        await item.save();
      }
  
      res.json({ sucesso: true });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({ sucesso: false, mensagem: 'Erro ao gerar relatório.' });
    }
  });
  
router.get('/relatorios', async (req, res) => {
    try {
      const relatorios = await Relatorio.findAll({
        order: [['createdAt', 'DESC']],
      });
  
      const relatoriosFormatados = relatorios.map(relatorio => {
        const dados = relatorio.dados;
        return {
          data: relatorio.data.toLocaleString('pt-BR'),
          contadores: dados.contadores,
          quemMais: dados.quemMais,
          quemMenos: dados.quemMenos,
          maxContador: dados.maxContador,
          minContador: dados.minContador,
        };
      });
  
      res.json({ relatorios: relatoriosFormatados });
    } catch (error) {
      console.error('Erro ao obter relatórios:', error);
      res.status(500).json({ sucesso: false, mensagem: 'Erro ao obter relatórios.' });
    }
  });
  

module.exports = router;
