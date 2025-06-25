"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { createContract, updateContract, fetchClients } from "../services/api-service"
import { useToast } from "@/hooks/use-toast"

interface ContractFormProps {
  contract?: any
  client?: any
  onCancel: () => void
  onSuccess: () => void
}

export default function ContractForm({ contract, client, onCancel, onSuccess }: ContractFormProps) {
  const isEditing = !!contract
  const { toast } = useToast()
  const [clients, setClients] = useState([])

  const [formData, setFormData] = useState({
    title: contract?.title || "",
    clientId: contract?.clientId || client?.id || "",
    startDate: contract?.startDate ? new Date(contract.startDate) : new Date(),
    expirationDate: contract?.expirationDate
      ? new Date(contract.expirationDate)
      : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    description: contract?.description || "",
    notes: contract?.notes || "",
    file: null,
  })

  const [loading, setLoading] = useState(false)
  const [fileSelected, setFileSelected] = useState(false)

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await fetchClients()
        setClients(data)
      } catch (error) {
        console.error("Error loading clients:", error)
      }
    }

    loadClients()
  }, [])

  useEffect(() => {
    if (client) {
      setFormData((prev) => ({ ...prev, clientId: client.id }))
    }
  }, [client])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, file }))
      setFileSelected(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.clientId) {
      toast({
        title: "Error",
        description: "Título y cliente son campos obligatorios",
        variant: "destructive",
      })
      return
    }

    if (!isEditing && !formData.file) {
      toast({
        title: "Error",
        description: "Debe adjuntar un archivo de contrato",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      if (isEditing) {
        await updateContract(contract.id, formData)
        toast({
          title: "Contrato actualizado",
          description: "El contrato ha sido actualizado exitosamente",
        })
      } else {
        await createContract(formData)
        toast({
          title: "Contrato creado",
          description: "El contrato ha sido creado exitosamente",
        })
      }
      onSuccess()
    } catch (error) {
      console.error("Error saving contract:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el contrato",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Contrato" : "Nuevo Contrato"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Contrato *</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, clientId: value }))}
                disabled={!!client}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Vencimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expirationDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expirationDate
                      ? format(formData.expirationDate, "PPP", { locale: es })
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expirationDate}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, expirationDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Internas</Label>
            <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Archivo de Contrato {!isEditing && "*"}</Label>
            <div className="flex items-center gap-2">
              <Input id="file" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file").click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {fileSelected ? "Archivo seleccionado" : isEditing ? "Reemplazar archivo" : "Seleccionar archivo"}
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

