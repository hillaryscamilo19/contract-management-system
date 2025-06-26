// services/api-service.ts

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

// CLIENTES
export const fetchClients = async () => {
  const res = await fetch(`${API_BASE_URL}/Cliente`);
  if (!res.ok) throw new Error("Error al obtener clientes");
  return await res.json();
};

//servicios
export const fetchServicios = async () => {
  const res = await fetch(`${API_BASE_URL}/Servicios`);
  if (!res.ok) throw new Error("Error al obtener clientes");
  return await res.json();
};


//tipo de contracto
export const fetchTiposContrato = async () => {
  const res = await fetch(`${API_BASE_URL}/TipoContratos`);
  if (!res.ok) throw new Error("Error al obtener clientes");
  return await res.json();
};

//tipo de empresa
export const fetchEmpresas = async () => {
  const res = await fetch(`${API_BASE_URL}/Empresa`);
  if (!res.ok) throw new Error("Error al obtener clientes");
  return await res.json();
};


export const createClient = async (clientData: {
name: any; email: any; phone: any; address: any; lastName: any; documento_Identidad: any
}) => {
  const res = await fetch(`${API_BASE_URL}/Cliente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clientData),
  });

  if (!res.ok) throw new Error("Error al crear cliente");
  return await res.json();
};

export const updateClient = async (
  id: any,
  clientData: { name: any; email: any; phone: any; address: any; lastName: any; documento_Identidad: any }
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

export const createContract = async (formData: {
  id: any;
  descripcion: any;
  estado: any;
  clienteNombre: any;
  clientId: any;
  creado: any;
  vencimiento: any;
  clienteId: any;
  serviciosId: any;
  servicio: any;
  empresa: any;
  tipoContrato: any;
  empresaPropietario: any;
  archivos: any;
}) => {
  const data = new FormData();

data.append("descripcion", formData.descripcion);
data.append("estado", formData.estado);
data.append("creado", formData.creado); // ya está en formato 'YYYY-MM-DD'
data.append("vencimiento", formData.vencimiento);
data.append("clienteId", formData.clienteId.toString());
data.append("serviciosId", formData.serviciosId.toString());
data.append("empresa", formData.empresa.toString());
data.append("tipoContrato", formData.tipoContrato.toString());
data.append("empresaPropietario", formData.empresaPropietario.toString());
if (formData.archivos) {
  data.append("file", formData.archivos);
}

  if (formData.archivos) {
    data.append("file", formData.archivos);
  }
console.log("Datos enviados al backend:", {
  descripcion: formData.descripcion,
 estado: Number(formData.estado), 
  creado: formData.creado,
  vencimiento: formData.vencimiento,
  clienteId: Number(formData.clienteId), 
  serviciosId: Number(formData.serviciosId),
  empresa: formData.empresa,
  tipoContrato: Number(formData.tipoContrato),
  empresaPropietario: formData.empresaPropietario,
});

  const res = await fetch(`${API_BASE_URL}/Contrato/create`, {
    method: "POST",
    body: data,
  });

  if (!res.ok) throw new Error("Error al crear contrato");
  return await res.json();
};

export const updateContract = async (
  formData: {
     id: any;
  descripcion: any;
  estado: any;
  clienteNombre: any;
  creado: any;
  vencimiento: any;
  clienteId: any;
  serviciosId: any;
  servicio: any;
  empresa: any;
  tipoContrato: any;
  empresaPropietario: any;
  archivos: any;
  }
) => {
  const data = new FormData();

  data.append("id", id);
  data.append("clienteId", formData.clienteId);
  data.append("descripcion", formData.descripcion);
  data.append("vencimiento", formData.vencimiento.toISOString());
  data.append("creado", formData.creado.toISOString());

  if (formData.archivos) {
    data.append("file", formData.archivos);
  }

  const res = await fetch(`${API_BASE_URL}/Contrato/${id}`, {
    method: "PUT",
    body: data,
  });

  if (!res.ok) throw new Error("Error al actualizar contrato");
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
