import axios from 'axios';

export const getCargosRequest = async (token:string) => {
    try {
        const responseCargos = await axios.get("http://localhost:8080/cargos", {
            headers:{
                Authorization: `Bearer ${token}`,
            },
        });
        return responseCargos;
    } catch (error) {
        console.error("Error al obtener los cargos",error);
    } 
};