export default function showAuth(req, res) {
  res.send({ auth: req.user });
}
