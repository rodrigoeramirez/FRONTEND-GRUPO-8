import { useContext, createContext, useState } from "react";
import { getCategoriaRequerimientoRequest } from "../api/CategoriaRequerimiento";


type CategoriaRequerimiento = {
    id: string;
    descripcion: string;
  };
  
  const CategoriaRequerimientoContext = createContext<{
    categorias: CategoriaRequerimiento[];
    getCategoriaRequerimiento: () => Promise<void>;
  } | null>(null);

// Hook para usar el contexto
export const useCategoriaRequerimiento = () => {
    const context = useContext(CategoriaRequerimientoContext);
    if (!context) {
      throw new Error("useCategoriaRequerimiento must be used within a CategoriaRequerimientoProvider");
    }
    return context;
  };

export function CategoriaRequerimientoProvider({children}) {
    const [categorias, setCategoriaRequerimiento] = useState<any[]>([]);
    const token = localStorage.getItem("token"); // Obtengo el token del localStorage.

    const getCategoriaRequerimiento = async ()=> {
        if (!token) {
            console.error("No se encontró el token.");
            return;
        }
        try {
            const respuesta = await getCategoriaRequerimientoRequest(token);
            setCategoriaRequerimiento(respuesta?.data || []);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <CategoriaRequerimientoContext.Provider
          value={{
            categorias,
            getCategoriaRequerimiento,
          }}
        >
          {children}
        </CategoriaRequerimientoContext.Provider>
      );
    
}
