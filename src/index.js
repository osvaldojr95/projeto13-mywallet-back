import express, { json } from 'express';
import cors from 'cors';
import routes from './routes/routes.js'

const app = express();
app.use(json());
app.use(cors());
app.use(routes);

app.listen(5002, () => {
    console.log('Servidor online');
});