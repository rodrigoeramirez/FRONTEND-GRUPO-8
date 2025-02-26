import axios from 'axios';

export const getTipoRequerimientoRequest = async (token:string) => {
    try {
        const responseTipoRequerimiento = await axios.get("http://localhost:8080/tipo_requerimiento", {
            headers:{
                Authorization: `Bearer ${token}`,
            },
        });
        return responseTipoRequerimiento;
    } catch (error) {
        console.error("Error al obtener los TipoRequerimiento",error);
    } 
};