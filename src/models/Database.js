import { FileManager } from "../utils/FileManager.js";
import { SchemaValidator } from "../validators/SchemaValidator.js";
import { Table } from "./Table.js";

/**
 * Clase principal de la base de datos
 */
export class Database {
	/**
	 * @param {string} [dbName="defaultDB"] - Nombre de la base de datos
	 * @param {string} [dataPath="data"] - Ruta del directorio de datos
	 */
	constructor(dbName = "defaultDB", dataPath = "data") {
		/** @type {string} */
		this.dbName = dbName;

		/** @type {FileManager} */
		this.fileManager = new FileManager(dataPath);

		/** @type {string} */
		this.dbPath = this.fileManager.getDatabasePath(dbName);

		/** @type {Object.<string, Table>} */
		this.data = this.fileManager.readDatabase(this.dbPath);
	}

	/**
	 * Crea una nueva tabla en la base de datos
	 * @param {string} tableName - Nombre de la tabla
	 * @param {Object.<string, string>} [columns={id: "number"}] - Columnas de la tabla
	 * @param {Object} [options={}] - Opciones de configuración
	 * @param {string} [options.primaryKey] - Clave primaria
	 * @param {boolean} [options.createdAt] - Incluir timestamp de creación
	 * @param {boolean} [options.updatedAt] - Incluir timestamp de actualización
	 * @param {boolean} [options.autoIncrement] - Auto-incrementar clave primaria
	 * @throws {Error} Si la tabla ya existe o hay errores de validación
	 */
	createTable(tableName, columns = { id: "number" }, options = {}) {
		if (this.data[tableName]) {
			throw new Error(`Table ${tableName} already exists.`);
		}

		// Validar esquema
		SchemaValidator.validateColumns(columns);

		if (options.primaryKey) {
			SchemaValidator.validatePrimaryKey(columns, options.primaryKey);
		}

		// Crear tabla
		const table = new Table(columns, options);
		// primer errir table.getAll is not a function
		this.data[tableName] = table.getAll();
		this.#save();
	}

	/**
	 * Inserta un registro en una tabla
	 * @param {string} tableName - Nombre de la tabla
	 * @param {Object} record - Registro a insertar
	 * @throws {Error} Si la tabla no existe o el registro es inválido
	 */
	insert(tableName, record) {
		SchemaValidator.validateTableExists(this.data, tableName);

		const table = this.data[tableName];

		// Crear instancia temporal de tabla para manipulación
		const tableInstance = new Table(table.columns, table.metadata);
		tableInstance.data = table.data;
		tableInstance.metadata = table.metadata;

		// Añadir registro
		const newRecord = tableInstance.addRecord(record);

		SchemaValidator.validateRecord(table.columns, newRecord);

		// Actualizar datos de la tabla
		this.data[tableName] = tableInstance.getAll();
		this.#save();
	}

	/**
	 * Obtiene todos los registros de una tabla
	 * @param {string} tableName - Nombre de la tabla
	 * @returns {TableSchema} Datos completos de la tabla
	 * @throws {Error} Si la tabla no existe
	 */
	getAll(tableName) {
		SchemaValidator.validateTableExists(this.data, tableName);
		return this.data[tableName];
	}

	/**
	 * Obtiene los nombres de todas las tablas
	 * @returns {string[]} Array con los nombres de las tablas
	 */
	getTableNames() {
		return Object.keys(this.data);
	}

	/**
	 * Elimina una tabla
	 * @param {string} tableName - Nombre de la tabla a eliminar
	 * @returns {boolean} True si se eliminó correctamente
	 * @throws {Error} Si la tabla no existe
	 */
	dropTable(tableName) {
		SchemaValidator.validateTableExists(this.data, tableName);
		delete this.data[tableName];
		this.#save();
		return true;
	}

	/**
	 * Guarda los datos actuales en el archivo
	 * @private
	 */
	#save() {
		this.fileManager.writeDatabase(this.dbPath, this.data);
	}
}
