const Lead = require('../models/Lead');

module.exports = async (req, res) => {
  try {
    const { name, email, source } = req.body;
    const lead = await Lead.create({ name, email, source });
    res.status(201).json({ message: 'Lead received', id: lead._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};