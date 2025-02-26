import axios from "axios";

// Base URL para las solicitudes
const BASE_URL = "http://localhost:8080/comentarios";

// Recupera los comentarios de un requerimiento en particular (por codigo).
export const getComentariosByRequerimientoRequest = async (token: string, codigo: string) => {
    try {
        const comentarios = await axios.get(`${BASE_URL}/${codigo}`, {
            headers:{
                Authorization: `Bearer ${token}`,
            },
        });
        return comentarios;
    } catch (error) {
        console.error("Error al obtener los comentarios",error);
    } 
};

// Crear un nuevo comentario con archivos adjuntos
export const createComentarioRequerimientoRequest = async (token: string, formData: FormData) => {
    try {
      const response = await axios.post(`${BASE_URL}/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Necesario para enviar archivos
        },
      });
      if (response.status === 201) {
        return response.data; // Aseguramos que devolvemos los datos del comentario
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
  
    } catch (error) {
      console.error("Error al crear comentario", error);
      throw error; // Propaga el error para manejarlo más arriba
    }
  };