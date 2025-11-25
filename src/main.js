import { Database } from "./models/Database.js";

/**
 * Ejemplo de uso de la base de datos
 */
// Crear instancia de base de datos
console.log("🚀 Iniciando ejemplo de uso de la base de datos...");
const db = new Database("myDatabase");
console.log('📂 Base de datos "myDatabase" creada o cargada exitosamente');

try {
	// Crear tabla de usuarios
	// eleiminar la tabla si ya existe
	const $tableNames = db.getTableNames();
	if ($tableNames.includes("users")) {
		console.log('🗑 Eliminando tabla "users" existente...');
		db.dropTable("users");
		console.log('✅ Tabla "users" eliminada exitosamente');
	}
	console.log('🛠 Creando tabla "users"...');
	db.createTable(
		"users",
		{
			id: "number",
			name: "string",
			email: "string",
			age: "number",
			isActive: "boolean",
		},
		{
			primaryKey: "id",
			autoIncrement: true,
			createdAt: true,
			updatedAt: true,
		},
	);

	console.log('✅ Tabla "users" creada exitosamente');

	console.log('📝 Insertando usuarios en la tabla "users"...');
	// Insertar algunos usuarios
	db.insert("users", {
		name: "Juan Pérez",
		email: "juan@example.com",
		age: 30,
		isActive: true,
	});

	db.insert("users", {
		name: "María García",
		email: "maria@example.com",
		age: 25,
		isActive: true,
	});

	console.log("✅ Usuarios insertados exitosamente");

	// Obtener todos los usuarios
	const users = db.getAll("users");
	console.log("📊 Usuarios en la base de datos:");
	console.log(JSON.stringify(users, null, 2));

	// Mostrar nombres de tablas
	const tableNames = db.getTableNames();
	console.log("📋 Tablas disponibles:", tableNames);
} catch (error) {
	console.error("❌ Error:", error.message);
}
