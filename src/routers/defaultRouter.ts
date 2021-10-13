import { Router } from 'express';
import { HealthService } from '../server/healthService';

// https://expressjs.com/en/guide/using-middleware.html
export class DefaultRouter {

    public static apply(router: Router, healthService: HealthService) {
        router.get('/snapshot', async (req, res) => {
            try {
                const snapshot = healthService.getSnapshot();
                return res.status(200).send({
                    dataModel: snapshot[2],
                    state: snapshot[3],
                });
            } catch (error) {
                return res.sendStatus(500).send("snapshot error");
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

