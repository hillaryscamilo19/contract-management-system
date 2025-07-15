import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  fetchClients,
  fetchServicios,
  fetchEmpresas,
  fetchTiposContrato,
} from "../services/api-service";

interface ConntractFormProps {
  contract?: any;
  client?: any;
  onCancel: () => void;
  onSuccess: () => void;
}
export default function PropietarioFormPreview({
  contract,
  client,
  onCancel,
  onSuccess,
}: ConntractFormProps) {
  const isEditing = !!contract;
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [Estado, setEstado] = useState([]);
  const [services, setServices] = useState([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [companies, setCompanies] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);

  const [formData, setFormData] = useState({
    propetario: contract?.propetario || "",
    nombreEmpresa: contract?.nombreEmpresa || "",
    email: contract?.email || "",
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
        const clientsData = await fetchClients();
        const servicesData = await fetchServicios();
        const companiesData = await fetchEmpresas();
        const typesData = await fetchTiposContrato();
        setClients(clientsData);
        setServices(servicesData);
        setCompanies(companiesData);
        setContractTypes(typesData);
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

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const res = await fetch("http://10.0.0.15:5210/api/Empresa");
        const data = await res.json();
        setEmpresas(data);
      } catch (error) {
        console.error("Error cargando empresas:", error);
      }
    };

    fetchEmpresas();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.propetario || !formData.nombreEmpresa || !formData.email) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://10.0.0.15:5210/api/Empresa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: 0,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo crear la empresa");
      }

      toast({
        title: "Empresa creada",
        description: "La empresa fue registrada correctamente",
      });

      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la empresa",
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
              Nueva Empresa
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
                    Información de la empresa
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Ingrese la información básica de la Empresa.
                  </p>

                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="descripcion"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Propetario
                      </label>
                      <input
                        type="text"
                        name="propetario"
                        id="propetario"
                        value={formData.propetario}
                        onChange={handleChange}
                        className="..."
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre de la Empresa
                      </label>
                      <input
                        type="text"
                        name="nombreEmpresa"
                        id="nombreEmpresa"
                        value={formData.nombreEmpresa}
                        onChange={handleChange}
                        className="..."
                        placeholder="Ej: Soluciones SRL"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="..."
                        placeholder="Ej: contacto@empresa.com"
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
