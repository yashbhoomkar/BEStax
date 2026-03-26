function getHealth(req, res) {
  res.json({
    status: "ok",
    service: "beprojectstax-mern-backend"
  });
}

module.exports = {
  getHealth
};
