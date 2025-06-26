"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient, updateClient } from "../services/api-service";
import { useToast } from "@/hooks/use-toast";

interface ClientFormProps {
  client?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ClientForm({
  client,
  onCancel,
  onSuccess,
}: ClientFormProps) {
  const isEditing = !!client;
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: client?.name || "",
    lastName: client?.lastName || "",
    address: client?.address || "",
    email: client?.email || "",
    documento_Identidad: client?.documento_Identidad || "",
    phone: client?.phone || "",
    notes: client?.notes || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Nombre y email son campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        await updateClient(client.id, formData);
        toast({
          title: "Cliente actualizado",
          description:
            "Los datos del cliente han sido actualizados exitosamente",
        });
      } else {
        await createClient(formData);
        toast({
          title: "Cliente creado",
          description: "El cliente ha sido creado exitosamente",
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el cliente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Cliente" : "Nuevo Cliente"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Apellido *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Cedula *</Label>
              <Input
                id="documento_Identidad"
                name="documento_Identidad"
                type="documento_Identidad"
                value={formData.documento_Identidad
                }
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
