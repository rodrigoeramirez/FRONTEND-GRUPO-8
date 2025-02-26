import { useContext, createContext, useState } from "react";
import { getComentariosByRequerimientoRequest, createComentarioRequerimientoRequest } from "../api/ComentarioRequerimiento";

type Comentario = {
    requerimientoCodigo: string,
    usuarioEmisorId: number,
    asunto: string;
    descripcion: string;
    username: string;
    fechaHora: Date;
    archivosAdjuntos?: File[]; 
  };

  const ComentarioRequerimientoContext = createContext<{
    comentarios: Comentario[];
    getComentariosByRequerimiento: (codigo:string) => Promise<void>;
    createComentarioRequerimiento: (
        comentario: Comentario
      ) => Promise<AxiosResponse<any, any> | undefined>;
  } | null>(null);

// Hook para usar el contexto
export const useComentarioRequerimiento = () => {
    const context = useContext(ComentarioRequerimientoContext);
    if (!context) {
      throw new Error("useComentarioRequerimiento must be used within a ComentarioRequerimientoProvider");
    }
    return context;
  };

export function ComentarioRequerimientoProvider({children}) {
    const [comentarios, setComentarios] = useState<any[]>([]);
    const token = localStorage.getItem("token"); // Obtengo el token del localStorage.

    const getComentariosByRequerimiento = async (codigo:string)=> {
        if (!token) {
            console.error("No se encontró el token.");
            return;
        }
        try {
            const respuesta = await getComentariosByRequerimientoRequest(token,codigo);
            const comentariosFormateados = respuesta?.data.map((comentario) => ({
              ...comentario,
              fechaHora: new Intl.DateTimeFormat("es-AR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false, // Formato 24 horas
              }).format(new Date(comentario.fechaHora)),
          }));
          setComentarios(comentariosFormateados || []);
          
        } catch (error) {
            console.error(error);
        }
    }

    // Crear un nuevo requerimiento con archivos adjuntos
    const createComentarioRequerimiento = async (comentario: FormData): Promise<AxiosResponse<any, any> | undefined> => {
      if (!token) {
        console.error("No se encontró el token.");
        return;
      }
    
      try {
        // Enviar la solicitud POST con FormData
        const response = await createComentarioRequerimientoRequest(token, comentario);
        return response;
      } catch (error) {
        console.error("Error al crear el comentario", error);
        throw error; // Relanza el error para que lo capture quien llame a la función
      }
    };

    return (
        <ComentarioRequerimientoContext.Provider
          value={{
            comentarios,
            getComentariosByRequerimiento,
            createComentarioRequerimiento,
          }}
        >
          {children}
        </ComentarioRequerimientoContext.Provider>
      );
    
}
