import axios from 'axios';

export const getPrioridadRequest = async (token:string) => {
    try {
        const responsePrioridades = await axios.get("http://localhost:8080/prioridad_requerimiento", {
            headers:{
                Authorization: `Bearer ${token}`,
            },
        });
        return responsePrioridades;
    } catch (error) {
        console.error("Error al obtener las prioridades",error);
    } 
};