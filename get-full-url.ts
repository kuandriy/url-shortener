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
	const TableName = "short-to-original-url";
    const localEvent: any = {...event};

	return JSON.stringify(
        {
 
            localEvent1: localEvent.requestContext.http.path.split("/")[1],

            test:'test'


        }
        ) ;
	const shortUrl = localEvent.requestContext.http.path.split("/")[1];

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
