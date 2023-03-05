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
	const TableName = "urls";

	const getItemParams = {
		TableName,
		Key: {
			partition_key: { S: "test" }
		},
	};

	const dynamodbClient = new DynamoDBClient({ region: REGION });
	const getItemCommand = new GetItemCommand(getItemParams);

	try {
		const response = await dynamodbClient.send(getItemCommand);
		return response.Item;
	} catch (err) {
        console.log(err);
		return err;
	}
};
