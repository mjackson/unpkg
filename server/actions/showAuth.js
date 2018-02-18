function showAuth(req, res) {
  res.send({ auth: req.user });
}

module.exports = showAuth;
