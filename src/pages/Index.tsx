import { useState } from 'react';
import { Transaction } from '@/types/transaction';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { TransactionSummary } from '@/components/TransactionSummary';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const { toast } = useToast();

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    if (editingTransaction) {
      setTransactions(prev => 
        prev.map(t => t.id === editingTransaction.id ? { ...transaction, id: editingTransaction.id, createdAt: editingTransaction.createdAt } : t)
      );
      setEditingTransaction(undefined);
      toast({ title: 'Transação atualizada com sucesso!' });
    } else {
      setTransactions(prev => [transaction, ...prev]);
      toast({ title: 'Transação adicionada com sucesso!' });
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({ title: 'Transação excluída com sucesso!' });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Quaint Money</h1>
          <p className="text-muted-foreground">Controle suas finanças de forma simples</p>
        </header>

        <div className="space-y-6">
          <TransactionSummary transactions={transactions} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TransactionForm 
              onSubmit={handleAddTransaction}
              editingTransaction={editingTransaction}
              onCancel={handleCancelEdit}
            />
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Transações Recentes</h2>
              <TransactionList 
                transactions={transactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
