'use client'

import { User } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AtividadesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Atividades
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visualize o histórico de atividades
        </p>
      </CardHeader>
      <CardContent>
        <div className="py-12 text-center text-muted-foreground">
          <User className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p className="mb-2 text-lg font-medium">Em desenvolvimento</p>
          <p className="text-sm">
            Esta funcionalidade estará disponível em breve
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
