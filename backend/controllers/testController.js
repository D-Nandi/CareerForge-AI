// GET /api/test
exports.test = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Resumatic API is running.',
  });
};
