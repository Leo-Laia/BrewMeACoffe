module.exports = {
    ensureAuthenticated: function (req, res, next) {
      console.log("Middleware ensureAuthenticated executado");
      console.log("Tipo de req.isAuthenticated:", typeof req.isAuthenticated);
      if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
        console.log("Usuário autenticado");
        return next();
      }
      console.log("Usuário não autenticado");
      res.status(401).json({ message: 'Não autorizado. Por favor, faça login.' });
    },
  };