import {
	APIGatewayProxyEvent,
	APIGatewayProxyResultV2,
	Handler
} from "aws-lambda";

import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
const crypto = require("crypto");

export const handler: Handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2> => {
	// DB connect params, can come from environment vars
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
        IndexName: 'hashurl-index',
		KeyConditionExpression: "#property = :value",
		ExpressionAttributeNames: {
			"#property": "hashurl"
		},
		ExpressionAttributeValues: {
			":value": { S: hashUrl }
		},
		ProjectionExpression: "shorturl"
	};

	try {
		const getItemResult = await queryDynamoDB(dynamodbClient, getItemByHashParams);
		if (!getItemResult) {
			return "not found".concat(hashUrl);
		}
        return getItemResult.shorturl;
	} catch (err) {
		console.log(err);
		return err;
	}
};

async function queryDynamoDB(dynamodbClient, params) {
	const command = new QueryCommand(params);
	const data = await dynamodbClient.send(command);
	return data.Items;
}
