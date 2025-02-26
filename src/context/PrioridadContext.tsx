import { useContext, createContext, useState } from "react";
import { getPrioridadRequest } from "../api/Prioridad";


type Prioridad = {
    id: string;
    nombre: string;
  };
  
  const PrioridadContext = createContext<{
    prioridades: Prioridad[];
    getPrioridades: () => Promise<void>;
  } | null>(null);

// Hook para usar el contexto
export const usePrioridad = () => {
    const context = useContext(PrioridadContext);
    if (!context) {
      throw new Error("usePrioridad must be used within a PrioridadProvider");
    }
    return context;
  };

export function PrioridadProvider({children}) {
    const [prioridades, setPrioridades] = useState<any[]>([]);
    const token = localStorage.getItem("token"); // Obtengo el token del localStorage.

    const getPrioridades = async ()=> {
        if (!token) {
            console.error("No se encontró el token.");
            return;
        }
        try {
            const respuesta = await getPrioridadRequest(token);
            setPrioridades(respuesta?.data || []);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <PrioridadContext.Provider
          value={{
            prioridades,
            getPrioridades,
          }}
        >
          {children}
        </PrioridadContext.Provider>
      );
    
}
