const express = require('express');
const path = require('path');

class Server
{
    constructor() {
        this.app = express();
        this.port = 5000;
        
        

        this.middlewares();
    }

    middlewares() {
        this.app.use(express.static(path.join(__dirname, "../yahtzee-client/build")));
    }

    routes() {
        this.app.get("*", (req, res) => {
            res.sendFile(path.join(__dirname, "../yahtzee-client/build/index.html"));
        });
    }
    
    listen() {
        this.app.listen(this.port, () => {
            console.log("Yahtzee server running on port: ", this.port);
        });
    }
}

module.exports = Server;