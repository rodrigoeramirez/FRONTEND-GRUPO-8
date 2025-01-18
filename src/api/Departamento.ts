import axios from 'axios';

export const getDepartamentosRequest = async (token:string) => {
    try {
        const responseDepartamentos = await axios.get("http://localhost:8080/departamentos", {
            headers:{
                Authorization: `Bearer ${token}`,
            },
        });
        return responseDepartamentos;
    } catch (error) {
        console.error("Error al obtener los departamentos",error);
    } 
};