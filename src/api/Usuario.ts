import axios from 'axios';

export const getUsuariosRequest = async (token:string) => {
    try {
        const responseUsuarios = await axios.get("http://localhost:8080/usuarios", {
            headers:{
                Authorization: `Bearer ${token}`,
            },
        });
        return responseUsuarios;
    } catch (error) {
        console.error("Error al obtener los usuarios",error);
    } 
};

export const createUsuarioRequest = async (token:string, body:any) => {
    try {
        const responseUsuario = await axios.post("http://localhost:8080/auth/register",body, {
            headers:{
                Authorization: `Bearer ${token}`,
            },
        });
        return responseUsuario;
    } catch (error) {
        console.error("Error al crear usuario",error);
    }
}

export const updateUsuarioRequest = async (token:string, body:any, legajo:number) => {
    try {
        console.log("NUEVOOO",body);
        const responseUsuario = await axios.patch(`http://localhost:8080/usuarios/update/${legajo}`,body, {
            headers:{
                Authorization: `Bearer ${token}`,
            },
        });
        return responseUsuario;
    } catch (error) {
        console.error("Error al actualizar el usuario",error);
    }
}


export const deleteUsuarioRequest = async (token:string, legajo:number) => {
    try {
const responseUsuario = await axios.delete(`http://localhost:8080/usuarios/delete/${legajo}`, {
    headers:{
        Authorization: `Bearer ${token}`,
    },
});
return responseUsuario;
    } catch (error) {
        console.error("Error al eliminar usuario",error);
    }
}

export const validateEmailRequest = async (token:string, email:string) => {
    try {
        const responseValidate = await axios.get(`http://localhost:8080/usuarios/validate-email/${email}`, {
            headers:{
                Authorization: `Bearer ${token}`,
            },
        });
        return responseValidate;
    } catch (error) {
        console.error("Error al validar el email",error);
    } 
};

export const validateUsernameRequest = async (token:string, username:string) => {
    try {
        const responseValidate = await axios.get(`http://localhost:8080/usuarios/validate-username/${username}`, {
            headers:{
                Authorization: `Bearer ${token}`,
            },
        });
        return responseValidate;
    } catch (error) {
        console.error("Error al validar el username",error);
    } 
};