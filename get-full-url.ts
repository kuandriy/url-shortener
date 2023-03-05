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

	// Split the path by '/' character and extract the last portion of it
	const pathSplit = event.path.split("/");

	if (pathSplit.length == 1) {
		return "Short url is required";
	}

	const shortUrl = pathSplit[pathSplit.length - 1];

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
