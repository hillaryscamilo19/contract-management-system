import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import {
  createContract,
  fetchClients,
  fetchEmpresas,
  fetchServicios,
  fetchTiposContrato,
  updateContract,
} from "../services/api-service";

interface ConntractFormProps {
  contract?: any;
  client?: any;
  onCancel: () => void;
  onSuccess: () => void;
}
export default function ContractFormPreview({
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
  const [companies, setCompanies] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);

  const [formData, setFormData] = useState({
    descripcion: contract?.descripcion || "",
    estado: contract?.estado || "Activo",
    clienteId: contract?.clienteId || client?.id || "",
    serviciosId: contract?.serviciosId || "",
    empresa: contract?.empresa || "",
    tipoContrato: contract?.tipoContrato || "",
    empresaPropietario: contract?.empresaPropietario || "",
    creado: contract?.creado ? contract.creado.substring(0, 10) : "", // YYYY-MM-DD
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

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setFormData((prev) => ({ ...prev, archivos: file }));
    setFileSelected(true);
  }
};


  const handleSubmit = async (e: { preventDefault: () => void }) => {
    console.log("Archivo seleccionado:", formData.archivos);
    console.log("Se hizo submit");
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
      if (isEditing) {
        await updateContract({
          id: contract?.id || 0,
          descripcion: formData.descripcion,
          estado: formData.estado,
          creado: formData.creado,
          vencimiento: formData.vencimiento,
          clienteId: formData.clienteId,
          clienteNombre: "", // o asigna si lo tienes
          serviciosId: formData.serviciosId,
          servicio: "", // opcional si no lo necesitas
          empresa: formData.empresa,
          tipoContrato: formData.tipoContrato,
          empresaPropietario: formData.empresaPropietario,
          archivos: formData.archivos, // 👈 aquí cambias 'file' por 'archivos'
        });
        toast({
          title: "Contrato actualizado",
          description: "El contrato ha sido actualizado exitosamente",
        });
      } else {
        await createContract({
          id: contract?.id || 0,
          descripcion: formData.descripcion,
          estado: formData.estado,
          creado: formData.creado,
          vencimiento: formData.vencimiento,
          clienteId: formData.clienteId,
          clientId: formData.clienteId, // en caso de que lo uses internamente también
          clienteNombre: "", // o asigna si lo tienes
          serviciosId: formData.serviciosId,
          servicio: "", // opcional si no lo necesitas
          empresa: formData.empresa,
          tipoContrato: formData.tipoContrato,
          empresaPropietario: formData.empresaPropietario,
          archivos: formData.archivos, // 👈 aquí cambias 'file' por 'archivos'
        });

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
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      >
                        <option value="">Seleccione una empresa</option>
                        {companies.map((e) => (
                          <option key={e.id} value={e.nombreEmpresa}>
                            {e.nombreEmpresa}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Proterio
                      </label>
                      <select
                        name="empresaPropietario"
                        value={formData.empresaPropietario}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      >
                        <option value="">Seleccione una empresa</option>
                        {companies.map((e) => (
                          <option key={e.id} value={e.propetario}>
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
                        name="tipoContrato"
                        value={formData.tipoContrato}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      >
                        <option value="">Seleccione un tipo</option>
                        {contractTypes.map((t) => (
                          <option key={t.id} value={t.descripcion}>
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
                    name="file"
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
