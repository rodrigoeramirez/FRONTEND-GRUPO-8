import { useContext, createContext, useState } from "react";
import { getEstadoRequest } from "../api/Estado";


type Estado = {
    id: string;
    nombre: string;
  };
  
  const EstadoContext = createContext<{
    estados: Estado[];
    getEstados: () => Promise<void>;
  } | null>(null);

// Hook para usar el contexto
export const useEstado = () => {
    const context = useContext(EstadoContext);
    if (!context) {
      throw new Error("useEstado must be used within a EstadoProvider");
    }
    return context;
  };

export function EstadoProvider({children}) {
    const [estados, setEstados] = useState<any[]>([]);
    const token = localStorage.getItem("token"); // Obtengo el token del localStorage.

    const getEstados = async ()=> {
        if (!token) {
            console.error("No se encontró el token.");
            return;
        }
        try {
            const respuesta = await getEstadoRequest(token);
            setEstados(respuesta?.data || []);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <EstadoContext.Provider
          value={{
            estados,
            getEstados,
          }}
        >
          {children}
        </EstadoContext.Provider>
      );
    
}
