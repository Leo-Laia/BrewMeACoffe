const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const port = 6969;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));


app.use(
  session({
    secret: 'secret_for_development',
    resave: false,
    saveUninitialized: false,
  })
);


app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

const usuarioRoutes = require('./routes/usuario');
const apiRoutes = require('./routes/api');
app.use('/usuario', usuarioRoutes);
app.use('/api', apiRoutes);


sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Não foi possível conectar ao banco de dados:', err);
  });