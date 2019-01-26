export default function serveAuth(req, res) {
  res.send({ auth: req.user });
}
