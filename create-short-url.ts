import {
	APIGatewayProxyEvent,
	APIGatewayProxyResultV2,
	Handler
} from "aws-lambda";

import { nanoid } from "nanoid";

import {
	DynamoDBClient,
	QueryCommand,
	PutItemCommand
} from "@aws-sdk/client-dynamodb";
const crypto = require("crypto");
//DB object
const REGION = "us-east-1";
const TableName = "short-to-original-url";
const dynamodbClient = new DynamoDBClient({ region: REGION });
const shortUrlLength = 4; // should come from env vars

export const handler: Handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2> => {

    // Lambda public URL for test
	let domain = process.env.domain; 

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

	// Check if we  have short url for received url
	const getItemByHashParams = {
		TableName,
		IndexName: "hashurl-index",
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
		const getItemResult = await queryDynamoDB(getItemByHashParams);
        // If short Url already exists then return, do not generate new one
		if (getItemResult[0]) {
			return domain.concat("/", getItemResult[0].shorturl.S);
		}
	} catch (err) {
		console.log(err);
		return err;
	}

	// Generate new short url
	const newShortUrl = await generateNewShortUrl();
	const saveParams = {
		TableName,
		Item: {
			shorturl: { S: newShortUrl },
			originalurl: { S: url },
			hashurl: { S: hashUrl }
		}
	};

	const command = new PutItemCommand(saveParams);

	try {
        // save to db
		await dynamodbClient.send(command);
        // return new Url
		return domain.concat("/", newShortUrl);
	} catch (err) {
		console.log(err);
		return err;
	}
};

async function queryDynamoDB(params) {
	const command = new QueryCommand(params);
	const data = await dynamodbClient.send(command);
	return data.Items;
}

async function generateNewShortUrl() {
    // Generate new short id
	const shortUrl = nanoid(shortUrlLength); 
	const getItemParams = {
		TableName,
		Key: {
			shorturl: { S: shortUrl }
		}
	};

    // Check if short uri already in use
	const getItemResult = await queryDynamoDB(getItemParams);
	if (!getItemResult[0]) {
        // If not taken return
		return shortUrl;
	}

    // Run it self recursively
	return generateNewShortUrl();
}
