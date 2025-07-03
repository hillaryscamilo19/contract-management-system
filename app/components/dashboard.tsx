"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarClock, Users, FileText, AlertTriangle } from "lucide-react";
import {
  fetchClients,
  fetchContracts,
  fetchDashboardData,
} from "../services/api-service";
import { toast } from "sonner";

interface DashboardProps {
  onCreateClient: () => void;
  onCreateContract: () => void;
}

interface FormData {
  id?: string;
  descripcion: string;
  estado: string;
  clienteNombre: string;
  creado: string;
  vencimiento: string;
  clienteId: number;
  serviciosId: number;
  servicio: string;
  empresa: string;
  tipoContrato: string;
  empresaPropietario: string;
  archivos: string;
}

export default function DashboardPreview({
  onCreateClient,
  onCreateContract,
}: DashboardProps) {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalContracts: 0,
    expiringContracts: 0,
  });
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<any | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    id: "",
    descripcion: "",
    estado: "",
    clienteNombre: "",
    creado: "",
    vencimiento: "",
    clienteId: 0,
    serviciosId: 0,
    servicio: "",
    empresa: "",
    tipoContrato: "",
    empresaPropietario: "",
    archivos: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  function calcularDiasRestantes(vencimiento: string | undefined | null) {
    if (!vencimiento) return "—"; // o podrías devolver "0" o "N/A"

    let fecha: Date;

    try {
      fecha = vencimiento.includes("/")
        ? new Date(vencimiento.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"))
        : new Date(vencimiento);

      if (isNaN(fecha.getTime())) return "—"; // fecha inválida
    } catch (err) {
      console.error("Error procesando la fecha:", err);
      return "—";
    }

    const hoy = new Date();
    const diferencia = fecha.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

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

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardData();
        setStats({
          totalClients: data.totalClients,
          totalContracts: data.totalContracts,
          expiringContracts: data.expiringContracts.length,
        });
        setExpiringContracts(data.expiringContracts);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Documento Totales
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {loading ? "..." : stats.totalContracts}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Proverdor
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {loading ? "..." : stats.totalClients}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Documento por Vencer
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {loading ? "..." : stats.expiringContracts}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Tables */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Expiring contracts */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Documento por Vencer
                  </h3>
                  <a
                    href="#"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Ver todos
                  </a>
                </div>
              </div>
              <div className="px-4 py-3 sm:px-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Típo de Documento
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Descripcion
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
                          Días
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expiringContracts.map((contract: any) => (
                        <tr key={contract.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                            {contract.tipoContrato || "NAN"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contract.descripcion || "NAN"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contract.empresa || "NAN"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contract.servicio || "NAN"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">
                            {calcularDiasRestantes(contract.vencimiento)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent clients */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Provedor Recientes
                  </h3>
                  <a
                    href="#"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Ver todos
                  </a>
                </div>
              </div>
              <div className="px-4 py-3 sm:px-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Nombre
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
                         Documento
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clients.map((client: any) => (
                        <tr key={client.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                            {client.name || "Sin nombre"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.email || "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.cantidadContratos || 0}
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
      </div>
    </div>
  );
}
