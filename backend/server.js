require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
const auth = require('./middleware/auth');

app.use('/api/auth', require('./routes/auth'));

// Public: the portfolio contact form can create a lead without logging in
app.post('/api/leads', require('./routes/leadsPublic'));

// Everything else on /api/leads needs the admin token
app.use('/api/leads', auth, require('./routes/leads'));

app.get('/', (req, res) => {
  res.send('Mini CRM API is running');
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });