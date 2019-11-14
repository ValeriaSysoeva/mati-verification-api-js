import express, { Response, Request } from 'express';
import bodyParser from 'body-parser';

import './config';
import apiServiceV1 from '../apiServiceV1';
import Webhook from '../models/v1/Webhook';

const port = process.env.PORT || 3000;

const clientId = process.env.CLIENT_ID || 'default';
const clientSecret = process.env.CLIENT_SECRET || 'default';
const webhookSecret = process.env.WEBHOOK_SECRET || 'default';

apiServiceV1.init({
  clientId,
  clientSecret,
  webhookSecret,
  host: 'http://localhost:9000',
});

const app = express();

app.use(bodyParser.json());

app.post('/webhooks', async (req: Request, res: Response) => {
  const signature = req.headers['x-signature'] as string;
  const isValid = apiServiceV1.validateSignature(signature, req.body);
  if (isValid) {
    const webhook = req.body as Webhook;
    try {
      const verification = await apiServiceV1.fetchVerification(webhook.resource);
      console.debug('verification', verification);
    } catch (err) {
      console.error(err);
    }
  } else {
    console.error('Not valid signature');
  }
  res.sendStatus(204);
});

const server = app.listen(port, async () => {
  console.log(
    '  App is running at %d port in %s mode',
    port,
    app.get('env'),
  );
  console.log('  Press CTRL-C to stop\n');
});

export default server;
