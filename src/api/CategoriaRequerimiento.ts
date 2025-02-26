import axios from 'axios';

export const getCategoriaRequerimientoRequest = async (token:string) => {
    try {
        const responseCategoriaRequerimiento = await axios.get("http://localhost:8080/categoria_requerimiento", {
            headers:{
                Authorization: `Bearer ${token}`,
            },
        });
        return responseCategoriaRequerimiento;
    } catch (error) {
        console.error("Error al obtener los CategoriaRequerimiento",error);
    } 
};