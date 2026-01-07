import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Scissors, Loader2, Clock } from "lucide-react";
import { useServices, Service } from "@/hooks/useServices";
import { useCurrentUnit } from "@/contexts/UnitContext";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceFormModal } from "@/components/services/ServiceFormModal";
import { Card, CardContent } from "@/components/ui/card";

const EXAMPLE_SERVICES = [
  { name: "Corte Masculino", price: 45, duration_minutes: 30 },
  { name: "Barba", price: 30, duration_minutes: 20 },
  { name: "Corte + Barba", price: 65, duration_minutes: 45 },
  { name: "Corte Infantil", price: 35, duration_minutes: 25 },
  { name: "Sobrancelha", price: 15, duration_minutes: 10 },
  { name: "Pigmentação de Barba", price: 80, duration_minutes: 40 },
  { name: "Hidratação Capilar", price: 50, duration_minutes: 30 },
  { name: "Corte Degradê", price: 55, duration_minutes: 40 },
];

export default function Servicos() {
  const { currentUnitId, isLoading: unitLoading } = useCurrentUnit();
  const { services, isLoading, createService, updateService, deleteService } = useServices(currentUnitId);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleOpenModal = (service?: Service) => {
    setEditingService(service || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = (data: any) => {
    if (editingService) {
      updateService.mutate({ id: editingService.id, ...data }, {
        onSuccess: handleCloseModal
      });
    } else {
      createService.mutate(data, {
        onSuccess: handleCloseModal
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteService.mutate(id);
  };

  const handleAddExampleService = (example: typeof EXAMPLE_SERVICES[0]) => {
    createService.mutate({
      name: example.name,
      price: example.price,
      duration_minutes: example.duration_minutes,
      is_active: true,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  if (unitLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Serviços</h1>
            <p className="mt-1 text-muted-foreground">Cadastre cortes e defina preços</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : services.length === 0 ? (
          <div className="space-y-6">
            <div className="text-center">
              <Scissors className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">Comece com exemplos ou crie do zero</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Clique para adicionar, depois edite conforme seu negócio
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {EXAMPLE_SERVICES.map((example) => (
                <Card 
                  key={example.name}
                  className="border-dashed border-2 hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => handleAddExampleService(example)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-medium text-foreground">{example.name}</h4>
                    <p className="text-lg font-semibold text-primary">{formatPrice(example.price)}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{example.duration_minutes} min</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={() => handleOpenModal()} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar serviço personalizado
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <ServiceFormModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        service={editingService}
        onSubmit={handleSubmit}
        isLoading={createService.isPending || updateService.isPending}
      />
    </DashboardLayout>
  );
}