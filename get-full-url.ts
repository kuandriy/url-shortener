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
	const TableName = "urlshortener";

	const queryString = event.queryStringParameters;
	if (!queryString || !queryString.shorturl) {
		return "Short url is required";
	}
    // Get original Url from db
	const getItemParams = {
		TableName,
		Key: {
			short: { S: queryString.shorturl }
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
