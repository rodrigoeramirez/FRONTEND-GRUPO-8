import axios from 'axios';

export const getEstadoRequest = async (token:string) => {
    try {
        const responseEstados = await axios.get("http://localhost:8080/estado_requerimiento", {
            headers:{
                Authorization: `Bearer ${token}`,
            },
        });
        return responseEstados;
    } catch (error) {
        console.error("Error al obtener los estados",error);
    } 
};