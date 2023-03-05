import {
	APIGatewayProxyEvent,
	APIGatewayProxyResultV2,
	Handler
} from "aws-lambda";

import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
const crypto = require("crypto");

export const handler: Handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2> => {
	const REGION = "us-east-1";
	const TableName = "short-to-original-url";

	if (!event.body) {
		return "Url is required";
	}

	const data = JSON.parse(event.body);

	if (!data.url) {
		return "Url is required";
	}

	const url = data.url;

	// Using url hash to query DB, to find if record already exist
	const hashUrl = crypto.createHash("md5").update(url).digest("hex");

	//DB object
	const dynamodbClient = new DynamoDBClient({ region: REGION });

	// Check if we  have short url for received url
	const getItemByHashParams = {
		TableName,
		Key: {
			hashurl: { S: hashUrl }
		},
		ProjectionExpression: "shorturl"
	};

	const getItemCommand = new GetItemCommand(getItemByHashParams);

	try {
		const dbResult = await dynamodbClient.send(getItemCommand);
		if (dbResult.Item) {
			return dbResult.Item.shorturl.S.concat("     ", hashUrl);
		}
        return  hashUrl;
	} catch (err) {
		console.log(err);
		return err;
	}
};
