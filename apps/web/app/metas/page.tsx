'use client'

import { Target } from 'lucide-react'

import { Topbar } from '@/components/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MetasPage() {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Defina e acompanhe suas metas financeiras
            </p>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center text-muted-foreground">
              <Target className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="mb-2 text-lg font-medium">Em desenvolvimento</p>
              <p className="text-sm">
                Esta funcionalidade estará disponível em breve
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}