const API_BASE_URL = "http://10.0.0.15:5210/api"

// Types
interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  lastName: string
  documento_Identidad: string
}

interface Contract {
  id: string
  descripcion: string
  estado: string
  clienteId: string
  serviciosId: string
  empresaId: string
  tipoContratoId: string
  empresaPropietario: string
  creado: string
  vencimiento: string
  archivos: Array<{ id: string; nombre: string }>
}

interface ApiError extends Error {
  status?: number
  statusText?: string
  data?: any
}

// Enhanced error handling utility
class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async handleResponse<T>(response: Response, operation: string): Promise<T> {
    console.log(`API ${operation}:`, {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    })

    if (!response.ok) {
      let errorData: any = {}
      let errorMessage = `Error en ${operation}: ${response.statusText}`

      try {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json()
        } else {
          errorData.text = await response.text()
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError)
      }

      // Enhanced error logging
      console.error(`API Error Details:`, {
        operation,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorData,
      })

      // Create detailed error message
      if (errorData.detail) {
        errorMessage = `Error en ${operation}: ${errorData.detail}`
      } else if (errorData.message) {
        errorMessage = `Error en ${operation}: ${errorData.message}`
      } else if (errorData.errors) {
        // Handle validation errors
        const validationErrors = Object.values(errorData.errors).flat()
        errorMessage = `Error en ${operation}: ${validationErrors.join(", ")}`
      } else if (errorData.text) {
        errorMessage = `Error en ${operation}: ${errorData.text}`
      }

      const error = new Error(errorMessage) as ApiError
      error.status = response.status
      error.statusText = response.statusText
      error.data = errorData
      throw error
    }

    try {
      const data = await response.json()
      console.log(`API ${operation} success:`, data)
      return data
    } catch (error) {
      console.log(`API ${operation} success (no JSON response)`)
      return {} as T
    }
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}, operation: string): Promise<T> {
    try {
      console.log(`Making API request:`, {
        operation,
        url,
        method: options.method || "GET",
        headers: options.headers,
        body: options.body instanceof FormData ? "FormData" : options.body,
      })

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        },
      })

      return await this.handleResponse<T>(response, operation)
    } catch (error) {
      console.error(`API request failed:`, { operation, url, error })
      throw error
    }
  }

  // Dashboard
  async fetchDashboardData() {
    try {
      const [clients, contracts] = await Promise.all([
        this.makeRequest<Client[]>(`${this.baseUrl}/Cliente`, {}, "obtener clientes para dashboard"),
        this.makeRequest<Contract[]>(`${this.baseUrl}/Contrato`, {}, "obtener contratos para dashboard"),
      ])

      const now = new Date()
      const expiringContracts = contracts
        .filter((contract) => {
          const vencimiento = new Date(contract.vencimiento)
          return vencimiento > now && vencimiento <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        })
        .map((contract) => {
          const vencimiento = new Date(contract.vencimiento)
          const daysRemaining = Math.ceil((vencimiento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          return {
            id: contract.id,
            title: (contract as any).numeroContrato || `Contrato #${contract.id}`,
            expirationDate: contract.vencimiento,
            daysRemaining,
            clientName: (contract as any).clienteNombre,
          }
        })

      return {
        totalClients: clients.length,
        totalContracts: contracts.length,
        expiringContracts,
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      throw error
    }
  }

  // Clients
  async fetchClients(): Promise<Client[]> {
    return this.makeRequest<Client[]>(`${this.baseUrl}/Cliente`, {}, "obtener clientes")
  }

  async createClient(clientData: Omit<Client, "id">): Promise<Client> {
    console.log("Creating client with data:", clientData)

    return this.makeRequest<Client>(
      `${this.baseUrl}/Cliente`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      },
      "crear cliente",
    )
  }

  async updateClient(id: string, clientData: Omit<Client, "id">): Promise<Client> {
    console.log("Updating client:", { id, clientData })

    return this.makeRequest<Client>(
      `${this.baseUrl}/Cliente/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      },
      "actualizar cliente",
    )
  }

  async deleteClient(id: string): Promise<{ success: boolean }> {
    console.log("Deleting client:", id)

    await this.makeRequest(
      `${this.baseUrl}/Cliente/${id}`,
      {
        method: "DELETE",
      },
      "eliminar cliente",
    )

    return { success: true }
  }

  // Services
  async fetchServicios() {
    return this.makeRequest(`${this.baseUrl}/Servicios/listar`, {}, "obtener servicios")
  }

  async createServicio(data: { descripcion: string }) {
    console.log("Creating service with data:", data)

    return this.makeRequest(
      `${this.baseUrl}/Servicios/crear`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "crear servicio",
    )
  }

  // Contract Types
  async fetchTiposContrato() {
    return this.makeRequest(`${this.baseUrl}/TipoContratos`, {}, "obtener tipos de contrato")
  }

  // Companies
  async fetchEmpresas() {
    return this.makeRequest(`${this.baseUrl}/Empresa`, {}, "obtener empresas")
  }

  // Contracts
  async fetchContracts(): Promise<Contract[]> {
    return this.makeRequest<Contract[]>(`${this.baseUrl}/Contrato`, {}, "obtener contratos")
  }

  async getContractById(id: string | number): Promise<Contract> {
    return this.makeRequest<Contract>(`${this.baseUrl}/Contrato/${id}`, {}, "obtener contrato por ID")
  }

  async createContract(data: FormData): Promise<Contract> {
    // Log FormData contents for debugging
    console.log("Creating contract with FormData:")
    for (const [key, value] of data.entries()) {
      console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value)
    }

    return this.makeRequest<Contract>(
      `${this.baseUrl}/Contrato/create`,
      {
        method: "POST",
        body: data,
        // Don't set Content-Type for FormData - let browser set it
      },
      "crear contrato",
    )
  }

  async updateContract(id: string | number, formData: FormData): Promise<Contract> {
    // Log FormData contents for debugging
    console.log("Updating contract with FormData:")
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value)
    }

    return this.makeRequest<Contract>(
      `${this.baseUrl}/Contrato/${id}`,
      {
        method: "PUT",
        body: formData,
        // Don't set Content-Type for FormData - let browser set it
      },
      "actualizar contrato",
    )
  }

  async deleteContract(id: string): Promise<{ success: boolean }> {
    console.log("Deleting contract:", id)

    await this.makeRequest(
      `${this.baseUrl}/Contrato/${id}`,
      {
        method: "DELETE",
      },
      "eliminar contrato",
    )

    return { success: true }
  }

  // File operations
  async downloadContract(id: string): Promise<void> {
    try {
      console.log("Downloading contract:", id)

      const response = await fetch(`${this.baseUrl}/Archivos/ver/${id}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Error al descargar contrato: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `contrato_${id}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      console.log("Contract downloaded successfully:", id)
    } catch (error) {
      console.error("Error downloading contract:", error)
      throw error
    }
  }

  async viewContractPdf(fileId: string | number): Promise<void> {
    try {
      console.log("Viewing contract PDF:", fileId)

      const response = await fetch(`${this.baseUrl}/Archivos/ver/${fileId}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Error al visualizar el contrato: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // Open PDF in new tab
      window.open(url, "_blank")

      // Clean up after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 100)

      console.log("Contract PDF opened successfully:", fileId)
    } catch (error) {
      console.error("Error viewing PDF:", error)
      throw error
    }
  }
}

// Create singleton instance
const apiService = new ApiService()

// Export individual functions for backward compatibility
export const fetchDashboardData = () => apiService.fetchDashboardData()
export const fetchClients = () => apiService.fetchClients()
export const createClient = (clientData: Omit<Client, "id">) => apiService.createClient(clientData)
export const updateClient = (id: string, clientData: Omit<Client, "id">) => apiService.updateClient(id, clientData)
export const deleteClient = (id: string) => apiService.deleteClient(id)
export const fetchServicios = () => apiService.fetchServicios()
export const createServicio = (data: { descripcion: string }) => apiService.createServicio(data)
export const fetchTiposContrato = () => apiService.fetchTiposContrato()
export const fetchEmpresas = () => apiService.fetchEmpresas()
export const fetchContracts = () => apiService.fetchContracts()
export const getContractById = (id: string | number) => apiService.getContractById(id)
export const createContract = (data: FormData) => apiService.createContract(data)
export const updateContract = (id: string | number, formData: FormData) => apiService.updateContract(id, formData)
export const deleteContract = (id: string) => apiService.deleteContract(id)
export const downloadContract = (id: string) => apiService.downloadContract(id)
export const viewContractPdf = (fileId: string | number) => apiService.viewContractPdf(fileId)

// Export the service instance for advanced usage
export { apiService }
export default apiService
