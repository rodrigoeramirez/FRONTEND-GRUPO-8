import { useContext, createContext, useState } from "react";
import {
  getRequerimientosRequest,
  getUltimoSecuencialRequest,
  createRequerimientoRequest,
  updateRequerimientoRequest,
  deleteRequerimientoRequest,
} from "../api/Requerimiento";
import { AxiosResponse } from "axios";

// Definición del tipo Requerimiento
type Requerimiento = {
  id: string;
  codigo: string;
  asunto: string;
  descripcion: string;
  tipoRequerimientoId: number;
  estadoRequerimientoId: number;
  prioridadRequerimientoId: number;
  emisorLegajo: number;
  destinatarioId?: number;
  archivosAdjuntos?: File[];  // Asegúrate de que los archivos sean tipo File en el contexto
  requerimientosRelacionados?: Requerimiento[]; //
};

// Creación del contexto
const RequerimientoContext = createContext<{
  requerimientos: Requerimiento[];
  getRequerimientos: (tipoRequerimientoId: number) => Promise<void>;
  getUltimoSecuencial: (tipoRequerimientoId: number) => Promise<number | null>;
  createRequerimiento: (requerimiento: Requerimiento) => Promise<AxiosResponse<any, any> | undefined>;
  updateRequerimiento: (
    requerimiento: Partial<Requerimiento>,
    id: number
  ) => Promise<AxiosResponse<any, any> | undefined>;
  deleteRequerimiento: (
    id: number
  ) => Promise<AxiosResponse<any, any> | undefined>;
} | null>(null);

// Hook para usar el contexto
export const useRequerimiento = () => {
  const context = useContext(RequerimientoContext);
  if (!context) {
    throw new Error(
      "useRequerimiento must be used within a RequerimientoProvider"
    );
  }
  return context;
};

// Provider del contexto
export const RequerimientoProvider = ({ children }: { children: React.ReactNode }) => {
  const [requerimientos, setRequerimientos] = useState<Requerimiento[]>([]);
  const token = localStorage.getItem("token"); // Obtengo el token del localStorage.

  // Obtener todos los requerimientos
  const getRequerimientos = async () => {
    if (!token) {
      console.error("No se encontró el token.");
      return;
    }
    try {
      const respuesta = await getRequerimientosRequest(token);
      setRequerimientos(respuesta?.data || []);
    } catch (error) {
      console.error("Error al obtener los requerimientos", error);
    }
  };

   // Obtener el último secuencial desde el backend
  const getUltimoSecuencial = async (tipoRequerimientoId: number): Promise<number | null> => {
    if (!token) {
      console.error("No se encontró el token.");
    return null;
    }

    try {
      const respuesta = await getUltimoSecuencialRequest(tipoRequerimientoId, token); // Llama a la función importada
      // Verifica si la respuesta es válida
      if (respuesta?.data !== undefined && respuesta?.data !== null) {
        return respuesta.data; // Devuelve el secuencial
      } else {
        console.error("Respuesta inválida al obtener el último secuencial.");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el último secuencial:", error);
      return null; // Devuelve null en caso de error
    }
  };

  // Crear un nuevo requerimiento con archivos adjuntos
const createRequerimiento = async (requerimiento: FormData): Promise<AxiosResponse<any, any> | undefined> => {
  if (!token) {
    console.error("No se encontró el token.");
    return;
  }

  try {
    // Enviar la solicitud POST con FormData
    const response = await createRequerimientoRequest(token, requerimiento);
    return response;
  } catch (error) {
    console.error("Error al crear el requerimiento", error);
    throw error; // Relanza el error para que lo capture quien llame a la función
  }
};

  // Actualizar un requerimiento (PATCH)
  const updateRequerimiento = async (requerimiento: FormData, codigo_requerimiento: string): Promise<AxiosResponse<any, any> | undefined> => {
    if (!token) {
      console.error("No se encontró el token.");
      return;
    }
    try {
      const updatedRequerimiento = await updateRequerimientoRequest(token, requerimiento, codigo_requerimiento);
      return updatedRequerimiento;
    } catch (error) {
      console.error("Error al actualizar el requerimiento", error);
    }
  };

  // Eliminar un requerimiento
  const deleteRequerimiento = async (
    codigo: string
  ): Promise<AxiosResponse<any, any> | undefined> => {
    if (!token) {
      console.error("No se encontró el token.");
      return;
    }
    try {
      const deletedRequerimiento = await deleteRequerimientoRequest(token, codigo);
      return deletedRequerimiento;
    } catch (error) {
      console.error("Error al eliminar el requerimiento", error);
    }
  };

  return (
    <RequerimientoContext.Provider
      value={{
        requerimientos,
        getRequerimientos,
        createRequerimiento,
        updateRequerimiento,
        deleteRequerimiento,
        getUltimoSecuencial,
      }}
    >
      {children}
    </RequerimientoContext.Provider>
  );
}
