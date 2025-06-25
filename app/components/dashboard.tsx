"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CalendarClock, Users, FileText, AlertTriangle } from "lucide-react"
import { fetchDashboardData } from "../services/api-service"

interface DashboardProps {
  onCreateClient: () => void
  onCreateContract: () => void
}

export default function Dashboard({ onCreateClient, onCreateContract }: DashboardProps) {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalContracts: 0,
    expiringContracts: 0,
  })
  const [expiringContracts, setExpiringContracts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardData()
        setStats({
          totalClients: data.totalClients,
          totalContracts: data.totalContracts,
          expiringContracts: data.expiringContracts.length,
        })
        setExpiringContracts(data.expiringContracts)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contratos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalContracts}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" onClick={onCreateContract}>
              Nuevo Contrato
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos por Vencer</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.expiringContracts}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" onClick={() => window.scrollTo(0, document.body.scrollHeight)}>
              Ver Detalles
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Contratos Próximos a Vencer</h2>

        {loading ? (
          <div className="flex justify-center p-4">Cargando...</div>
        ) : expiringContracts.length > 0 ? (
          <div className="space-y-3">
            {expiringContracts.map((contract) => (
              <Alert key={contract.id} variant={contract.daysRemaining <= 7 ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex justify-between">
                  <span>{contract.title}</span>
                  <span>{contract.daysRemaining} días restantes</span>
                </AlertTitle>
                <AlertDescription className="flex justify-between text-sm">
                  <span>Cliente: {contract.clientName}</span>
                  <span>Vence: {new Date(contract.expirationDate).toLocaleDateString()}</span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">No hay contratos próximos a vencer</div>
        )}
      </div>
    </div>
  )
}

