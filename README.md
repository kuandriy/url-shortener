# url shortener
Serverless with github actions

## Contains two lambda functions 
- **create-short-url**
- - Responsible for generating new short urls
- - Protected by AIM role and require AWS signature authorization with AccessKey and SecretKey
- - Function first check if short url for given url already has been generated and if yes will **return 
    the same short url for any given url**
    deployed endpoint https://hv76yfrcdizseseo3yekwe2ali0rkqok.lambda-url.us-east-1.on.aws
    `METHOD POST`
    Accepted Payload 
    ```json
    {"url":"https://example.com/documents/fun/cats"}
    ```
    and the response will be a short url

    ```json
    https://6e3hcu7a45bqgzmrvkxvbrag4q0wbvnj.lambda-url.us-east-1.on.aws/8x-v
    ```
    short url in this example **8x-v** 

- **get-full-utl**
- - Responsible redirecting from short url yo original 
- - Available without Authentication
- - Function first check if short url for given url already has been generated and if yes will **return 
    the same short url for any given url**

    ###deployed endpoint https://hv76yfrcdizseseo3yekwe2ali0rkqok.lambda-url.us-east-1.on.aws

    Accepted url example 
    ```json
     https://6e3hcu7a45bqgzmrvkxvbrag4q0wbvnj.lambda-url.us-east-1.on.aws/8x-v
     should redirect to original https://example.com/documents/fun/cats
    ```
## Deployment
- both lambda functions use ``GitHub actions`` to build and deploy code to AWS
- git repo should should have `AWS_ACCESS_KEY_ID` and AWS_SECRET_ACCESS_KEY configured

## Additional resources used
- DynamoDB

