import { useToast } from "@/hooks/use-toast";
import { Badge, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import {
  fetchContracts,
  fetchClients,
  deleteContract,
  downloadContract,
  viewContractPdf,
  fetchServicios,
} from "../services/api-service";

interface ServicesFormProps {
  onAddNew: () => void;
  selectedClient: any;
  onSelectClient: (client: any) => void;
}

export default function ServicesList({
  onAddNew,
  selectedClient,
  onSelectClient,
}: ContractListProps) {
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState(selectedClient?.id || "all");
  const { toast } = useToast();
  const [servicios, setServicios] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<any | null>(null);
  const [viewOnly, setViewOnly] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setClientFilter(selectedClient.id);
    }
  }, [selectedClient]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contractsData, clientsData, serviciosData] = await Promise.all([
        fetchContracts(),
        fetchClients(),
        fetchServicios(),
      ]);
      setContracts(contractsData);
      setClients(clientsData);
      setServicios(serviciosData); // <- importante
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id, title) => {
    try {
      await downloadContract(id);
      toast({
        title: "Descarga iniciada",
        description: `Descargando contrato: ${title}`,
      });
    } catch (error) {
      console.error("Error downloading contract:", error);
      toast({
        title: "Error",
        description: "No se pudo descargar el contrato",
        variant: "destructive",
      });
    }
  };

  const handleClientChange = (value) => {
    setClientFilter(value);
    if (value !== "all") {
      const client = clients.find((c) => c.id === value);
      if (client) {
        onSelectClient(client);
      }
    } else {
      onSelectClient(null);
    }
  };

  const getStatusBadge = (expirationDate) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const daysRemaining = Math.ceil(
      (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 0) {
      return <Badge variant="destructive">Vencido</Badge>;
    } else if (daysRemaining <= 60) {
      return <Badge variant="destructive">Vence pronto</Badge>;
    } else if (daysRemaining <= 30) {
      return <Badge variant="secondary">Activo</Badge>;
    } else {
      return <Badge variant="secondary">Activo</Badge>;
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      (contract.descripcion || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (contract.descripcion || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesClient =
      clientFilter === "all" || contract.descripcion === clientFilter;

    return matchesSearch && matchesClient;
  });

  const openEditForm = (contract) => {
    setEditingContract(contract);
    setViewOnly(false);
    setShowForm(true);
  };

  const openViewForm = (contract) => {
    setEditingContract(contract);
    setViewOnly(true);
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingContract(null);
    setViewOnly(false);
    setShowForm(false);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Servicios</h1>
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Nuevo Servicios
            </button>
          </div>

          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between mb-4">
                <div className="w-1/3">
                  <label htmlFor="search" className="sr-only">
                    Buscar
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="search"
                      id="search"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Buscar Servicios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        descripcion
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {servicios.map((servicio) => (
                      <tr key={servicio.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {servicio.descripcion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">1</span> a{" "}
                  <span className="font-medium">4</span> de{" "}
                  <span className="font-medium">24</span> resultados
                </div>
                <div className="flex-1 flex justify-end">
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <a
                      href="#"
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Anterior</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      1
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-50 text-sm font-medium text-indigo-600 hover:bg-gray-50"
                    >
                      2
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      3
                    </a>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      8
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      9
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      10
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Siguiente</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
