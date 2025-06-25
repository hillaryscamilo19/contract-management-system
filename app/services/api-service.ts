// services/api-service.ts

const API_BASE_URL = "http://localhost:5210/api"

// DASHBOARD
export const fetchDashboardData = async () => {
  const [clientsRes, contractsRes] = await Promise.all([
    fetch(`${API_BASE_URL}/Cliente`),
    fetch(`${API_BASE_URL}/Contrato`)
  ])

  if (!clientsRes.ok || !contractsRes.ok) {
    throw new Error("Error al obtener datos del dashboard")
  }

  const clients = await clientsRes.json()
  const contracts = await contractsRes.json()

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
        title: contract.numeroContrato || `Contrato #${contract.id}`,
        expirationDate: contract.vencimiento,
        daysRemaining,
        clientName: contract.clienteNombre,
      }
    })

  return {
    totalClients: clients.length,
    totalContracts: contracts.length,
    expiringContracts,
  }
}

// CLIENTES
export const fetchClients = async () => {
  const res = await fetch(`${API_BASE_URL}/Cliente`)
  if (!res.ok) throw new Error("Error al obtener clientes")
  return await res.json()
}

export const createClient = async (clientData) => {
  const res = await fetch(`${API_BASE_URL}/Cliente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clientData),
  })

  if (!res.ok) throw new Error("Error al crear cliente")
  return await res.json()
}

export const updateClient = async (id, clientData) => {
  const res = await fetch(`${API_BASE_URL}/Cliente/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clientData),
  })

  if (!res.ok) throw new Error("Error al actualizar cliente")
  return await res.json()
}

export const deleteClient = async (id) => {
  const res = await fetch(`${API_BASE_URL}/Cliente/${id}`, {
    method: "DELETE",
  })

  if (!res.ok) throw new Error("Error al eliminar cliente")
  return { success: true }
}

// CONTRATOS
export const fetchContracts = async () => {
  const res = await fetch(`${API_BASE_URL}/Contrato`)
  if (!res.ok) throw new Error("Error al obtener contratos")
  return await res.json()
}

export const createContract = async (formData) => {
  const data = new FormData()

  data.append("clienteId", formData.clientId)
  data.append("numeroContrato", formData.title)
  data.append("descripcion", formData.description)
  data.append("vencimiento", formData.expirationDate.toISOString())
  data.append("creado", formData.startDate.toISOString())

  if (formData.file) {
    data.append("file", formData.file)
  }

  const res = await fetch(`${API_BASE_URL}/Contrato/create`, {
    method: "POST",
    body: data,
  })

  if (!res.ok) throw new Error("Error al crear contrato")
  return await res.json()
}

export const updateContract = async (id, formData) => {
  const data = new FormData()

  data.append("id", id)
  data.append("clienteId", formData.clientId)
  data.append("numeroContrato", formData.title)
  data.append("descripcion", formData.description)
  data.append("vencimiento", formData.expirationDate.toISOString())
  data.append("creado", formData.startDate.toISOString())

  if (formData.file) {
    data.append("file", formData.file)
  }

  const res = await fetch(`${API_BASE_URL}/Contrato/${id}`, {
    method: "PUT",
    body: data,
  })

  if (!res.ok) throw new Error("Error al actualizar contrato")
  return await res.json()
}

export const deleteContract = async (id) => {
  const res = await fetch(`${API_BASE_URL}/Contrato/${id}`, {
    method: "DELETE",
  })

  if (!res.ok) throw new Error("Error al eliminar contrato")
  return { success: true }
}

export const downloadContract = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:5210/api/Archivos/ver/${id}`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`Error al descargar contrato: ${response.estado}`)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `contrato_${id}.pdf` // puedes cambiar a extensión dinámica si backend la da
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error downloading contract:", error)
    throw error
  }
}
