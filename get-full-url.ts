import {
	APIGatewayProxyEvent,
	APIGatewayProxyResultV2,
	Handler
} from "aws-lambda";

import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

export const handler: Handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2> => {
	const REGION = "us-east-1";
	const TableName = "short-to-original-url";s
    const localEvent: any = {...event};

	return JSON.stringify(
        {
            requestContext: event.requestContext,
            pathParameters: event.pathParameters,
            body: event.body,
            path: event.path,
            resource: event.resource,
            domainName: event.requestContext.domainName,
            extendedRequestId: event.requestContext.extendedRequestId,
            path1: event.requestContext.resourcePath,
            resourceId: event.requestContext.resourceId,
            localEvent: localEvent.path,
            localEvent1: localEvent.http,

            test:'test'


        }
        ) ;
	const shortUrl = "event.pathParameters";

	// Get original Url from db
	const getItemParams = {
		TableName,
		Key: {
			shorturl: { S: shortUrl }
		},
		ProjectionExpression: "originalurl"
	};

	const dynamodbClient = new DynamoDBClient({ region: REGION });
	const getItemCommand = new GetItemCommand(getItemParams);

	// redirect to original url
	try {
		const dbResult = await dynamodbClient.send(getItemCommand);
		const url = dbResult.Item.originalurl.S;

		const response = {
			statusCode: 302,
			headers: {
				Location: `${url}`
			}
		};

		return response;
	} catch (err) {
		console.log(err);
		return err;
	}
};
