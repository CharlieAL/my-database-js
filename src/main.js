import fs from "fs";
import path from "path";
import { db } from "./db.js";

// this is for testing purposes only
const pathData = path.join(process.cwd(), "data");

(() => {
	// delete files inside data folder
	try {
		const files = fs.readdirSync(pathData);
		for (const file of files) {
			fs.unlinkSync(path.join(pathData, file));
		}
		console.log("All data deleted.");
	} catch (err) {
		console.error("Error while deleting data:", err);
	}
})();

const database = new db("todo");

database.createTable(
	"tasks",
	{
		id: "number",
		title: "string",
		completed: "boolean",
	},
	{
		primaryKey: "id",
		autoIncrement: true,
		createdAt: true,
	},
);

const record = {
	title: "Finish the project",
	completed: false,
};

database.insert("tasks", record);

console.log("Table 'tasks' created successfully.");
