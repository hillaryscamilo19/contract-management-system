import type React from "react";

import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, FileText } from "lucide-react";
import {
  createContract,
  fetchClients,
  fetchEmpresas,
  fetchServicios,
  fetchTiposContrato,
  updateContract,
} from "../services/api-service";

interface ContractFormProps {
  contract?: any;
  client?: any;
  onCancel: () => void;
  onSuccess: () => void;
  viewOnly?: boolean;
}
export default function ContractFormPreview({
  contract,
  client,
  onCancel,
  onSuccess,
  viewOnly = false,
}: ContractFormProps) {
  const isEditing = !!contract;
  const { toast } = useToast();

  // Debug logging
  console.log("ContractForm props:", { contract, client, isEditing, viewOnly });

  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [companies, setCompanies] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    descripcion: contract?.descripcion || "",
    estado: contract?.estado?.toString() || "0", // Ensure string
    clienteId: contract?.clienteId?.toString() || client?.id?.toString() || "",
    serviciosId: contract?.serviciosId?.toString() || "", // Ensure string, don't default to empty
    empresaId: contract?.empresaId?.toString() || "",
    tipoContratoId:
      (contract?.tipoContratoId || contract?.TipoContratoId)?.toString() || "",
    empresaPropietario: contract?.empresaPropietario?.toString() || "",
    creado: contract?.creado ? contract.creado.substring(0, 10) : "",
    vencimiento: contract?.vencimiento
      ? contract.vencimiento.substring(0, 10)
      : "",
    archivos: null as File | null,
  });

  // Debug logging for form data
  console.log("Initial form data:", formData);
  console.log("Contract ID for editing:", contract?.id);

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (client?.id) {
      console.log("Setting client from prop:", client);
      setFormData((prev) => ({ ...prev, clienteId: client.id.toString() }));
    }
  }, [client]);

  const loadFormData = async () => {
    try {
      setDataLoading(true);
      setError(null);

      console.log("Loading form data...");

      const [
        clientsData,
        servicesData,
        companiesData,
        typesData,
        empresasData,
      ] = await Promise.all([
        fetchClients().catch((err) => {
          console.error("Error loading clients:", err);
          return [];
        }),
        fetchServicios().catch((err) => {
          console.error("Error loading services:", err);
          return [];
        }),
        fetchEmpresas().catch((err) => {
          console.error("Error loading companies:", err);
          return [];
        }),
        fetchTiposContrato().catch((err) => {
          console.error("Error loading contract types:", err);
          return [];
        }),
        fetchEmpresas().catch((err) => {
          console.error("Error loading empresas:", err);
          return [];
        }),
      ]);

      setClients(clientsData || []);
      setServices(servicesData || []);
      setCompanies(companiesData || []);
      setContractTypes(typesData || []);
      setEmpresas(empresasData || []);

      console.log("Form data loaded:", {
        clients: clientsData?.length || 0,
        services: servicesData?.length || 0,
        companies: companiesData?.length || 0,
        contractTypes: typesData?.length || 0,
        empresas: empresasData?.length || 0,
      });
    } catch (error) {
      console.error("Error loading form data:", error);
      setError("Error cargando los datos del formulario");
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del formulario",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    console.log("Validating form data:", formData);

    if (!formData.descripcion.trim()) {
      errors.push("La descripción es obligatoria");
    }

    if (!formData.clienteId || formData.clienteId === "") {
      errors.push("Debe seleccionar un cliente");
    }

    // Make serviciosId optional or provide a default
    if (!formData.serviciosId || formData.serviciosId === "") {
      console.warn("ServiciosId is empty, this might cause validation errors");
    }

    if (!formData.empresaId || formData.empresaId === "") {
      errors.push("Debe seleccionar una empresa");
    }

    if (!formData.tipoContratoId || formData.tipoContratoId === "") {
      errors.push("Debe seleccionar un tipo de contrato");
    }

    if (!isEditing && !formData.archivos) {
      errors.push("Debe adjuntar un archivo de contrato");
    }

    if (formData.creado && formData.vencimiento) {
      const startDate = new Date(formData.creado);
      const endDate = new Date(formData.vencimiento);
      if (endDate <= startDate) {
        errors.push(
          "La fecha de vencimiento debe ser posterior a la fecha de inicio"
        );
      }
    }

    // Validate contract ID for editing
    if (isEditing && (!contract?.id || contract.id === undefined)) {
      errors.push("ID del contrato no válido para edición");
    }

    console.log("Validation errors:", errors);
    return errors;
  };

  const handleInputChange = (name: string, value: string) => {
    console.log("Input change:", { name, value });

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user makes changes
    if (error) setError(null);
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      // Validate file type
      if (!file.type.includes("pdf")) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos PDF",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo no puede ser mayor a 10MB",
          variant: "destructive",
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        archivos: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (viewOnly) {
      onCancel();
      return;
    }

    console.log("Form submission started");
    console.log("Current form data:", formData);
    console.log("Contract for editing:", contract);

    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      console.error("Form validation failed:", errors);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setValidationErrors([]);

      // Create FormData object
      const data = new FormData();

      // Add all form fields with proper validation
      data.append("descripcion", formData.descripcion.trim());
      data.append("estado", formData.estado || "0");
      data.append("clienteId", formData.clienteId || "");

      // Handle serviciosId - provide default if empty
      data.append("serviciosId", formData.serviciosId || "1");

      data.append("empresaId", formData.empresaId || "");
      data.append("tipoContratoId", formData.tipoContratoId || "");
      data.append("empresaPropietario", formData.empresaPropietario || "");

      if (formData.creado) {
        data.append("creado", formData.creado);
      }

      if (formData.vencimiento) {
        data.append("vencimiento", formData.vencimiento);
      }

      if (formData.archivos) {
        data.append("archivos", formData.archivos);
      }

      // Log the data being sent for debugging
      console.log("Submitting contract data:");
      for (const [key, value] of data.entries()) {
        console.log(
          `${key}:`,
          value instanceof File ? `File: ${value.name}` : value
        );
      }

      if (isEditing) {
        // Ensure we have a valid contract ID
        if (!contract?.id) {
          throw new Error("ID del contrato no válido para actualización");
        }

        console.log("Updating contract with ID:", contract.id);
        await updateContract(contract.id, data);

        toast({
          title: "Éxito",
          description: "El contrato ha sido actualizado exitosamente",
        });
      } else {
        console.log("Creating new contract");
        await createContract(data);

        toast({
          title: "Éxito",
          description: "El contrato ha sido creado exitosamente",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving contract:", error);

      let errorMessage = "No se pudo guardar el contrato";

      if (error.status === 400) {
        if (error.data?.errors) {
          // Handle validation errors from server
          const validationErrors = Object.entries(error.data.errors)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("; ");
          errorMessage = `Errores de validación: ${validationErrors}`;
        } else {
          errorMessage = "Datos inválidos. Por favor revisa todos los campos.";
        }
      } else if (error.status === 401) {
        errorMessage = "No autorizado. Por favor inicia sesión nuevamente.";
      } else if (error.status === 500) {
        errorMessage = "Error del servidor. Intenta nuevamente más tarde.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando formulario...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {viewOnly
            ? "Detalles del Contrato"
            : isEditing
            ? "Editar Contrato"
            : "Nuevo Contrato"}
        </CardTitle>
        <CardDescription>
          {viewOnly
            ? "Información del contrato seleccionado"
            : isEditing
            ? "Modifica los detalles del contrato"
            : "Completa la información del nuevo contrato"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Debug Info (remove in production) */}
          {process.env.NODE_ENV === "development" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="text-xs">
                  <strong>Debug Info:</strong>
                  <br />
                  Contract ID: {contract?.id || "undefined"}
                  <br />
                  Is Editing: {isEditing.toString()}
                  <br />
                  Client ID: {formData.clienteId || "empty"}
                  <br />
                  Servicios ID: {formData.serviciosId || "empty"}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Descripción */}
            <div className="md:col-span-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) =>
                  handleInputChange("descripcion", e.target.value)
                }
                placeholder="Ej: Mantenimiento Anual de Sistemas"
                disabled={viewOnly || loading}
                className="mt-1"
              />
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => handleInputChange("estado", value)}
                disabled={viewOnly || loading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Activo</SelectItem>
                  <SelectItem value="1">Por vencer</SelectItem>
                  <SelectItem value="2">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cliente */}
            <div>
              <Label htmlFor="clienteId">Cliente *</Label>
              <Select
                value={formData.clienteId}
                onValueChange={(value) => handleInputChange("clienteId", value)}
                disabled={viewOnly || loading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccione un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name || c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Servicio */}
            <div>
              <Label htmlFor="serviciosId">Servicio *</Label>
              <Select
                value={formData.serviciosId}
                onValueChange={(value) =>
                  handleInputChange("serviciosId", value)
                }
                disabled={viewOnly || loading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccione un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s: any) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Empresa */}
            <div>
              <Label htmlFor="empresaId">Empresa *</Label>
              <Select
                value={formData.empresaId}
                onValueChange={(value) => handleInputChange("empresaId", value)}
                disabled={viewOnly || loading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccione una empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa: any) => (
                    <SelectItem key={empresa.id} value={empresa.id.toString()}>
                      {empresa.nombreEmpresa || empresa.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Contrato */}
            <div>
              <Label htmlFor="tipoContratoId">Tipo de Contrato *</Label>
              <Select
                value={formData.tipoContratoId}
                onValueChange={(value) =>
                  handleInputChange("tipoContratoId", value)
                }
                disabled={viewOnly || loading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((t: any) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Propietario */}
            <div>
              <Label htmlFor="empresaPropietario">Propietario</Label>
              <Select
                value={formData.empresaPropietario}
                onValueChange={(value) =>
                  handleInputChange("empresaPropietario", value)
                }
                disabled={viewOnly || loading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccione un propietario" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((e: any) => (
                    <SelectItem key={e.id} value={e.id.toString()}>
                      {e.propietario || e.propetario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha de Inicio */}
            <div>
              <Label htmlFor="creado">Fecha de Inicio</Label>
              <Input
                type="date"
                id="creado"
                value={formData.creado}
                onChange={(e) => handleInputChange("creado", e.target.value)}
                disabled={viewOnly || loading}
                className="mt-1"
              />
            </div>

            {/* Fecha de Vencimiento */}
            <div>
              <Label htmlFor="vencimiento">Fecha de Vencimiento</Label>
              <Input
                type="date"
                id="vencimiento"
                value={formData.vencimiento}
                onChange={(e) =>
                  handleInputChange("vencimiento", e.target.value)
                }
                disabled={viewOnly || loading}
                className="mt-1"
              />
            </div>
          </div>

          {/* File Upload */}
          {!viewOnly && (
            <div>
              <Label htmlFor="archivos">
                Archivo del Contrato {!isEditing && "*"}
              </Label>
              <div className="mt-1 space-y-2">
                <Input
                  type="file"
                  id="archivos"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.archivos && (
                  <div className="flex items-center text-sm text-green-600">
                    <FileText className="h-4 w-4 mr-1" />
                    {formData.archivos.name}
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  Solo archivos PDF, máximo 10MB
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {viewOnly ? "Cerrar" : "Cancelar"}
            </Button>
            {!viewOnly && (
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading
                  ? "Guardando..."
                  : isEditing
                  ? "Actualizar Contrato"
                  : "Crear Contrato"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
