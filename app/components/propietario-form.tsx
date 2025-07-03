import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { fetchClients, fetchServicios, fetchEmpresas, fetchTiposContrato, updateContract, createContract } from "../services/api-service";

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
    descripcion: contract?.descripcion || "",
    estado: contract?.estado || "Activo",
    clienteId: contract?.clienteId || client?.id || "",
    serviciosId: contract?.serviciosId || "",
    empresaId: contract?.empresaId || "",
    tipoContratoId: contract?.TipoContratoId || "",
    empresaPropietario: contract?.empresaPropietario || "",
    creado: contract?.creado ? contract.creado.substring(0, 10) : "",
    vencimiento: contract?.vencimiento
      ? contract.vencimiento.substring(0, 10)
      : "",
    archivos: null,
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

    if (!formData.descripcion || !formData.clienteId) {
      toast({
        title: "Error",
        description: "Descripción y cliente son campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (!isEditing && !formData.archivos) {
      toast({
        title: "Error",
        description: "Debe adjuntar un archivo de contrato",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("descripcion", formData.descripcion);
      data.append("estado", String(formData.estado)); 
      data.append("creado", new Date(formData.creado).toISOString());
      data.append("vencimiento", new Date(formData.vencimiento).toISOString());
      data.append("clienteId", String(formData.clienteId));
      data.append("serviciosId", String(formData.serviciosId));
      data.append("empresaId", String(formData.empresaId)); 
      data.append("tipoContratoId", String(formData.tipoContratoId)); // 

      if (formData.archivos) {
        data.append("archivos", formData.archivos); 
      }

      if (isEditing) {
        await updateContract(data); 
        toast({
          title: "Contrato actualizado",
          description: "El contrato ha sido actualizado exitosamente",
        });
      } else {
        await createContract(data);
        toast({
          title: "Contrato creado",
          description: "El contrato ha sido creado exitosamente",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving contract:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el contrato",
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
              Nuevo Contrato
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
                    Información del Contrato
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Ingrese la información básica del contrato.
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

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Estado
                      </label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      >
                        <option value="">Seleccione un Estado</option>
                        <option value="0">Activo</option>
                        <option value="1">Por vencer</option>
                        <option value="2">Vencido</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Cliente
                      </label>
                      <select
                        name="clienteId"
                        value={formData.clienteId}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      >
                        <option value="">Seleccione un cliente</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Servicio
                      </label>
                      <select
                        name="serviciosId"
                        value={formData.serviciosId}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      >
                        <option value="">Seleccione un servicio</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.descripcion}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Empresa
                      </label>
                      <select
                        name="empresaId"
                        value={formData.empresaId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            empresaId: parseInt(e.target.value) || 0,
                          }))
                        }
                      >
                        <option value="">Seleccione una empresa</option>
                        {empresas.map((empresa) => (
                          <option key={empresa.id} value={empresa.id}>
                            {empresa.nombreEmpresa}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Propietario
                      </label>
                      <select
                        name="empresaPropietario"
                        value={formData.empresaPropietario}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      >
                        <option value="">Seleccione una empresa</option>
                        {companies.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.propetario}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Contrato
                      </label>
                      <select
                        name="TipoContratoId"
                        value={formData.tipoContratoId}
                           onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            tipoContratoId: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      >
                        <option value="">Seleccione un tipo</option>
                        {contractTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.descripcion}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha de Inicio
                      </label>
                      <input
                        type="date"
                        name="creado"
                        value={formData.creado}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha de Vencimiento
                      </label>
                      <input
                        type="date"
                        name="vencimiento"
                        value={formData.vencimiento}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <h3 className="text-lg font-medium text-gray-900">
                    Archivo del Contrato
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Suba el documento del contrato firmado.
                  </p>

                  <input
                    type="file"
                    name="Archivos"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="mt-4"
                  />
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
