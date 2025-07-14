"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchClients,
  getContractById,
} from "@/app/services/api-service";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { Pencil, Badge, FileText, Download, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ContractDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [contract, setContract] = useState(null);
  const [clients, setClients] = useState([]);
  const [clienteActual, setClienteActual] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadContractData(id);
    }
  }, [id]);

  const loadContractData = async (contractId) => {
    try {
      setLoading(true);
      const [contractData, clientList] = await Promise.all([
        getContractById(contractId),
        fetchClients(),
      ]);
      setContract(contractData);
      setClients(clientList);

      const clienteRelacionado = clientList.find(
        (c) => c.id === contractData.clienteId
      );
      setClienteActual(clienteRelacionado);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!contract) return <div className="p-4">Cargando contrato...</div>;

  return (
    <div className="container max-w-max h-full mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Detalles del Documento</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/contratos/editar/${contract.id}`)}
          >
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
                    contract.estado === "Activo"
                      ? "default"
                      : contract.estado === "ProximoAVencer"
                      ? "warning"
                      : "destructive"
                  }
                >
                  {contract.estado}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Cliente</h3>
                <p>{clienteActual?.nombre || "Desconocido"}</p>
                <p className="text-sm text-gray-500">{clienteActual?.email || ""}</p>
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
                  <p>No hay documentos aún.</p>
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
                  <p className="text-gray-500 text-center py-4">
                    No hay registros de historial disponibles.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notes">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500 text-center py-4">
                    No hay notas disponibles para este contrato.
                  </p>
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
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800">Recordatorio</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Este contrato vencerá en X días. Se enviará una notificación automática {contract.notificationDays} días antes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
