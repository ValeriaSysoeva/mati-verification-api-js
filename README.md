#### mati-verification-api

*This library is under intensive development right now, we're making our best to make it better.*

This is an official verification library for Mati Digital Identity Service (https://getmati.com/).
It helps to integrate this solution to your code.

###### API Introduction

* We strongly recommend to use our SDKs to verify your users, since Mati already puts a lot of energy 
into supporting most devices, old and new smartphones, giving out the best UI/UX. But if for some 
reasons you can't use our SDKs, we have an official API where you can send us your users' data that 
we will verify.

* Whether you use our SDKs or API, we return the verification data via webhooks (see sections below).


###### Get started

Install the library:
`npm install` or `yarn install`.

If you use our SDKs for integration, all what you need is:
 1. Create endpoint for receiving webhooks in order to allow our server to send requests to your server. 
 2. Validate signature (not required, but very recommended) in order to make sure the request came from Mati 
 backend.
 3. Perform according business logic on your server. For example, mark user as verified in your database, 
 when the verification completed.   
 4. Get detailed information about verification process of the current user in order to make more elaborated decisions 
 in your code. 
For example:
```js
router.post('/webhooks', async function(req, res) {
  const signature = req.headers['x-signature'];
  const isValid = apiService.validateSignature(signature, req.body);
  if (isValid) {
    const webhookResource = req.body;
    try {
      const verificationResource = await apiService.fetchResource(webhookResource.resource);
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
``` 

##### Example


###### Preparation

1. clone repo 
2. `yarn install`
3. copy `src/example/.env.example` to `src/example/.env`, and put your vars there



###### Run server example

1. `yarn example` - it will run server with a route for webhooks
2. specify webhook URL in Dashboard
    If you use Mati SDK for integration you should use `http://<YOUR_BACKEND_URL>/webhooks/v1`  
    If you use API for integration you should use `http://<YOUR_BACKEND_URL>/webhooks/v2`
    (draw your attention this backend should be available externally, evidently `localhost` will not work)
3. start verification flow, you should see all incoming webhooks logged.

###### Run API flow example
1. `yarn runAllFlow` - it will run node app that creates identity and sends input with document photos and liveness video on one request

P.S. If you have the server example started, you should see incoming webhooks as well.  
 
