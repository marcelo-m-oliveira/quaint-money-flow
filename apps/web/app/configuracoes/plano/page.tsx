'use client'

import { Database } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PlanoPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Plano
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gerencie seu plano e assinatura
        </p>
      </CardHeader>
      <CardContent>
        <div className="py-12 text-center text-muted-foreground">
          <Database className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p className="mb-2 text-lg font-medium">Em desenvolvimento</p>
          <p className="text-sm">
            Esta funcionalidade estará disponível em breve
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
