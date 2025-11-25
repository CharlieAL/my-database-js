import fs from "fs";
import path from "path";

/**
 * Gestor de archivos para operaciones de lectura/escritura
 */
export class FileManager {
	/**
	 * @param {string} dataPath - Ruta del directorio de datos
	 */
	constructor(dataPath) {
		/** @type {string} */
		this.dataPath = dataPath;
		this.initializeDataDirectory();
	}

	/**
	 * Inicializa el directorio de datos si no existe
	 * @private
	 */
	initializeDataDirectory() {
		if (!fs.existsSync(this.dataPath)) {
			fs.mkdirSync(this.dataPath, { recursive: true });
		}
	}

	/**
	 * Lee el contenido de la base de datos
	 * @param {string} dbPath - Ruta del archivo de base de datos
	 * @returns {Object} Datos de la base de datos
	 */
	readDatabase(dbPath) {
		if (!fs.existsSync(dbPath)) {
			this.writeDatabase(dbPath, {});
			return {};
		}
		const dbContent = fs.readFileSync(dbPath, "utf-8");
		return JSON.parse(dbContent);
	}

	/**
	 * Escribe datos en la base de datos
	 * @param {string} dbPath - Ruta del archivo de base de datos
	 * @param {Object} data - Datos a escribir
	 */
	writeDatabase(dbPath, data) {
		fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
	}

	/**
	 * Obtiene la ruta completa del archivo de base de datos
	 * @param {string} dbName - Nombre de la base de datos
	 * @returns {string} Ruta completa del archivo
	 */
	getDatabasePath(dbName) {
		return path.join(this.dataPath, `${dbName}.json`);
	}

	/**
	 * Verifica si existe un archivo de base de datos
	 * @param {string} dbPath - Ruta del archivo de base de datos
	 * @returns {boolean} True si el archivo existe
	 */
	databaseExists(dbPath) {
		return fs.existsSync(dbPath);
	}
}
