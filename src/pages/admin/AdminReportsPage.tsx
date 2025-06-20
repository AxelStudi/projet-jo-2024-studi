import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download, 
  TrendingUp, 
  Users, 
  DollarSign,
  Ticket
} from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

interface ReportData {
  salesByMonth: any[];
  salesByOffer: any[];
  userRegistrations: any[];
  transactionStatus: any[];
  topOffers: any[];
  revenueMetrics: {
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    totalUsers: number;
    totalTransactions: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    salesByMonth: [],
    salesByOffer: [],
    userRegistrations: [],
    transactionStatus: [],
    topOffers: [],
    revenueMetrics: {
      totalRevenue: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      totalUsers: 0,
      totalTransactions: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Fetch all necessary data
      const [
        transactionsResult,
        usersResult,
        reservationsResult
      ] = await Promise.all([
        supabase.from('transactions').select('*'),
        supabase.from('users').select('*'),
        supabase.from('reservations').select('*, offers(*)')
      ]);

      const transactions = transactionsResult.data || [];
      const users = usersResult.data || [];
      const reservations = reservationsResult.data || [];

      // Process data for charts
      const salesByMonth = processSalesByMonth(transactions);
      const salesByOffer = processSalesByOffer(reservations);
      const userRegistrations = processUserRegistrations(users);
      const transactionStatus = processTransactionStatus(transactions);
      const topOffers = processTopOffers(reservations);

      // Calculate revenue metrics
      const completedTransactions = transactions.filter(t => t.status === 'completed');
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
      const averageOrderValue = completedTransactions.length > 0 ? totalRevenue / completedTransactions.length : 0;
      const conversionRate = users.length > 0 ? (completedTransactions.length / users.length) * 100 : 0;

      setReportData({
        salesByMonth,
        salesByOffer,
        userRegistrations,
        transactionStatus,
        topOffers,
        revenueMetrics: {
          totalRevenue,
          averageOrderValue,
          conversionRate,
          totalUsers: users.length,
          totalTransactions: transactions.length
        }
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const processSalesByMonth = (transactions: any[]) => {
    const monthlyData: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      if (transaction.status === 'completed') {
        const date = new Date(transaction.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + parseFloat(transaction.amount);
      }
    });

    return Object.entries(monthlyData)
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        revenue
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const processSalesByOffer = (reservations: any[]) => {
    const offerData: { [key: string]: { revenue: number, quantity: number } } = {};
    
    reservations.forEach(reservation => {
      const offerName = reservation.offers?.name || 'Inconnu';
      const revenue = (reservation.offers?.price || 0) * reservation.quantity;
      
      if (!offerData[offerName]) {
        offerData[offerName] = { revenue: 0, quantity: 0 };
      }
      
      offerData[offerName].revenue += revenue;
      offerData[offerName].quantity += reservation.quantity;
    });

    return Object.entries(offerData).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      quantity: data.quantity
    }));
  };

  const processUserRegistrations = (users: any[]) => {
    const registrationData: { [key: string]: number } = {};
    
    users.forEach(user => {
      const date = new Date(user.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      registrationData[monthKey] = (registrationData[monthKey] || 0) + 1;
    });

    return Object.entries(registrationData)
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        users: count
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const processTransactionStatus = (transactions: any[]) => {
    const statusData: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      statusData[transaction.status] = (statusData[transaction.status] || 0) + 1;
    });

    return Object.entries(statusData).map(([status, count]) => ({
      name: status === 'completed' ? 'Complétées' :
            status === 'pending' ? 'En attente' :
            status === 'failed' ? 'Échouées' : 'Remboursées',
      value: count
    }));
  };

  const processTopOffers = (reservations: any[]) => {
    const offerStats: { [key: string]: { quantity: number, revenue: number } } = {};
    
    reservations.forEach(reservation => {
      const offerName = reservation.offers?.name || 'Inconnu';
      const revenue = (reservation.offers?.price || 0) * reservation.quantity;
      
      if (!offerStats[offerName]) {
        offerStats[offerName] = { quantity: 0, revenue: 0 };
      }
      
      offerStats[offerName].quantity += reservation.quantity;
      offerStats[offerName].revenue += revenue;
    });

    return Object.entries(offerStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const exportReport = () => {
    const reportContent = {
      generatedAt: new Date().toISOString(),
      period: selectedPeriod,
      metrics: reportData.revenueMetrics,
      salesByMonth: reportData.salesByMonth,
      salesByOffer: reportData.salesByOffer,
      topOffers: reportData.topOffers
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Rapport exporté avec succès');
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
            Rapports et analyses
          </h1>
          <p className="text-gray-600">
            Analyses détaillées des performances de la plateforme
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input"
          >
            <option value="1month">1 mois</option>
            <option value="3months">3 mois</option>
            <option value="6months">6 mois</option>
            <option value="1year">1 an</option>
          </select>
          
          <button
            onClick={exportReport}
            className="btn btn-primary flex items-center"
          >
            <Download size={18} className="mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-bold">
                {reportData.revenueMetrics.totalRevenue.toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Panier moyen</p>
              <p className="text-2xl font-bold">
                {reportData.revenueMetrics.averageOrderValue.toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Utilisateurs</p>
              <p className="text-2xl font-bold">
                {reportData.revenueMetrics.totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full mr-4">
              <Ticket className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold">
                {reportData.revenueMetrics.totalTransactions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full mr-4">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Taux conversion</p>
              <p className="text-2xl font-bold">
                {reportData.revenueMetrics.conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales by Month */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Évolution des ventes</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toLocaleString('fr-FR')} €`, 'Revenus']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Registrations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Inscriptions d'utilisateurs</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.userRegistrations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Offer */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Ventes par offre</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.salesByOffer}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toLocaleString('fr-FR')} €`, 'Revenus']} />
                <Legend />
                <Bar dataKey="revenue" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Statut des transactions</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.transactionStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.transactionStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Offers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Top 5 des offres</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité vendue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part du CA
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.topOffers.map((offer, index) => (
                <tr key={offer.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium">{index + 1}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{offer.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {offer.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {offer.revenue.toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(offer.revenue / reportData.revenueMetrics.totalRevenue) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">
                        {((offer.revenue / reportData.revenueMetrics.totalRevenue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
