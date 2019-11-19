import express, { Response, Request } from 'express';
import bodyParser from 'body-parser';

import './config';
import apiServiceV1 from '../apiServiceV1';
import apiService from '../apiService';
import WebhookResource from '../models/WebhookResource';

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

apiService.init({
  clientId,
  clientSecret,
  webhookSecret,
  host: 'http://localhost:4002',
});

const app = express();

app.use(bodyParser.json());

app.post('/webhooks/v1', async (req: Request, res: Response) => {
  const signature = req.headers['x-signature'] as string;
  const isValid = apiServiceV1.validateSignature(signature, req.body);
  if (isValid) {
    const webhookResource = req.body as WebhookResource;
    try {
      await apiServiceV1.auth();
      const verificationResource = await apiServiceV1.fetchVerification(webhookResource.resource);
      console.debug('verificationResource', verificationResource);
    } catch (err) {
      console.error(err);
    }
  } else {
    console.error('Not valid signature');
  }
  res.sendStatus(204);
});

app.post('/webhooks/v2', async (req: Request, res: Response) => {
  const signature = req.headers['x-signature'] as string;
  const isValid = apiService.validateSignature(signature, req.body);
  if (isValid) {
    const webhookResource = req.body as WebhookResource;
    try {
      await apiService.auth();
      const verificationResource = await apiService.fetchVerification(webhookResource.resource);
      console.debug('verificationResource', verificationResource);
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
