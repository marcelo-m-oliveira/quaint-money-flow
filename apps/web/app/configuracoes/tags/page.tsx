'use client'

import { Tag } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TagsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Tags
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Organize suas transações com tags
        </p>
      </CardHeader>
      <CardContent>
        <div className="py-12 text-center text-muted-foreground">
          <Tag className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p className="mb-2 text-lg font-medium">Em desenvolvimento</p>
          <p className="text-sm">
            Esta funcionalidade estará disponível em breve
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
