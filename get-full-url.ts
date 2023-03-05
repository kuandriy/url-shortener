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

	const getItemParams = {
		TableName,
		Key: {
            "short": { S: "test" },
		},
		ProjectionExpression: "originalurl"
	};

	const dynamodbClient = new DynamoDBClient({ region: REGION });
	const getItemCommand = new GetItemCommand(getItemParams);

	try {
		const response = await dynamodbClient.send(getItemCommand);
		return response.Item.originalurl.S;
	} catch (err) {
        console.log(err);
		return err;
	}
};
