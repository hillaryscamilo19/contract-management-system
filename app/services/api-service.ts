// services/api-service.ts

import { toast } from "sonner";

const API_BASE_URL = "http://10.0.0.15:5210/api";

// DASHBOARD
export const fetchDashboardData = async () => {
  const [clientsRes, contractsRes] = await Promise.all([
    fetch(`${API_BASE_URL}/Cliente`),
    fetch(`${API_BASE_URL}/Contrato`),
  ]);

  if (!clientsRes.ok || !contractsRes.ok) {
    throw new Error("Error al obtener datos del dashboard");
  }

  const clients = await clientsRes.json();
  const contracts = await contractsRes.json();

  const now = new Date();
  const expiringContracts = contracts
    .filter((contract: { vencimiento: string | number | Date }) => {
      const vencimiento = new Date(contract.vencimiento);
      return (
        vencimiento > now &&
        vencimiento <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      );
    })
    .map(
      (contract: {
        vencimiento: string | number | Date;
        id: any;
        numeroContrato: any;
        clienteNombre: any;
      }) => {
        const vencimiento = new Date(contract.vencimiento);
        const daysRemaining = Math.ceil(
          (vencimiento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          id: contract.id,
          title: contract.numeroContrato || `Contrato #${contract.id}`,
          expirationDate: contract.vencimiento,
          daysRemaining,
          clientName: contract.clienteNombre,
        };
      }
    );

  return {
    totalClients: clients.length,
    totalContracts: contracts.length,
    expiringContracts,
  };
};

// CLIENTES Contratos Por ID
export const fetchClients = async () => {
  const res = await fetch(`${API_BASE_URL}/Cliente`);
  if (!res.ok) throw new Error("Error al obtener clientes");
  return await res.json();
};

//servicios
export async function fetchServicios() {
  const response = await fetch("http://10.0.0.15:5210/api/Servicios/listar");
  if (!response.ok) {
    throw new Error("No se pudieron cargar los servicios");
  }
  return response.json();
}

//crearServicios
export async function createServicio(data: { descripcion: string }) {
  const response = await fetch("http://10.0.0.15:5210/api/Servicios/crear", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al crear el servicio");
  }

  return response.json();
}

//tipo de contracto
export const fetchTiposContrato = async () => {
  const res = await fetch(`${API_BASE_URL}/TipoContratos`);
  if (!res.ok) throw new Error("Error al obtener clientes");
  return await res.json();
};

// empresa & propietario
export const fetchEmpresas = async () => {
  const res = await fetch(`${API_BASE_URL}/Empresa`);
  if (!res.ok) throw new Error("Error al obtener Empresa y propietario");
  return await res.json();
};

export const createClient = async (clientData: {
  name: any;
  email: any;
  phone: any;
  address: any;
  lastName: any;
  documento_Identidad: any;
}) => {
  const res = await fetch(`${API_BASE_URL}/Cliente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clientData),
  });

  if (!res.ok) throw new Error("Error al crear cliente");
  return await res.json();
};

export async function getContractById(id: string | number) {
  try {
    const response = await fetch(`${API_BASE_URL}/Contrato/${id}`); // ajusta la URL según tu API real
    if (!response.ok) {
      throw new Error(`Error al obtener contrato con id ${id}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getContractById:", error);
    throw error;
  }
}


export const updateClient = async (
  id: any,
  clientData: {
    name: any;
    email: any;
    phone: any;
    address: any;
    lastName: any;
    documento_Identidad: any;
  }
) => {
  const res = await fetch(`${API_BASE_URL}/Cliente/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clientData),
  });

  if (!res.ok) throw new Error("Error al actualizar cliente");
  return await res.json();
};

export const deleteClient = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/Cliente/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Error al eliminar cliente");
  return { success: true };
};

// CONTRATOS
export const fetchContracts = async () => {
  const res = await fetch(`${API_BASE_URL}/Contrato`);
  if (!res.ok) throw new Error("Error al obtener contratos");
  return await res.json();
};

export const createContract = async (data: FormData) => {
  const res = await fetch("http://10.0.0.15:5210/api/Contrato/create", {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Error al subir el contrato: " + text);
  }

  return await res.json();
};

export const updateContract = async (id: string) => {
  const res = await fetch(`http://10.0.0.15:5210/api/Contrato/${id}`, {
    method: "PUT", // Usa POST si tu backend no admite PUT
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(FormData),
  });

  if (!res.ok) {
    throw new Error("Error al actualizar contrato");
  }

  return await res.json();
};

export const deleteContract = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/Contrato/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Error al eliminar contrato");
  return { success: true };
};

export const downloadContract = async (id: string) => {
  try {
    const response = await fetch(
      `http://10.0.0.15:5210/api/Archivos/ver/${id}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`Error al descargar contrato: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `contrato_${id}.pdf`; // puedes cambiar a extensión dinámica si backend la da
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading contract:", error);
    throw error;
  }
};

export const viewContractPdf = async (fileId: number) => {
  try {
    const response = await fetch(
      `http://10.0.0.15:5210/api/Archivos/ver/${fileId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`Error al visualizar el contrato: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Abre el PDF en una nueva pestaña
    window.open(url, "_blank");

    // Opcional: limpia el objeto después
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("Error visualizando el PDF:", error);
  }
};
