"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash, Eye, AlertCircle, Loader2 } from "lucide-react"
import {
  fetchContracts,
  fetchClients,
  deleteContract,
  downloadContract,
  viewContractPdf,
} from "../services/api-service"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import Link from "next/link"
import ContractFormPreview from "./contract-form"

interface ContractListProps {
  onAddNew: () => void
  selectedClient: any
  onSelectClient: (client: any) => void
}

interface Contract {
  id: string
  descripcion: string
  estado: string
  clienteId: string
  clienteNombre: string
  empresa: string
  tipoContrato: string
  servicio: string
  creado: string
  vencimiento: string
  archivos: Array<{ id: string; nombre: string }>
}

interface Client {
  id: string
  name: string
  email?: string
}


export default function ContractListPreview({ onAddNew, selectedClient, onSelectClient }: ContractListProps) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [clientFilter, setClientFilter] = useState<string>(selectedClient?.id || "all")
  const [showForm, setShowForm] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [viewOnly, setViewOnly] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedClient) {
      setClientFilter(selectedClient.id)
    }
  }, [selectedClient])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Loading contracts and clients...")

      const [contractsData, clientsData] = await Promise.all([fetchContracts(), fetchClients()])

      console.log("Loaded data:", {
        contracts: contractsData?.length || 0,
        clients: clientsData?.length || 0,
      })

      setContracts(contractsData || [])
      setClients(clientsData || [])
    } catch (error) {
      console.error("Error loading data:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setError(`No se pudieron cargar los datos: ${errorMessage}`)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteContract = async (id: string, title: string) => {
    if (!confirm(`¿Está seguro que desea eliminar el contrato "${title}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      setDeleteLoading(id)
      await deleteContract(id)
      toast({
        title: "Contrato eliminado",
        description: "El contrato ha sido eliminado exitosamente",
      })
      await loadData() // Reload data after deletion
    } catch (error) {
      console.error("Error deleting contract:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el contrato",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleDownload = async (id: string, title: string) => {
    try {
      await downloadContract(id)
      toast({
        title: "Descarga iniciada",
        description: `Descargando contrato: ${title}`,
      })
    } catch (error) {
      console.error("Error downloading contract:", error)
      toast({
        title: "Error",
        description: "No se pudo descargar el contrato",
        variant: "destructive",
      })
    }
  }

  const handleViewPdf = async (fileId: string) => {
    try {
      await viewContractPdf(fileId)
    } catch (error) {
      console.error("Error viewing PDF:", error)
      toast({
        title: "Error",
        description: "No se pudo abrir el archivo PDF",
        variant: "destructive",
      })
    }
  }

  const handleClientChange = (value: string) => {
    setClientFilter(value)
    if (value !== "all") {
      const client = clients.find((c) => c.id === value)
      if (client) {
        onSelectClient(client)
      }
    } else {
      onSelectClient(null)
    }
  }

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Activo":
      case "0":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Activo</Badge>
      case "ProximoAVencer":
      case "Por vencer":
      case "1":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Por vencer</Badge>
      case "Vencido":
      case "2":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
            Vencido
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {estado}
          </Badge>
        )
    }
  }

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.tipoContrato?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesClient = clientFilter === "all" || contract.clienteId === clientFilter

    return matchesSearch && matchesClient
  })

  const openEditForm = (contract: Contract) => {
    console.log("Opening edit form for contract:", contract)
    setEditingContract(contract)
    setViewOnly(false)
    setShowForm(true)
  }

  const openViewForm = (contract: Contract) => {
    console.log("Opening view form for contract:", contract)
    setEditingContract(contract)
    setViewOnly(true)
    setShowForm(true)
  }

  const closeForm = () => {
    console.log("Closing form")
    setEditingContract(null)
    setViewOnly(false)
    setShowForm(false)
    loadData() // Reload data when form closes
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando contratos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="max-w-100 mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Gestión de Contratos</h1>
            <Button onClick={onAddNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Contrato
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Lista de Contratos</CardTitle>
              <CardDescription>Gestiona todos los contratos de la empresa</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por descripción, cliente, empresa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-64">
                  <Select value={clientFilter} onValueChange={handleClientChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los clientes</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contracts Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo de Contrato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Servicios
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Creación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Vencimiento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContracts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                          {searchTerm || clientFilter !== "all"
                            ? "No se encontraron contratos con los filtros aplicados"
                            : "No hay contratos registrados"}
                        </td>
                      </tr>
                    ) : (
                      filteredContracts.map((contract) => (
                        <tr key={contract.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                            {contract.tipoContrato || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contract.descripcion}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contract.clienteNombre || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {contract.empresa || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contract.servicio || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {contract.creado ? new Date(contract.creado).toLocaleDateString() : "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                              {contract.vencimiento ? new Date(contract.vencimiento).toLocaleDateString() : "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(contract.estado)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-3">
                              {/* View PDF Files */}
                              {contract.archivos && contract.archivos.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewPdf(contract.archivos[0].id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}

                              {/* View Details */}
                              <Link href={`/Dashboard/contract/${contract.id}`}>
                                <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-900">
                                  Ver
                                </Button>
                              </Link>

                              {/* Edit - Pass the full contract object */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditForm(contract)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              {/* Delete */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteContract(contract.id, contract.descripcion)}
                                disabled={deleteLoading === contract.id}
                                className="text-red-600 hover:text-red-900"
                              >
                                {deleteLoading === contract.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contract Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewOnly ? "Ver Contrato" : editingContract ? "Editar Contrato" : "Nuevo Contrato"}
            </DialogTitle>
            <DialogDescription>
              {viewOnly
                ? "Detalles del contrato seleccionado"
                : editingContract
                  ? "Modifica los detalles del contrato"
                  : "Completa la información del nuevo contrato"}
            </DialogDescription>
          </DialogHeader>
          <ContractFormPreview
            contract={editingContract}
            client={clients.find((c) => c.id === editingContract?.clienteId)}
            onCancel={closeForm}
            onSuccess={closeForm}
            viewOnly={viewOnly}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
