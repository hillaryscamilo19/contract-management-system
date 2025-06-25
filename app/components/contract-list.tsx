"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash, Download, Eye, X } from "lucide-react"
import { fetchContracts, fetchClients, deleteContract, downloadContract } from "../services/api-service"
import { useToast } from "@/hooks/use-toast"
import ContractForm from "../components/contract-form" // Ajusta ruta si hace falta

interface ContractListProps {
  onAddNew: () => void
  selectedClient: any
  onSelectClient: (client: any) => void
}

export default function ContractList({ onAddNew, selectedClient, onSelectClient }: ContractListProps) {
  const [contracts, setContracts] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [clientFilter, setClientFilter] = useState(selectedClient?.id || "all")
  const { toast } = useToast()

  const [showForm, setShowForm] = useState(false)
  const [editingContract, setEditingContract] = useState<any | null>(null)
  const [viewOnly, setViewOnly] = useState(false)

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
      const [contractsData, clientsData] = await Promise.all([fetchContracts(), fetchClients()])
      setContracts(contractsData)
      setClients(clientsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteContract = async (id: string) => {
    if (confirm("¿Está seguro que desea eliminar este contrato? Esta acción no se puede deshacer.")) {
      try {
        await deleteContract(id)
        toast({
          title: "Contrato eliminado",
          description: "El contrato ha sido eliminado exitosamente",
        })
        loadData()
      } catch (error) {
        console.error("Error deleting contract:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el contrato",
          variant: "destructive",
        })
      }
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

  const getStatusBadge = (expirationDate) => {
    const now = new Date()
    const expDate = new Date(expirationDate)
    const daysRemaining = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysRemaining < 0) {
      return <Badge variant="destructive">Vencido</Badge>
    } else if (daysRemaining <= 30) {
      return <Badge variant="destructive">Vence pronto</Badge>
    } else if (daysRemaining <= 90) {
      return <Badge variant="default">Activo</Badge>
    } else {
      return <Badge variant="outline">Activo</Badge>
    }
  }

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      (contract.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contract.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesClient = clientFilter === "all" || contract.descripcion === clientFilter

    return matchesSearch && matchesClient
  })

  const openEditForm = (contract) => {
    setEditingContract(contract)
    setViewOnly(false)
    setShowForm(true)
  }

  const openViewForm = (contract) => {
    setEditingContract(contract)
    setViewOnly(true)
    setShowForm(true)
  }

  const closeForm = () => {
    setEditingContract(null)
    setViewOnly(false)
    setShowForm(false)
    loadData()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Contratos</h2>
        <Button
          onClick={() => {
            setEditingContract(null)
            setViewOnly(false)
            setShowForm(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo Contrato
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contratos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      </div>

      {loading ? (
        <div className="flex justify-center p-8">Cargando...</div>
      ) : filteredContracts.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Típo de Contrato</TableHead>
              <TableHead>Descripcion</TableHead>
              <TableHead>Provedor</TableHead>
              <TableHead>Servicios</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Fecha Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">{contract.tipoContrato}</TableCell>
                <TableCell className="font-medium">{contract.descripcion}</TableCell>
                <TableCell>{contract.clienteNombre}</TableCell>
                  <TableCell>{contract.servicio}</TableCell>
                <TableCell>{new Date(contract.creado).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(contract.vencimiento).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusBadge(contract.expirationDate)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleDownload(contract.id, contract.tipoContrato)}>
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" size="icon" onClick={() => openViewForm(contract)}>
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" size="icon" onClick={() => openEditForm(contract)}>
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" size="icon" onClick={() => handleDeleteContract(contract.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No hay contratos</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {clientFilter !== "all"
                ? "No se encontraron contratos para este cliente"
                : "No se encontraron contratos en el sistema"}
            </p>
            <Button onClick={onAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Agregar Contrato
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal formulario */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeForm} // Cerramos modal si clic afuera
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full p-6 relative"
            onClick={(e) => e.stopPropagation()} // Evitar cierre al hacer clic dentro
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
              onClick={closeForm}
              aria-label="Cerrar formulario"
            >
              <X />
            </button>

            <ContractForm
              contract={editingContract}
              client={selectedClient}
              onCancel={closeForm}
              onSuccess={closeForm}
              readOnly={viewOnly}
            />
          </div>
        </div>
      )}
    </div>
  )
}
