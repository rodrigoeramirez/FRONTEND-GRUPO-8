import axios from 'axios';

// Base URL para las solicitudes
const BASE_URL = "http://localhost:8080/requerimiento";

// Obtener todos los requerimientos
export const getRequerimientosRequest = async (token: string) => {
    try {
        const response = await axios.get('http://localhost:8080/requerimiento', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        console.error("Error al obtener los requerimientos", error);
    }
};

// Obtener el siguiente numero secuencial
export const getUltimoSecuencialRequest = async (tipoRequerimientoId:number,token: string) => {
    try {
        const response = await axios.get(`http://localhost:8080/requerimiento/ultimo-secuencial/${tipoRequerimientoId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        console.error("Error al obtener el ultimo numero secuencial", error);
    }
};

// Crear un nuevo requerimiento con archivos adjuntos
export const createRequerimientoRequest = async (token: string, formData: FormData) => {
    try {
      const response = await axios.post(`${BASE_URL}/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Necesario para enviar archivos
        },
      });
      if (response.status === 201) {
        return response.data; // Aseguramos que devolvemos los datos del requerimiento
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
  
    } catch (error) {
      console.error("Error al crear requerimiento", error);
      throw error; // Propaga el error para manejarlo más arriba
    }
  };
  



// Actualizar un requerimiento (PATCH)
export const updateRequerimientoRequest = async (token: string, body: any, codigo_requerimiento:string) => {
    try {
        const response = await axios.patch(`${BASE_URL}/update/${codigo_requerimiento}`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        console.error("Error al actualizar requerimiento", error);
    }
};

// Eliminar un requerimiento
export const deleteRequerimientoRequest = async (token: string, codigo: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/delete/${codigo}`, null, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        console.error("Error al eliminar requerimiento", error);
    }
};
