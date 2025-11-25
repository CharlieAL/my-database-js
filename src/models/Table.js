/**
 * @typedef {Object} TableMetadata
 * @property {number} lastId
 * @property {string} primaryKey
 * @property {boolean} autoIncrement
 * @property {string} createdAt
 */

/**
 * @typedef {Object} TableOptions
 * @property {string} [primaryKey]
 * @property {boolean} [createdAt]
 * @property {boolean} [updatedAt]
 * @property {boolean} [autoIncrement]
 */

/**
 * @typedef {Object} TableSchema
 * @property {TableMetadata} metadata
 * @property {Object.<string, string>} columns
 * @property {Array.<Object>} data
 */

/**
 * Clase que representa una tabla de base de datos
 * ejemplo:
 * const userTable = new Table(
 *   { name: "string", age: "number" },
 *   { primaryKey: "userId", createdAt: true, autoIncrement: true }
 * );
 */

export class Table {
	/**
	 * @param {Object.<string, string>} columns - Columnas de la tabla
	 * @param {TableOptions} [options={}] - Opciones de configuración
	 */
	constructor(columns, options = {}) {
		/** @type {TableMetadata} */
		this.metadata = {
			lastId: 0,
			primaryKey: options.primaryKey || "id",
			autoIncrement: options.autoIncrement || false,
			createdAt: new Date().toISOString(),
		};

		/** @type {Object.<string, string>} */
		this.columns = { ...columns };

		/** @type {Array.<Object>} */
		this.data = [];

		this.#addTimestampColumns(options);
	}

	/**
	 * Añade columnas de timestamp según las opciones
	 * @param {TableOptions} options - Opciones de configuración
	 * @private
	 */
	#addTimestampColumns(options) {
		if (options.createdAt) {
			this.columns.createdAt = "date";
		}
		if (options.updatedAt) {
			this.columns.updatedAt = "date";
		}
	}

	/**
	 * Añade un nuevo registro a la tabla
	 * @param {Object} record - Registro a añadir
	 * @returns {Object} El registro añadido con metadatos
	 */
	addRecord(record) {
		const newRecord = { ...record };
		const currentTime = new Date().toISOString();

		// Añadir timestamps
		if (this.columns.createdAt && !newRecord.createdAt) {
			newRecord.createdAt = currentTime;
		}
		if (this.columns.updatedAt && !newRecord.updatedAt) {
			newRecord.updatedAt = currentTime;
		}

		// Manejar auto-incremento
		if (
			this.metadata.autoIncrement &&
			!(this.metadata.primaryKey in newRecord)
		) {
			this.metadata.lastId += 1;
			newRecord[this.metadata.primaryKey] = this.metadata.lastId;
		}

		this.data.push(newRecord);
		return newRecord;
	}
	/**
	 * Obtiene el esquema de columnas de la tabla
	 * @returns {Object.<string, string>} Columnas de la tabla
	 */
	getColumns() {
		return this.columns;
	}

	/**
	 * Obtiene los metadatos de la tabla
	 * @returns {TableMetadata} Metadatos de la tabla
	 */
	getMetadata() {
		return this.metadata;
	}
}
