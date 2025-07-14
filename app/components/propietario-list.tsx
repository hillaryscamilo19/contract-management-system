import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash, Download, Eye, X } from "lucide-react";
import {
  fetchContracts,
  fetchClients,
  deleteContract,
  fetchEmpresas, // ✅ agrega esto
  downloadContract,
  viewContractPdf,
} from "../services/api-service";
import { useToast } from "@/hooks/use-toast";
import ContractForm from "./contract-form"; // Ajusta ruta si hace falta
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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

export default function PropietarioListPreview({
  onAddNew,
  selectedClient,
  onSelectClient,
}: ContractListProps) {
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [empresas, setEmpresas] = useState([]);
  const [clientFilter, setClientFilter] = useState(selectedClient?.id || "all");
  const [showEmpresaForm, setShowEmpresaForm] = useState(false);
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
    const [contractsData, clientsData, empresasData] = await Promise.all([
      fetchContracts(),
      fetchClients(),
      fetchEmpresas(), // ✅ aquí
    ]);
    setContracts(contractsData);
    setClients(clientsData);
    setEmpresas(empresasData); // ✅ guarda en estado
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




  const filteredContracts = empresas.filter((contract) => {
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

  const openEditForm = (empresas) => {
    setEditingContract(empresas);
    setViewOnly(false);
    setShowForm(true);
  };

  const openViewForm = (empresas) => {
    setEditingContract(empresas);
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
            <h1 className="text-2xl font-semibold text-gray-900">Empresa & Propietario</h1>
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Nuevo Propietario
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
                      placeholder="Buscar Propietario..."
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
                      propetario
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Nombre Empresa
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
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
                    {empresas.map((empresa) => (
                      <tr key={empresas.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                          {empresa.propetario}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {empresa.nombreEmpresa}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {empresa.email}
                        </td>
         
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                

                            <a
                              href="#"
                              onClick={() => openEditForm(empresas)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Editar
                            </a>
                            <a
                              href="#"
                              onClick={() => handleDeleteContract(empresas.id)}
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
