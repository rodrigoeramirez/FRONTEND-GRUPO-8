import { useContext, createContext, useState } from "react";
import { getCargosRequest } from "../api/Cargo";


type Cargo = {
    id: string;
    nombre: string;
  };
  
  const CargoContext = createContext<{
    cargos: Cargo[];
    getCargos: () => Promise<void>;
  } | null>(null);

// Hook para usar el contexto
export const useCargo = () => {
    const context = useContext(CargoContext);
    if (!context) {
      throw new Error("useCargo must be used within a CargoProvider");
    }
    return context;
  };

export function CargoProvider({children}) {
    const [cargos, setCargos] = useState<any[]>([]);
    const token = localStorage.getItem("token"); // Obtengo el token del localStorage.

    const getCargos = async ()=> {
        if (!token) {
            console.error("No se encontró el token.");
            return;
        }
        try {
            const respuesta = await getCargosRequest(token);
            setCargos(respuesta?.data || []);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <CargoContext.Provider
          value={{
            cargos,
            getCargos,
          }}
        >
          {children}
        </CargoContext.Provider>
      );
    
}
