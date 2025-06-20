import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { fetchAdminSalesData } from '../../supabase/supabaseClient';
import { toast } from 'react-toastify';

interface SalesData {
  id: string;
  name: string;
  price: number;
  reservations: { count: number }[];
  totalSales?: number;
}

const AdminSalesPage: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    const loadSalesData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await fetchAdminSalesData();
        
        if (error) {
          console.error('Error fetching sales data:', error);
          toast.error('Erreur lors du chargement des données de ventes');
          return;
        }
        
        if (data) {
          // Calculate total sales for each offer
          const processedData = data.map(offer => ({
            ...offer,
            totalSales: (offer.reservations?.[0]?.count || 0) * offer.price
          }));
          
          setSalesData(processedData);
          
          // Prepare chart data
          const chartData = processedData.map(offer => ({
            name: offer.name,
            Ventes: offer.totalSales || 0,
            Billets: offer.reservations?.[0]?.count || 0
          }));
          
          setChartData(chartData);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSalesData();
  }, []);
  
  // Filter data based on selected period (mock implementation)
  const filterByPeriod = (period: string) => {
    setSelectedPeriod(period);
    // In a real implementation, this would filter data based on date ranges
    toast.info(`Filtre appliqué: ${
      period === 'all' ? 'Toutes les périodes' : 
      period === 'month' ? 'Ce mois' : 
      period === 'week' ? 'Cette semaine' : 'Aujourd\'hui'
    }`);
  };
  
  // Export data (mock)
  const exportData = () => {
    toast.info('Export des données en cours...');
    // In a real implementation, this would generate a CSV/Excel file
  };
  
  // Calculate totals
  const totalRevenue = salesData.reduce((sum, item) => sum + (item.totalSales || 0), 0);
  const totalTickets = salesData.reduce((sum, item) => sum + (item.reservations?.[0]?.count || 0), 0);
  
  if (isLoading) {
    return <LoadingSpinner className="py-20" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Statistiques des ventes</h1>
          <p className="text-gray-600">
            Analysez les ventes de billets par offre
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => filterByPeriod('all')}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedPeriod === 'all'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => filterByPeriod('month')}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedPeriod === 'month'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => filterByPeriod('week')}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedPeriod === 'week'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => filterByPeriod('day')}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedPeriod === 'day'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Jour
            </button>
          </div>
          
          <button
            onClick={exportData}
            className="btn btn-outline flex items-center justify-center"
          >
            <Download size={18} className="mr-2" />
            Exporter
          </button>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Revenu total</p>
          <h3 className="text-2xl font-bold">{totalRevenue.toLocaleString('fr-FR')} €</h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Billets vendus</p>
          <h3 className="text-2xl font-bold">{totalTickets}</h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Prix moyen</p>
          <h3 className="text-2xl font-bold">
            {(totalTickets > 0 ? totalRevenue / totalTickets : 0).toLocaleString('fr-FR')} €
          </h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full p-3 bg-gray-100 mr-4">
            <Calendar className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Période</p>
            <h3 className="font-medium">
              {selectedPeriod === 'all' ? 'Toutes les périodes' : 
               selectedPeriod === 'month' ? 'Ce mois' : 
               selectedPeriod === 'week' ? 'Cette semaine' : 'Aujourd\'hui'}
            </h3>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Revenus par offre</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toLocaleString('fr-FR')} €`, 'Ventes']} />
                <Legend />
                <Bar dataKey="Ventes" fill="#0066cc" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Billets vendus par offre</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Billets" fill="#ee334e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Data table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix unitaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Billets vendus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % du total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.price.toLocaleString('fr-FR')} €
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.reservations?.[0]?.count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {(item.totalSales || 0).toLocaleString('fr-FR')} €
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {totalRevenue > 0 
                        ? `${(((item.totalSales || 0) / totalRevenue) * 100).toFixed(1)}%` 
                        : '0%'
                      }
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-primary-blue h-1.5 rounded-full" 
                        style={{ 
                          width: totalRevenue > 0 
                            ? `${((item.totalSales || 0) / totalRevenue) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
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

export default AdminSalesPage;