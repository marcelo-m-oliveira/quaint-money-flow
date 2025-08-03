'use client'

import { Bell } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AlertasPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alertas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure notificações e alertas
        </p>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Em desenvolvimento</p>
          <p className="text-sm">
            Esta funcionalidade estará disponível em breve
          </p>
        </div>
      </CardContent>
    </Card>
  )
}