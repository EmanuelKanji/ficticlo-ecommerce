// Importa los módulos necesarios de Azure Functions
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

// Función principal que responde a solicitudes HTTP
export async function test(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    // Loguea la URL de la solicitud recibida
    context.log(`Http function processed request for url "${request.url}"`);

    // Obtiene el parámetro 'name' de la query o del cuerpo, o usa 'world' por defecto
    const name = request.query.get('name') || await request.text() || 'world';

    // Devuelve la respuesta con el saludo
    return { body: `Hello, ${name}!` };
};

// Configura la función HTTP en Azure Functions
app.http('test', {
    methods: ['GET', 'POST'], // Métodos permitidos
    authLevel: 'anonymous',  // Nivel de autenticación
    handler: test            // Función que maneja la solicitud
});
