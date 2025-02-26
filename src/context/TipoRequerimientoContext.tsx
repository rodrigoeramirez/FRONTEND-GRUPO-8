import { useContext, createContext, useState } from "react";
import { getTipoRequerimientoRequest } from "../api/TipoRequerimiento";


type TipoRequerimiento = {
    id: string;
    descripcion: string;
  };
  
  const TipoRequerimientoContext = createContext<{
    tipos: TipoRequerimiento[];
    getTipoRequerimiento: () => Promise<void>;
  } | null>(null);

// Hook para usar el contexto
export const useTipoRequerimiento = () => {
    const context = useContext(TipoRequerimientoContext);
    if (!context) {
      throw new Error("useTipoRequerimiento must be used within a TipoRequerimientoProvider");
    }
    return context;
  };

export function TipoRequerimientoProvider({children}) {
    const [tipos, setTipoRequerimiento] = useState<any[]>([]);
    const token = localStorage.getItem("token"); // Obtengo el token del localStorage.

    const getTipoRequerimiento = async ()=> {
        if (!token) {
            console.error("No se encontró el token.");
            return;
        }
        try {
            const respuesta = await getTipoRequerimientoRequest(token);
            setTipoRequerimiento(respuesta?.data || []);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <TipoRequerimientoContext.Provider
          value={{
            tipos,
            getTipoRequerimiento,
          }}
        >
          {children}
        </TipoRequerimientoContext.Provider>
      );
    
}
