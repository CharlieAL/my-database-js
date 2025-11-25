/**
 * Validador de esquemas y tipos de datos para la base de datos
 */
export class SchemaValidator {
	/** @type {string[]} */
	static validTypes = ["string", "number", "boolean", "date"];

	/**
	 * Valida el tipo de una columna
	 * @param {string} colName - Nombre de la columna
	 * @param {string} type - Tipo de dato a validar
	 * @throws {Error} Si el tipo no es válido
	 */
	static validateColumnType(colName, type) {
		if (!SchemaValidator.validTypes.includes(type.toLowerCase())) {
			throw new Error(
				`Invalid column ${colName} type: ${type}. Valid types are: ${SchemaValidator.validTypes.join(", ")}`,
			);
		}
	}

	/**
	 * Valida un objeto de columnas
	 * @param {Object.<string, string>} columns - Columnas a validar
	 * @throws {Error} Si las columnas no son válidas
	 */
	static validateColumns(columns) {
		if (typeof columns !== "object" || Array.isArray(columns)) {
			throw new Error(
				"Columns must be an object with column names as keys and data types as values.",
			);
		}

		for (const [colName, colType] of Object.entries(columns)) {
			SchemaValidator.validateColumnType(colName, colType);
		}
	}

	/**
	 * Valida un registro contra el esquema de columnas
	 * @param {Object.<string, string>} columns - Esquema de columnas
	 * @param {Object} record - Registro a validar
	 * @throws {Error} Si el registro no cumple con el esquema
	 */
	static validateRecord(columns, record) {
		for (const [colName, colType] of Object.entries(columns)) {
			if (!(colName in record)) {
				throw new Error(`Missing column ${colName} in the record.`);
			}

			const value = record[colName];
			SchemaValidator.#validateValueType(colName, colType, value);
		}
	}

	/**
	 * Valida el tipo de un valor específico
	 * @param {string} colName - Nombre de la columna
	 * @param {string} colType - Tipo esperado
	 * @param {*} value - Valor a validar
	 * @throws {Error} Si el valor no coincide con el tipo esperado
	 * @private
	 */
	static #validateValueType(colName, colType, value) {
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
	}

	/**
	 * Valida que la clave primaria exista en las columnas
	 * @param {Object.<string, string>} columns - Columnas de la tabla
	 * @param {string} primaryKey - Clave primaria a validar
	 * @throws {Error} Si la clave primaria no existe en las columnas
	 */
	static validatePrimaryKey(columns, primaryKey) {
		if (!(primaryKey in columns)) {
			throw new Error(`Primary key ${primaryKey} is not defined in columns.`);
		}
	}

	/**
	 * Valida la existencia de una tabla
	 * @param {Object} data - Datos de la base de datos
	 * @param {string} tableName - Nombre de la tabla a validar
	 * @throws {Error} Si la tabla no existe
	 */
	static validateTableExists(data, tableName) {
		if (!data[tableName]) {
			throw new Error(`Table ${tableName} does not exist.`);
		}
	}
}
