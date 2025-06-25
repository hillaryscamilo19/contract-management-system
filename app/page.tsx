"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import ClientList from "./components/client-list"
import ContractList from "./components/contract-list"
import Dashboard from "./components/dashboard"
import ClientForm from "./components/client-form"
import ContractForm from "./components/contract-form"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedClient, setSelectedClient] = useState(null)
  const [showClientForm, setShowClientForm] = useState(false)
  const [showContractForm, setShowContractForm] = useState(false)

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Registro de Documentos</h1>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Home</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <TabsContent value="dashboard">
              <Dashboard
                onCreateClient={() => {
                  setShowClientForm(true)
                  setActiveTab("clients")
                }}
                onCreateContract={() => {
                  setShowContractForm(true)
                  setActiveTab("contracts")
                }}
              />
            </TabsContent>

            <TabsContent value="clients">
              {showClientForm ? (
                <ClientForm onCancel={() => setShowClientForm(false)} onSuccess={() => setShowClientForm(false)} />
              ) : (
                <ClientList
                  onAddNew={() => setShowClientForm(true)}
                  onSelectClient={(client) => {
                    setSelectedClient(client)
                    setShowContractForm(true)
                    setActiveTab("contracts")
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="contracts">
              {showContractForm ? (
                <ContractForm
                  client={selectedClient}
                  onCancel={() => {
                    setShowContractForm(false)
                    setSelectedClient(null)
                  }}
                  onSuccess={() => {
                    setShowContractForm(false)
                    setSelectedClient(null)
                  }}
                />
              ) : (
                <ContractList
                  onAddNew={() => {
                    if (!selectedClient) {
                      setActiveTab("clients")
                    } else {
                      setShowContractForm(true)
                    }
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
  )
}

