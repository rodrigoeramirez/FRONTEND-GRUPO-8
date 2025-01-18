import { useContext, createContext, useState } from "react";
import {  createUsuarioRequest, deleteUsuarioRequest, getUsuariosRequest, updateUsuarioRequest, validateEmailRequest, validateUsernameRequest } from "../api/Usuario";
import { AxiosResponse } from "axios";

type Usuario = {
    id: string;
    nombre: string;
    apellido: string;
    username: string;
    email: string;
    cargo_id: number;
    departamento_id: number;
  };
  
  const UsuarioContext = createContext<{
    usuarios: Usuario[];
    validateEmail: (email: string) => Promise<boolean | undefined>;
    validateUsername: (username: string) => Promise<boolean | undefined>;
    getUsuarios: () => Promise<void>;
    createUsuario: (usuario: Usuario) => Promise<AxiosResponse<any, any> | undefined>;
    updateUsuario: (usuario: Usuario, legajo:number) => Promise<AxiosResponse<any, any> | undefined>;
    deleteUsuario: (legajo: number) => Promise<AxiosResponse<any, any> | undefined>;
  } | null>(null);

  // Hook para usar el contexto
  export const useUsuario = () => {
    const context = useContext(UsuarioContext);
    if (!context) {
      throw new Error("useUsuario must be used within a UsuarioProvider");
    }
    return context;
  };

  export function UsuarioProvider({children}) {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const token = localStorage.getItem("token"); // Obtengo el token del localStorage.

    const getUsuarios = async ()=> {
        if (!token) {
            console.error("No se encontró el token.");
            return;
        }
        try {
            const respuesta = await getUsuariosRequest(token);
            setUsuarios(respuesta?.data || []);
        } catch (error) {
            console.error(error);
        }
    }

    const createUsuario = async (usuario:Usuario) => {
      if (!token) {
        console.error("No se encontró el token.");
        return;
    }
    try {
        const newUser = await createUsuarioRequest(token,usuario);
        return newUser;
    } catch (error) {
        console.error(error);
    }
    }

    const updateUsuario = async (usuario:Usuario, legajo:number) => {
      if (!token) {
        console.error("No se encontró el token.");
        return;
    }
    try {
        const updateUser = await updateUsuarioRequest(token,usuario, legajo);
        return updateUser;
    } catch (error) {
        console.error(error);
    }
    }

    const deleteUsuario = async (legajo:number) => {
      if (!token) {
        console.error("No se encontró el token.");
        return;
    }
    try {
        const deletedUser = await deleteUsuarioRequest(token,legajo);
        return deletedUser;
    } catch (error) {
        console.error(error);
    }
    }

    const validateEmail = async (email: string): Promise<boolean | undefined> => {
      if (!token) {
        console.error("No se encontró el token.");
        return;
      }
      try {
        const respuesta = await validateEmailRequest(token, email);
        return respuesta?.data; // Devuelve el resultado
      } catch (error) {
        console.error(error);
        return false;
      }
    };

    const validateUsername = async (username: string): Promise<boolean | undefined> => {
      if (!token) {
        console.error("No se encontró el token.");
        return;
      }
      try {
        const respuesta = await validateUsernameRequest(token, username);
        return respuesta?.data; // Devuelve el resultado
      } catch (error) {
        console.error(error);
        return false;
      }
    };
    

    return (
        <UsuarioContext.Provider
          value={{
            usuarios,
            getUsuarios,
            validateEmail,
            validateUsername,
            createUsuario,
            deleteUsuario,
            updateUsuario,
          }}
        >
          {children}
        </UsuarioContext.Provider>
      );
    
}
