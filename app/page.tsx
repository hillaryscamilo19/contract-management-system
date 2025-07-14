"use client";

import { SetStateAction, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ClientList from "./components/client-list";
import ContractList from "./components/contract-list";
import Dashboard from "./components/dashboard";
import ClientForm from "./components/client-form";
import ContractForm from "./components/contract-form";
import ServicesForm from "./components/Services-form";
import ServicesList from "./components/services-list";
import PropietarioFormPreview from "./components/propietario-form";
import PropietarioListPreview from "./components/propietario-list";




export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showServicesForm, setShowServicesForm] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showEmpresaForm, setShowEmpresaForm] = useState(false);

  return (
    <>
      <main className="flex min-h-screen flex-col p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Registro de Documentos</h1>

        <Tabs
          defaultValue="dashboard"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Home</TabsTrigger>
            <TabsTrigger value="clients">Cliente</TabsTrigger>
            <TabsTrigger value="contracts">Documentos</TabsTrigger>
            <TabsTrigger value="Services">Servicios</TabsTrigger>
            <TabsTrigger value="Propietario">Empresa & Propietario</TabsTrigger>
          </TabsList>

          <Card className="mt-4">
            <CardContent className="pt-6">
              {/* dashboard*/}
              <TabsContent value="dashboard">
                <Dashboard
                  onCreateClient={() => {
                    setShowClientForm(true);
                    setActiveTab("clients");
                  }}
                  onCreateContract={() => {
                    setShowContractForm(true);
                    setActiveTab("contracts");
                  }}
                />
              </TabsContent>

              {/* Cliente*/}
              <TabsContent value="clients">
                {showClientForm ? (
                  <ClientForm
                    onCancel={() => setShowClientForm(false)}
                    onSuccess={() => setShowClientForm(false)}
                  />
                ) : (
                  <ClientList
                    onAddNew={() => setShowClientForm(true)}
                    onSelectClient={(client) => {
                      setSelectedClient(client);
                      setShowContractForm(true);
                      setActiveTab("contracts");
                    }}
                  />
                )}
              </TabsContent>

              {/* Servicios */}
              <TabsContent value="Services">
                {showServicesForm ? (
                  <ServicesForm
                    onCancel={() => setShowServicesForm(false)}
                    onSuccess={() => setShowServicesForm(false)}
                  />
                ) : (
                  <ServicesList
                    onAddNew={() => setShowServicesForm(true)}
                    onSelectClient={(client: SetStateAction<null>) => {
                      setSelectedClient(client);
                      setShowContractForm(true);
                      setActiveTab("contracts");
                    }}
                    selectedClient={undefined}
                  />
                )}
              </TabsContent>

              {/* Propietario y empresa */}
              <TabsContent value="Propietario">
                {showEmpresaForm ? (
                  <PropietarioFormPreview
                    onCancel={() => setShowEmpresaForm(false)}
                    onSuccess={() => setShowEmpresaForm(false)}
                  />
                ) : (
                  <PropietarioListPreview
                    onAddNew={() => setShowEmpresaForm(true)}
                    onSelectClient={(client) => {
                      setSelectedClient(client);
                      setShowContractForm(true);
                      setActiveTab("contracts");
                    }}
                    selectedClient={undefined}
                  />
                )}
              </TabsContent>

              <TabsContent value="contracts">
                {showContractForm ? (
                  <ContractForm
                    client={selectedClient}
                    onCancel={() => {
                      setShowContractForm(false);
                      setSelectedClient(null);
                    }}
                    onSuccess={() => {
                      setShowContractForm(false);
                      setSelectedClient(null);
                    }}
                  />
                ) : (
                  <ContractList
                    onAddNew={() => {
                      console.log("Abrir formulario desde ContractList");
                      setShowContractForm(true);
                    }}
                    selectedClient={selectedClient}
                    onSelectClient={(client) => setSelectedClient(client)}
                  />
                )}
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </main>
    </>
  );
}
