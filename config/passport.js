const LocalStrategy = require('passport-local').Strategy;
const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const usuario = await Usuario.findOne({ where: { email } });
          if (!usuario) {
            return done(null, false, { message: 'Email não cadastrado.' });
          }

          console.log('Senha fornecida no login:', password);
          console.log('Senha armazenada no banco:', usuario.password);

          const isMatch = await bcrypt.compare(password, usuario.password);

          console.log('Resultado da comparação de senha:', isMatch);

          if (!isMatch) {
            return done(null, false, { message: 'Senha incorreta.' });
          }

          return done(null, usuario);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((usuario, done) => {
    done(null, usuario.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const usuario = await Usuario.findByPk(id);
      done(null, usuario);
    } catch (err) {
      done(err);
    }
  });
};
