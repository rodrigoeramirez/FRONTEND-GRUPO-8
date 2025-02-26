import { useContext, createContext, ReactNode } from "react";
import { getArchivoAdjuntoRequest, deleteArchivoAdjuntoRequest} from "../api/ArchivoAdjunto";
import { AxiosResponse } from "axios";

interface ArchivoAdjuntoContextType {
    getArchivoAdjunto: (ruta: string) => Promise<void>;
    deleteArchivoAdjunto: (id:number) => Promise<AxiosResponse<any, any> | undefined>;
}

const ArchivoAdjuntoContext = createContext<ArchivoAdjuntoContextType | null>(null);

// Hook para usar el contexto
export const useArchivoAdjunto = () => {
    const context = useContext(ArchivoAdjuntoContext);
    if (!context) {
        throw new Error("useArchivoAdjunto must be used within an ArchivoAdjuntoProvider");
    }
    return context;
};

interface ArchivoAdjuntoProviderProps {
    children: ReactNode;
}

export function ArchivoAdjuntoProvider({ children }: ArchivoAdjuntoProviderProps) {
    const token = localStorage.getItem("token"); // Obtengo el token del localStorage.

    const getArchivoAdjunto = async (ruta: string) => {
        if (!token) {
            console.error("No se encontró el token.");
            return;
        }
        try {
            const archivoBlob = await getArchivoAdjuntoRequest(token, ruta);

            // Crear un enlace para descargar el archivo
            const url = window.URL.createObjectURL(archivoBlob);
            const nombreArchivo = ruta.split("/").pop() ?? "archivo_descargado"; // Asegurar nombre válido
            const a = document.createElement("a");
            a.href = url;
            a.download = nombreArchivo;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url); // Liberar memoria

        } catch (error) {
            console.error("Error al descargar el archivo:", error);
        }
    };

    const deleteArchivoAdjunto = async (id:number): Promise<AxiosResponse<any, any> | undefined> => {
        if (!token) {
          console.error("No se encontró el token.");
          return;
        }
        try {
          const response = await deleteArchivoAdjuntoRequest(token, id);
          return response;
        } catch (error) {
          console.error("Error al eliminar el ArchivoAdjunto", error);
        }
      };

    return (
        <ArchivoAdjuntoContext.Provider value={{ getArchivoAdjunto, deleteArchivoAdjunto }}>
            {children}
        </ArchivoAdjuntoContext.Provider>
    );
}
