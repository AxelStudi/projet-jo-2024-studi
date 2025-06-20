import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Ticket, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

interface DashboardStats {
  totalUsers: number;
  totalTickets: number;
  totalRevenue: number;
  pendingTransactions: number;
  usedTickets: number;
  activeOffers: number;
  recentTransactions: any[];
  topOffers: any[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTickets: 0,
    totalRevenue: 0,
    pendingTransactions: 0,
    usedTickets: 0,
    activeOffers: 0,
    recentTransactions: [],
    topOffers: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch all dashboard data in parallel
        const [
          usersResult,
          ticketsResult,
          transactionsResult,
          offersResult,
          recentTransactionsResult
        ] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('e_tickets').select('id, is_used', { count: 'exact' }),
          supabase.from('transactions').select('amount, status'),
          supabase.from('offers').select('id', { count: 'exact', head: true }),
          supabase
            .from('transactions')
            .select(`
              id,
              amount,
              status,
              created_at,
              users(first_name, last_name, email)
            `)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        // Calculate stats
        const totalUsers = usersResult.count || 0;
        const totalTickets = ticketsResult.count || 0;
        const usedTickets = ticketsResult.data?.filter(ticket => ticket.is_used).length || 0;
        const activeOffers = offersResult.count || 0;

        const transactions = transactionsResult.data || [];
        const totalRevenue = transactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

        setStats({
          totalUsers,
          totalTickets,
          totalRevenue,
          pendingTransactions,
          usedTickets,
          activeOffers,
          recentTransactions: recentTransactionsResult.data || [],
          topOffers: []
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner className="py-20" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de bord administrateur
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de la plateforme de billetterie JO Paris 2024
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs totaux</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Billets vendus</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTickets}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Ticket className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalRevenue.toLocaleString('fr-FR')} €
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Billets utilisés</p>
              <p className="text-3xl font-bold text-gray-900">{stats.usedTickets}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/users"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center mb-4">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Gestion des utilisateurs</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Gérer les comptes utilisateurs, permissions et statuts.
          </p>
          <div className="flex items-center text-blue-600 group-hover:text-blue-700">
            <span className="text-sm font-medium">Gérer les utilisateurs</span>
            <TrendingUp className="h-4 w-4 ml-2" />
          </div>
        </Link>

        <Link
          to="/admin/offres"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center mb-4">
            <Ticket className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Gestion des offres</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Créer, modifier et supprimer les offres de billets.
          </p>
          <div className="flex items-center text-green-600 group-hover:text-green-700">
            <span className="text-sm font-medium">Gérer les offres</span>
            <TrendingUp className="h-4 w-4 ml-2" />
          </div>
        </Link>

        <Link
          to="/admin/ventes"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center mb-4">
            <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Statistiques</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Analyser les ventes et les performances.
          </p>
          <div className="flex items-center text-purple-600 group-hover:text-purple-700">
            <span className="text-sm font-medium">Voir les statistiques</span>
            <TrendingUp className="h-4 w-4 ml-2" />
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transactions récentes
          </h3>
          <div className="space-y-4">
            {stats.recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucune transaction récente
              </p>
            ) : (
              stats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${
                      transaction.status === 'completed' ? 'bg-green-100' :
                      transaction.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {transaction.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : transaction.status === 'pending' ? (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.users?.first_name} {transaction.users?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {parseFloat(transaction.amount).toLocaleString('fr-FR')} €
                    </p>
                    <p className={`text-xs capitalize ${
                      transaction.status === 'completed' ? 'text-green-600' :
                      transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            État du système
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium text-gray-900">Base de données</span>
              </div>
              <span className="text-green-600 text-sm font-medium">Opérationnelle</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium text-gray-900">Paiements</span>
              </div>
              <span className="text-green-600 text-sm font-medium">Opérationnels</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="font-medium text-gray-900">Transactions en attente</span>
              </div>
              <span className="text-yellow-600 text-sm font-medium">
                {stats.pendingTransactions}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-gray-900">Offres actives</span>
              </div>
              <span className="text-blue-600 text-sm font-medium">
                {stats.activeOffers}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
