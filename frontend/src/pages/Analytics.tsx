import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, MousePointerClick, Monitor, Smartphone, Tablet, HelpCircle } from 'lucide-react';

interface AnalyticsData {
  shortId: string;
  totalClicks: number;
  deviceBreakdown: {
    Desktop: number;
    Mobile: number;
    Tablet: number;
    Other: number;
  };
  clicksByDate: Array<{ date: string; clicks: number }>;
  recentClicks: Array<{
    ip: string;
    userAgent: string;
    referrer: string;
    timestamp: string;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const DEVICE_ICONS: Record<string, any> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
  Other: HelpCircle,
};

export default function Analytics() {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchAnalytics = async () => {
    if (!shortId) return;

    try {
      const response = await analyticsService.getAnalytics(shortId);

      // unwrap backend response
      const apiData = response.data.analytics;

      // transform clicksByDate { "2025-10-01": 2 } into array [{date, clicks}]
      const clicksByDateArray = Object.entries(apiData.clicksByDate).map(
        ([date, clicks]) => ({ date, clicks })
      );

      const transformed: AnalyticsData = {
        shortId: response.data.shortId,
        totalClicks: apiData.totalClicks,
        deviceBreakdown: {
          Desktop: apiData.deviceBreakdown.Desktop || 0,
          Mobile: apiData.deviceBreakdown.Mobile || 0,
          Tablet: apiData.deviceBreakdown.Tablet || 0,
          Other: apiData.deviceBreakdown.Other || 0,
        },
        clicksByDate: clicksByDateArray,
        recentClicks: apiData.recentClicks,
      };

      setAnalytics(transformed);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  fetchAnalytics();
}, [shortId]);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const deviceData = analytics
    ? Object.entries(analytics.deviceBreakdown).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics for {shortId}</h1>
          <p className="text-gray-600">Detailed insights and statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalClicks}</p>
              </div>
              <MousePointerClick className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          {Object.entries(analytics.deviceBreakdown).map(([device, count]) => {
            const Icon = DEVICE_ICONS[device];
            return (
              <div key={device} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{device}</p>
                    <p className="text-3xl font-bold text-gray-900">{count}</p>
                  </div>
                  <Icon className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Clicks Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.clicksByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip labelFormatter={formatDate} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Clicks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Device Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name: string; percent?: number }) =>
  `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
}

                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Clicks</h2>
          {analytics.recentClicks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No clicks yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.recentClicks.map((click, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {click.ip}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {click.userAgent}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {click.referrer || 'Direct'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(click.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}