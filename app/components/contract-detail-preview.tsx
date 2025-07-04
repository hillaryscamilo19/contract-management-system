import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getContractById } from "../services/api-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { Pencil, Badge, FileText, Download, Mail, AlertTriangle } from "lucide-react";
import router from "next/router";
import { Button } from "react-day-picker";


export default function ContractDetailView() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getContractById(id);
      setContract(data);
    };
    fetchData();
  }, [id]);

  if (!contract) return <div>Cargando...</div>;

  function downloadFile(id: any): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Detalles del Contrato</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{contract.descripcion}</CardTitle>
                  <CardDescription>ID: {contract.id}</CardDescription>
                </div>
                <Badge
                  variant={
                    contract.status === "Activo"
                      ? "default"
                      : contract.status === "ProximoAVencer"
                        ? "warning"
                        : "destructive"
                  }
                >
                  {contract.estado === "active" ? "Activo" : contract.estado === "expiring" ? "Por vencer" : "Vencido"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Cliente</h3>
                <p>{contract.clienteNombre}</p>
                <p className="text-sm text-gray-500">{contract.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Fecha de Inicio</h3>
                  <p>{contract.creado}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Fecha de Vencimiento</h3>
                  <p>{contract.vencimiento}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-1">Descripción</h3>
                <p>{contract.descripcion}</p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Notificación</h3>
                <p>{contract.notificationDays} días antes del vencimiento</p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="documents" className="mt-6">
            <TabsList>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
            </TabsList>
            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {contract.archivos.map((doc, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-500 mr-3" />
                          <div>
                            <p className="font-medium">{doc.fileName}</p>
                            <p className="text-xs text-gray-500">Subido: {doc.createdAt}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Subir Nuevo Documento
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="history">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500 text-center py-4">No hay registros de historial disponibles.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notes">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500 text-center py-4">No hay notas disponibles para este contrato.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Agregar Nota
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Descargar Contrato
              </Button>

              <Button className="w-full" variant="outline" onClick={sendNotification} disabled={isSending}>
                <Mail className="mr-2 h-4 w-4" />
                {isSending ? "Enviando..." : "Enviar Notificación"}
              </Button>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800">Recordatorio</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Este contrato vencerá en 245 días. Se enviará una notificación automática 30 días antes del
                      vencimiento.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">Empresa ABC</p>
                <p className="text-sm">contacto@abc.com</p>
                <p className="text-sm">123-456-7890</p>
                <p className="text-sm text-gray-500 mt-2">Persona de contacto: Juan Pérez</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
