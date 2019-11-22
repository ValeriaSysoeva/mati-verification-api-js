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
1. `yarn runAllFlow` - it will run node app that creates identity and send input with document photos and liveness video on one request

P.S. If you have the server example started, you should see incoming webhooks as well.  
 
