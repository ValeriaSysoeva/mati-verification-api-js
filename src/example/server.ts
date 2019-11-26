import express, { Response, Request } from 'express';
import bodyParser from 'body-parser';

import './config';
import {
  apiService,
  sdkService as apiServiceV1,
} from '../main';
import WebhookResource from '../models/WebhookResource';
import VerificationResource from '../models/VerificationResource';

const port = process.env.PORT || 3000;

const clientId = process.env.CLIENT_ID || 'default';
const clientSecret = process.env.CLIENT_SECRET || 'default';
const webhookSecret = process.env.WEBHOOK_SECRET || 'default';

apiServiceV1.init({
  clientId,
  clientSecret,
  webhookSecret,
  host: process.env.API1_HOST, // Optional
});

apiService.init({
  clientId,
  clientSecret,
  webhookSecret,
  host: process.env.API2_HOST, // Optional
});

const app = express();

app.use(bodyParser.json());

app.post('/webhooks/v1', async (req: Request, res: Response) => {
  const signature = req.headers['x-signature'] as string;
  const isValid = apiServiceV1.validateSignature(signature, req.body);
  if (isValid) {
    const webhookResource = req.body as WebhookResource;
    try {
      const verificationResource = await apiServiceV1.fetchResource(webhookResource.resource);
      console.log('verificationResource', verificationResource);
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
      const verificationResource = await apiService
        .fetchResource<VerificationResource>(webhookResource.resource);
      console.log('verificationResource', verificationResource);
      if (webhookResource.eventName === 'verification_completed') {
        if (verificationResource.identity.status === 'reviewNeeded') {
          console.log('Need to review');
          verificationResource.documents.forEach((document) => {
            console.log('Name', document.fields.fullName.value);
          });
        }
      } else if (webhookResource.eventName === 'verification_expired') {
        console.log('User left without completing the flow');
      }
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
