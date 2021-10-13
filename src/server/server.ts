const cors = require('cors')
import express = require('express');
import bodyParser = require('body-parser');
import { ConfigurationManager, IServerConfig } from '../configuration/configurationManager';
import { HealthService } from './healthService';
import { DefaultRouter } from 'src/routers/defaultRouter';

process.on('uncaughtException', function (err) {
    console.log('!!!!!!!!!!!!!!!!!!!!!! uncaughtException !!!!!!!!!!!!!!!!!!!')
    console.log(err);
})
// require('events').EventEmitter.prototype._maxListeners = 60;

// Init express engine
const app: express.Application = express();
app.use(cors());
app.use(bodyParser.json(
    {
        limit: '10mb',
    }));


const serverConfig: IServerConfig = ConfigurationManager.getServerConfig();
const healthService = new HealthService(serverConfig);
app.use(
    "/",
    DefaultRouter.apply(express.Router(), healthService)
);
healthService.run();

app.listen(serverConfig.port, function () {
    console.log(`App is listening on port ${ConfigurationManager.getServerPort()}!`);
});