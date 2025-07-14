import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash, Download, Eye, X } from "lucide-react";
import {
  fetchContracts,
  fetchClients,
  deleteContract,
  downloadContract,
  viewContractPdf,
} from "../services/api-service";
import { useToast } from "@/hooks/use-toast";
import ContractForm from "./contract-form"; 
import { useEffect, useState } from "react";
import Link from "next/link";

interface ContractListProps {
  onAddNew: () => void;
  selectedClient: any;
  onSelectClient: (client: any) => void;
}

interface ContractFormProps {
  contract?: any;
  client?: any;
  onCancel: () => void;
  onSuccess: () => void;
  viewOnly?: boolean;
}

export default function ContractListPreview({
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
      const [contractsData, clientsData] = await Promise.all([
        fetchContracts(),
        fetchClients(),
      ]);
      setContracts(contractsData);
      setClients(clientsData);
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

  const handleDeleteContract = async (id) => {
    if (
      confirm(
        "¿Está seguro que desea eliminar este contrato? Esta acción no se puede deshacer."
      )
    ) {
      try {
        await deleteContract(id);
        toast({
          title: "Contrato eliminado",
          description: "El contrato ha sido eliminado exitosamente",
        });
        loadData();
      } catch (error) {
        console.error("Error deleting contract:", error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el contrato",
          variant: "destructive",
        });
      }
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
  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Activo":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Activo
          </Badge>
        );
      case "ProximoAVencer":
        return (
          <Badge variant="warning" className="bg-yellow-100 text-yellow-800">
            Por vencer
          </Badge>
        );
      case "Vencido":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Vencido
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {estado}
          </Badge>
        );
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
            <h1 className="text-2xl font-semibold text-gray-900">Contratos</h1>
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Nuevo Contrato
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
                      placeholder="Buscar contrato..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
           
            
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
                        Tipo De Cotrato
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        descripcion
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Provedor
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Servicios
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Fecha de creacion
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Fecha de vencimiento
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Estado
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContracts.map((contract) => (
                      <tr key={contract.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                          {contract.tipoContrato}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contract.descripcion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contract.clienteNombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">
                          {contract.servicio}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {new Date(contract.creado).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {new Date(
                              contract.vencimiento
                            ).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(contract.estado)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            {contract.archivos.map((archivo: any) => (
                              <a
                                key={archivo.id}
                                onClick={() => viewContractPdf(archivo.id)}
                              >
                                <Eye className="h-6 w-6" />
                              </a>
                            ))}

                            <div>
                              <Link
                                href={`/Dashboard/contract/${contract.id}`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Ver
                              </Link>
                            </div>

                            <a
                              href="#"
                              onClick={() => openEditForm(contract)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Editar
                            </a>
                            <a
                              href="#"
                              onClick={() => handleDeleteContract(contract.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Eliminar
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ver detalle del contrato*/}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-3xl relative">
            <button
              onClick={closeForm}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <ContractForm
              contract={editingContract}
              client={clients.find((c) => c.id === editingContract?.clienteId)}
              onCancel={closeForm}
              onSuccess={closeForm}
              viewOnly={viewOnly}
            />
          </div>
        </div>
      )}
    </div>
  );
}
