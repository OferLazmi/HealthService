import { Router } from 'express';
import { HealthService } from '../server/healthService';

// https://expressjs.com/en/guide/using-middleware.html
export class DefaultRouter {

    public static apply(router: Router, healthService: HealthService) {
        router.get('/healthCheck', async (req, res) => {
            try {
                return res.status(200).send("o");
            } catch (error) {
                return res.sendStatus(500).send("pong error");
            }
        });

        router.get('/restart', async (req, res) => {
            try {
                return res.status(200).send("done");
            } catch (error) {
                return res.status(500).send(error.message);
            }
        });
        
        return router;
    }
}

