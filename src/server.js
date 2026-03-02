require('dotenv').config();
const App = require('./App');
const Routes = require('./routes');

const app = new App(
    process.env.PORT || 3030,
    process.env.HOST,
    process.env.CLIENT_URL,
    new Routes()
);

app.listen();