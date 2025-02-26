import axios from "axios";

/* Explicación:
1- En la BD se almacena solo la ruta, no el archivo, para evitar que la BD crezca innecesariamente.
2- El back guarda archivos en el sistema de archivos (uploads/), mediante el service FileStorageService.
3- Creo un endpoint para descargar archivos (GET /archivos_adjuntos/{filename}) en ArchivoAdjuntoController:
    -Spring Boot recibe la solicitud con el nombre del archivo.
    -Busca el archivo en la carpeta uploads/ (C:/Users/rodri/grupo8/uploads/).
    -Si el archivo existe:Lo convierte en un Resource (es como si pusiera el archivo dentro de una caja, para que el usuario pueda descargarlo sin que el backend exponga directamente su sistema de archivos. ) y lo devuelve como descarga (attachment:Le dice al navegador que descargue el archivo en lugar de abrirlo en el navegador.).
4-  Cuando el usuario hace clic en "Descargar": 
1️⃣ getArchivoAdjuntoRequest() envía una solicitud GET con la ruta corregida al backend.
2️⃣ El backend encuentra y devuelve el archivo.
3️⃣ React recibe el blob (Binary Large Object es un objeto en JavaScript que representa datos binarios como imágenes, PDFs, documentos, etc.), lo convierte en un URL y lo fuerza a descargarse.
    */ 

// Base URL para las solicitudes
const BASE_URL = "http://localhost:8080/archivos_adjuntos";

// Recupera un archivo adjunto por su ruta.
export const getArchivoAdjuntoRequest = async (token: string, ruta: string) => {
    try {
        if (!ruta) {
            throw new Error("La ruta del archivo está vacía.");
        }

        // Asegura que la ruta NO tenga "uploads/" y que las barras sean correctas
        const archivoRuta = ruta.replace(/^uploads[\\/]+/, "").replace(/\\/g, "/").trim();

        const response = await axios.get(`${BASE_URL}/${encodeURIComponent(archivoRuta)}`, {
            responseType: "blob", // Indicar que la respuesta es un archivo binario
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        return response.data; // Devuelve el archivo como Blob
    } catch (error) {
        console.error("Error en getArchivoAdjuntoRequest:", error);
        throw error;
    }
};

export const deleteArchivoAdjuntoRequest = async (token:string, id:number) =>{
    try {
        const response = await axios.post(`${BASE_URL}/delete/${id}`, null, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        console.error("Error al eliminar archivo adjunto", error);
    }
};
