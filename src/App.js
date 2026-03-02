const express = require('express');
const cors = require('cors');

module.exports = class App {
    constructor(port, host, url, routes) {
        this.port = port;
        this.host = host;
        this.server = express();
        this.corsOptions = {
            // origin: 'https://smart-subscriptions.ru',
            origin: 'http://localhost:5173',
            credentials: true,
        }
        this.initMiddlewares();
        this.initRoutes(routes);
    };

    initMiddlewares() {
        this.server.use(express.json());
        this.server.use(express.urlencoded({ extended: true }));
        this.server.use(cors(this.corsOptions));
    };

    initRoutes(routes) {
        this.server.use('/api', routes.router);
    };

    //обработка ошибок при http-запросе,и возврат ее клиенту
    initErrorHandling() {
        this.server.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({message: 'Internal Server Error'});
        });
    };

    listen() {
        this.server.listen(this.port, this.host, err => {
            err ? console.log(err) : console.log(`Listen port ${this.port}`);
        });
    }
}