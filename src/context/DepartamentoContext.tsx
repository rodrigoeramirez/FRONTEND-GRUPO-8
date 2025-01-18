import { useContext, createContext, useState, ReactNode } from "react";
import { getDepartamentosRequest } from "../api/Departamento";

// Tipos
type Departamento = {
  id: string;
  nombre: string;
};

type DepartamentoContextType = {
  departamentos: Departamento[];
  getDepartamentos: () => Promise<void>;
};

// Crear el contexto
const DepartamentoContext = createContext<DepartamentoContextType | null>(null);

// Hook para usar el contexto
export const useDepartamento = () => {
  const context = useContext(DepartamentoContext);
  if (!context) {
    throw new Error("useDepartamento must be used within a DepartamentoProvider");
  }
  return context;
};

// Proveedor del contexto
export const DepartamentoProvider = ({ children }: { children: ReactNode }) => {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const token = localStorage.getItem("token"); // Obtengo el token del localStorage.

  const getDepartamentos = async () => {
    if (!token) {
      console.error("No se encontró el token.");
      return;
    }
    try {
      const respuesta = await getDepartamentosRequest(token);
      setDepartamentos(respuesta?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DepartamentoContext.Provider value={{ departamentos, getDepartamentos }}>
      {children}
    </DepartamentoContext.Provider>
  );
};
