import {
	APIGatewayProxyEvent,
	APIGatewayProxyResultV2,
	Handler
} from "aws-lambda";

import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";

export const handler: Handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2> => {
	const dbClient = new DynamoDBClient({ region: "us-west-2" });
	const command = new ListTablesCommand({});

	try {
		const results = await dbClient.send(command);
		console.log(results.TableNames.join("\n"));
	} catch (err) {
		console.error(err);
	}

	return "";
};
