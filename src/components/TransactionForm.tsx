import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, CATEGORIES } from '@/types/transaction';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editingTransaction?: Transaction;
  onCancel?: () => void;
}

export const TransactionForm = ({ onSubmit, editingTransaction, onCancel }: TransactionFormProps) => {
  const [description, setDescription] = useState(editingTransaction?.description || '');
  const [amount, setAmount] = useState(editingTransaction?.amount?.toString() || '');
  const [type, setType] = useState<'income' | 'expense'>(editingTransaction?.type || 'expense');
  const [category, setCategory] = useState(editingTransaction?.category || '');
  const [date, setDate] = useState(editingTransaction?.date || new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) return;

    onSubmit({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
    });

    if (!editingTransaction) {
      setDescription('');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Almoço no restaurante"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(value: 'income' | 'expense') => {
              setType(value);
              setCategory('');
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES[type].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {editingTransaction ? 'Atualizar' : 'Adicionar'}
            </Button>
            {editingTransaction && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};