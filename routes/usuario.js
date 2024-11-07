const express = require('express');
const router = express.Router();
const { Usuario } = require('../models');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
  const { nome, email, password, telefone } = req.body;
  try {
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const novoUsuario = await Usuario.create({
      nome,
      email,
      password: hashedPassword,
      telefone,
    });

    res.status(201).json({ message: 'Usuário registrado com sucesso.' });
  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    res.status(500).json({ message: 'Erro ao registrar usuário.' });
  }
});

module.exports = router;
