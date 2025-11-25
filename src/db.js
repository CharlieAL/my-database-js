import fs, { writeFileSync } from "fs";
import path from "path";

const pathData = path.join(process.cwd(), "data");

const baseTable = {
	metadata: {
		lastId: 0,
		primaryKey: "id",
		autoIncrement: false,
		createdAt: new Date().toISOString(),
	},
	columns: {},
	data: [],
};

export class db {
	constructor(dbName = "defaultDB") {
		this.dbName = dbName;
		this.dbPath = path.join(pathData, `${this.dbName}.json`);
		this.data = {};
		this.#initializeDB();
		this.#loadDB();
		this.base = baseTable;
	}

	// Initialize the data directory
	1;
	#initializeDB() {
		if (!fs.existsSync(pathData)) {
			fs.mkdirSync(pathData);
		}
	}
	// Load data from the JSON file
	#loadDB() {
		if (!fs.existsSync(this.dbPath)) {
			writeFileSync(this.dbPath, JSON.stringify({}));
		}
		const dbContent = fs.readFileSync(this.dbPath, "utf-8");
		this.data = JSON.parse(dbContent);
	}

	// Save data to the JSON file
	#save() {
		writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
	}

	#validateColumnType(colName, type) {
		const validTypes = ["string", "number", "boolean", "date"];
		if (!validTypes.includes(type.toLowerCase())) {
			throw new Error(
				`Invalid column ${colName} type: ${type}. Valid types are: ${validTypes.join(", ")}`,
			);
		}
	}

	#validateRecord(table, newRecord) {
		// Validate columns and types
		console.log("columns", table.columns);
		for (const [colName, colType] of Object.entries(table.columns)) {
			if (!(colName in newRecord)) {
				throw new Error(`Missing column ${colName} in the record.`);
			}

			// can be improved to handle null or undefined values
			const value = newRecord[colName];
			switch (colType) {
				case "string":
					if (typeof value !== "string") {
						throw new Error(`Column ${colName} must be a string.`);
					}
					break;
				case "number":
					if (typeof value !== "number") {
						throw new Error(`Column ${colName} must be a number.`);
					}
					break;
				case "boolean":
					if (typeof value !== "boolean") {
						throw new Error(`Column ${colName} must be a boolean.`);
					}
					break;
				case "date":
					if (isNaN(Date.parse(value))) {
						throw new Error(`Column ${colName} must be a valid date.`);
					}
					break;
				default:
					throw new Error(
						`Unknown column type ${colType} for column ${colName}.`,
					);
			}
			// here
		}
	}

	// create create tables
	createTable(
		tableName,
		columns = {
			id: "number",
		},
		opt = {
			primaryKey: "id",
			createdAt: false,
			updatedAt: false,
			autoIncrement: false,
		},
	) {
		//validate columns

		if (typeof columns !== "object" || Array.isArray(columns)) {
			throw new Error(
				"Columns must be an object with column names as keys and data types as values.",
			);
		}

		// Add createdAt and updatedAt columns if specified
		if (opt.createdAt) {
			columns.createdAt = "date";
		}

		if (opt.updatedAt) {
			columns["updatedAt"] = "date";
		}

		// Validate each column type
		for (const [colName, colType] of Object.entries(columns)) {
			this.#validateColumnType(colName, colType);
		}

		this.base.metadata.primaryKey =
			opt.primaryKey || this.base.metadata.primaryKey;

		this.base.metadata.autoIncrement =
			opt.autoIncrement || this.base.metadata.autoIncrement;

		if (!(opt.primaryKey in columns)) {
			throw new Error(
				`Primary key ${opt.primaryKey} is not defined in columns.`,
			);
		}

		const dbContent = fs.readFileSync(this.dbPath, "utf-8");
		this.data = JSON.parse(dbContent);

		if (this.data[tableName]) {
			throw new Error(`Table ${tableName} already exists.`);
		}

		this.data[tableName] = { ...this.base, columns };
		this.#save();
	}

	// Insert data into a table
	// TODO: can be improved to handle record[] insertion
	insert(tableName, record) {
		if (!this.data[tableName]) {
			throw new Error(`Table ${tableName} does not exist.`);
		}

		const table = this.data[tableName];
		// add createdAt timestamp if the column exists
		if (table.columns.createdAt) {
			record.createdAt = new Date().toISOString();
		}
		// add updatedAt timestamp if the column exists
		if (table.columns.updatedAt) {
			record.updatedAt = new Date().toISOString();
		}

		// handle primary key auto-increment is not provided
		// if autoIncrement is true and primary key is not in record

		if (
			table.metadata.autoIncrement &&
			!(table.metadata.primaryKey in record)
		) {
			table.metadata.lastId += 1;
			record[table.metadata.primaryKey] = table.metadata.lastId;
		}

		const newRecord = { ...record };
		// Validate the record against the table schema
		this.#validateRecord(table, newRecord);

		table.data.push(newRecord);
		this.#save();
	}
	// Retrieve all records from a table
	getAll(tableName) {
		if (!this.data[tableName]) {
			throw new Error(`Table ${tableName} does not exist.`);
		}
		return this.data[tableName];
	}
}
/*
 * json
 * {
 *  "tableName":{
 *    "data":[
 *    { "column1": "value1", "column2": "value2", ... },
 *    ],
 *    "columns": {
 *      "column1": "type",
 *      "column2": "type",
 *      ...
 *    },
 *  }
 * }
 * */
