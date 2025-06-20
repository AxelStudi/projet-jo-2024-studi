
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Calendar,
  DollarSign
} from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

interface Transaction {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string | null;
  created_at: string | null;
  users: {
    first_name: string;
    last_name: string;
    email: string;
  };
  reservations: Array<{
    quantity: number;
    offers: {
      name: string;
      type: string;
    };
  }>;
}

const AdminTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          users(first_name, last_name, email),
          reservations(
            quantity,
            offers(name, type)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions((data as Transaction[]) || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Erreur lors du chargement des transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransactionStatus = async (transactionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', transactionId);

      if (error) throw error;

      setTransactions(transactions.map(t => 
        t.id === transactionId ? { ...t, status: newStatus as any } : t
      ));

      toast.success('Statut de la transaction mis à jour');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      ['ID', 'Utilisateur', 'Email', 'Montant', 'Statut', 'Méthode', 'Date'].join(','),
      ...filteredTransactions.map(t => [
        t.id,
        `${t.users.first_name} ${t.users.last_name}`,
        t.users.email,
        t.amount,
        t.status,
        t.payment_method || 'N/A',
        t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Export des transactions terminé');
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.users.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.users.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.users.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'refunded':
        return <RefreshCw className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="py-20" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des transactions
          </h1>
          <p className="text-gray-600">
            Suivre et gérer toutes les transactions de paiement
          </p>
        </div>
        
        <button
          onClick={exportTransactions}
          className="btn btn-primary flex items-center mt-4 md:mt-0"
        >
          <Download size={18} className="mr-2" />
          Exporter CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Complétées</p>
              <p className="text-2xl font-bold">
                {transactions.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold">
                {transactions.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full mr-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Échouées</p>
              <p className="text-2xl font-bold">
                {transactions.filter(t => t.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-bold">
                {transactions
                  .filter(t => t.status === 'completed')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par utilisateur, email ou ID..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                statusFilter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Complétées
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                statusFilter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                statusFilter === 'failed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Échouées
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.id.substring(0, 8)}...
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.payment_method || 'Carte de crédit'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.users.first_name} {transaction.users.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.users.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.amount.toLocaleString('fr-FR')} €
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(transaction.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status === 'completed' ? 'Complétée' :
                         transaction.status === 'pending' ? 'En attente' :
                         transaction.status === 'failed' ? 'Échouée' : 'Remboursée'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString('fr-FR') : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
                        title="Voir les détails"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {transaction.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateTransactionStatus(transaction.id, 'completed')}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-md"
                            title="Marquer comme complétée"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => updateTransactionStatus(transaction.id, 'failed')}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                            title="Marquer comme échouée"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      
                      {transaction.status === 'completed' && (
                        <button
                          onClick={() => updateTransactionStatus(transaction.id, 'refunded')}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
                          title="Rembourser"
                        >
                          <RefreshCw size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune transaction trouvée</p>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {isModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Détails de la transaction
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID Transaction</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <div className="mt-1 flex items-center">
                      {getStatusIcon(selectedTransaction.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                        {selectedTransaction.status === 'completed' ? 'Complétée' :
                         selectedTransaction.status === 'pending' ? 'En attente' :
                         selectedTransaction.status === 'failed' ? 'Échouée' : 'Remboursée'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Montant</label>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {selectedTransaction.amount.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Méthode de paiement</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTransaction.payment_method || 'Carte de crédit'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Utilisateur</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="font-medium">
                      {selectedTransaction.users.first_name} {selectedTransaction.users.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{selectedTransaction.users.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Articles achetés</label>
                  <div className="mt-1 space-y-2">
                    {selectedTransaction.reservations.map((reservation, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{reservation.offers.name}</p>
                            <p className="text-sm text-gray-600">
                              Type: {reservation.offers.type} • Quantité: {reservation.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de création</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTransaction.created_at ? new Date(selectedTransaction.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : ''}
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactionsPage;
