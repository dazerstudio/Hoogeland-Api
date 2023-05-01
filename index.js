import express from 'express';
import http from 'http';
import cors from 'cors';
import get from './get.js';
import login from './login.js';

const app = express()
const server = http.createServer(app);

app.use(cors())
app.use(express.json({
  strict: false
}));

app.post('/get', get);
app.post('/login', login);

server.listen(9000);

console.log('Listening on port 9000!')