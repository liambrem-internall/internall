const express = require('express')
require('dotenv').config();

const app = express()
const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

const connectDB = require('./utils/db');
connectDB();