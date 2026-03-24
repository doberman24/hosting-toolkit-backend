import { IApp } from "./types/server.types";
require('dotenv').config();
const App = require('./App');
const Routes = require('./routes');

const app: IApp = new App(
    process.env.PORT || 3000,
    process.env.HOST,
    process.env.CLIENT_URL,
    new Routes()
);

app.listen();