const express = require('express');
const router = express.Router();
const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const passport = require('passport');

  router.post('/register', async (req, res) => {

    const { nome, email, password, telefone } = req.body;
    try {
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ message: 'Email já cadastrado.' });
      }

      const novoUsuario = await Usuario.create({
        nome,
        email,
        password,
        telefone,
      });

      res.status(201).json({ message: 'Usuário registrado com sucesso.' });
    } catch (err) {
      console.error('Erro ao registrar usuário:', err);
      res.status(500).json({ message: 'Erro ao registrar usuário.' });
    }
  });

  router.post('/login', (req, res, next) => {

    console.log("Login");
    passport.authenticate('local', (err, usuario, info) => {
      if (err) {
        return next(err);
      }
      if (!usuario) {
        return res.status(400).json({ message: info.message });
      }
      req.logIn(usuario, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ message: 'Login realizado com sucesso.' });
      });
    })(req, res, next);
  });

  router.get('/logout', (req, res) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.json({ message: 'Logout realizado com sucesso.' });
    });
  });

  router.get('/status', (req, res) => {
    res.json({ autenticado: req.isAuthenticated() });
  });

module.exports = router;
