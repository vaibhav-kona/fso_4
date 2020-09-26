const http = require('http')
const express = require('express')
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const blogsRouter = require('./controllers/blogs');

const password = process.argv[2];
const mongoUrl = `mongodb+srv://fso_3c:${password}@cluster0.ih115.mongodb.net/bloglist?retryWrites=true&w=majority`
mongoose.connect(mongoUrl, {
  useNewUrlParser: true, useUnifiedTopology: true,
  useFindAndModify: false, useCreateIndex: true
}).then(() => {
  console.log("Connected to MongoDB")
})

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter);

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})