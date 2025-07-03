import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  fetchClients,
  fetchServicios,
  fetchEmpresas,
  fetchTiposContrato,
  updateContract,
  createContract,
  createServicio,
} from "../services/api-service";

interface ServicesFormProps {
  contract?: any;
  client?: any;
  onCancel: () => void;
  onSuccess: () => void;
}
export default function ({
  contract,
  client,
  onCancel,
  onSuccess,
}: ServicesFormProps) {
  const isEditing = !!contract;
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [formData, setFormData] = useState({
    descripcion: contract?.descripcion || "",
  });

  const [loading, setLoading] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await fetchClients();
        setClients(data);
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };

    loadClients();
  }, []);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await fetchClients();
        setServices(data);
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };

    loadClients();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const servicesData = await fetchServicios();

        setServices(servicesData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (client) {
      setFormData((prev) => ({ ...prev, clientId: client.id }));
    }
  }, [client]);

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    const numericFields = [
      "ClienteId",
      "Servicios",
      "EmpresaId",
      "TipoContratoId",
      "EmpresaPropietario",
    ];
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      setFormData((prev) => ({
        ...prev,
        archivos: archivo,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createServicio({ descripcion: formData.descripcion });

      toast({
        title: "Servicio creado",
        description: "El servicio fue registrado exitosamente",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el servicio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Nuevo Servicios
            </h1>
          </div>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form
                onSubmit={handleSubmit}
                className="space-y-8 divide-y divide-gray-200"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Crear Nuevo Servicios
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Ingrese la información básica Para Crear nuevo Servicios.
                  </p>

                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="descripcion"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Descripción
                      </label>
                      <input
                        type="text"
                        name="descripcion"
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Ej: Mantenimiento Anual"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {loading
                      ? "Guardando..."
                      : isEditing
                      ? "Actualizar"
                      : "Guardar..."}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
