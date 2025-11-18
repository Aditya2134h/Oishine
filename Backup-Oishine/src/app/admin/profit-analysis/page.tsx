'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Target,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  CreditCard,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  CellProps
} from 'recharts';
import { toast } from '@/hooks/use-toast';

interface ProfitData {
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalCosts: number;
    grossProfit: number;
    operatingProfit: number;
    netProfit: number;
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
  };
  costs: {
    ingredientCost: number;
    packagingCost: number;
    deliveryCost: number;
    operationalCost: number;
    marketingCost: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    revenue: number;
    profit: number;
    margin: number;
    orders: number;
  }>;
  worstProducts: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    revenue: number;
    profit: number;
    margin: number;
    orders: number;
  }>;
  dailyTrend: Array<{
    date: string;
    revenue: number;
    orders: number;
    profit: number;
    margin: number;
  }>;
  paymentMethods: Array<{
    method: string;
    revenue: number;
    orders: number;
    profit: number;
    margin: number;
  }>;
  hourlyAnalysis: Array<{
    hour: number;
    revenue: number;
    orders: number;
    profit: number;
  }>;
}

export default function ProfitAnalysisPage() {
  const [profitData, setProfitData] = useState<ProfitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const fetchProfitData = async (selectedPeriod: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/profit-analysis?period=${selectedPeriod}`);
      const result = await response.json();
      
      if (result.success) {
        setProfitData(result.data);
      } else {
        toast.error('Failed to fetch profit analysis');
      }
    } catch (error) {
      toast.error('Error fetching profit analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitData(period);
  }, [period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const downloadReport = () => {
    if (!profitData) return;
    
    const csvContent = [
      ['Profit Analysis Report', '', ''],
      ['Period', profitData.period, ''],
      ['Date Range', `${formatDate(profitData.dateRange.startDate)} - ${formatDate(profitData.dateRange.endDate)}`, ''],
      ['', '', ''],
      ['Summary Metrics', '', ''],
      ['Total Revenue', formatCurrency(profitData.summary.totalRevenue), ''],
      ['Total Orders', profitData.summary.totalOrders.toString(), ''],
      ['Average Order Value', formatCurrency(profitData.summary.averageOrderValue), ''],
      ['Total Costs', formatCurrency(profitData.summary.totalCosts), ''],
      ['Gross Profit', formatCurrency(profitData.summary.grossProfit), ''],
      ['Operating Profit', formatCurrency(profitData.summary.operatingProfit), ''],
      ['Net Profit', formatCurrency(profitData.summary.netProfit), ''],
      ['Gross Margin', formatPercentage(profitData.summary.grossMargin), ''],
      ['Operating Margin', formatPercentage(profitData.summary.operatingMargin), ''],
      ['Net Margin', formatPercentage(profitData.summary.netMargin), ''],
      ['', '', ''],
      ['Cost Breakdown', '', ''],
      ['Ingredient Costs', formatCurrency(profitData.costs.ingredientCost), ''],
      ['Packaging Costs', formatCurrency(profitData.costs.packagingCost), ''],
      ['Delivery Costs', formatCurrency(profitData.costs.deliveryCost), ''],
      ['Operational Costs', formatCurrency(profitData.costs.operationalCost), ''],
      ['Marketing Costs', formatCurrency(profitData.costs.marketingCost), '']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-analysis-${profitData.period}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profitData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">Unable to load profit analysis data</p>
        </div>
      </div>
    );
  }

  const costData = [
    { name: 'Ingredients', value: profitData.costs.ingredientCost, color: '#0088FE' },
    { name: 'Packaging', value: profitData.costs.packagingCost, color: '#00C49F' },
    { name: 'Delivery', value: profitData.costs.deliveryCost, color: '#FFBB28' },
    { name: 'Operations', value: profitData.costs.operationalCost, color: '#FF8042' },
    { name: 'Marketing', value: profitData.costs.marketingCost, color: '#8884D8' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                Back
              </a>
              <div className="flex items-center ml-4">
                <TrendingUp className="w-6 h-6 text-gray-600" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">Profit Analysis</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">Detailed profitability insights and metrics</p>
          </div>
          <div className="flex gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <Button onClick={downloadReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profitData.summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {profitData.summary.totalOrders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(profitData.summary.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(profitData.summary.netMargin)} margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(profitData.summary.totalCosts)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage((profitData.summary.totalCosts / profitData.summary.totalRevenue) * 100)} of revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profitData.summary.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per order
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Summary</CardTitle>
                <CardDescription>Revenue, costs, and profit breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-semibold">{formatCurrency(profitData.summary.totalRevenue)}</span>
                  </div>
                  <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span>Ingredient Costs</span>
                      <span className="text-red-600">-{formatCurrency(profitData.costs.ingredientCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Packaging Costs</span>
                      <span className="text-red-600">-{formatCurrency(profitData.costs.packagingCost)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Gross Profit</span>
                    <span>{formatCurrency(profitData.summary.grossProfit)}</span>
                  </div>
                  <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span>Delivery Costs</span>
                      <span className="text-red-600">-{formatCurrency(profitData.costs.deliveryCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Operational Costs</span>
                      <span className="text-red-600">-{formatCurrency(profitData.costs.operationalCost)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Operating Profit</span>
                    <span>{formatCurrency(profitData.summary.operatingProfit)}</span>
                  </div>
                  <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span>Marketing Costs</span>
                      <span className="text-red-600">-{formatCurrency(profitData.costs.marketingCost)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Net Profit</span>
                    <span className={profitData.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(profitData.summary.netProfit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Profitability</CardTitle>
                <CardDescription>Profit analysis by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profitData.paymentMethods.map((method) => (
                    <div key={method.method} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{method.method}</p>
                          <p className="text-sm text-gray-500">{method.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(method.profit)}</p>
                        <p className="text-sm text-gray-500">{formatPercentage(method.margin)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Profitable Products</CardTitle>
                <CardDescription>Products generating the highest profit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profitData.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.quantity} sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(product.profit)}</p>
                        <p className="text-sm text-gray-500">{formatPercentage(product.margin)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Least Profitable Products</CardTitle>
                <CardDescription>Products needing optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profitData.worstProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-red-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.quantity} sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">{formatCurrency(product.profit)}</p>
                        <p className="text-sm text-gray-500">{formatPercentage(product.margin)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Profit Trend</CardTitle>
                <CardDescription>Profit performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={profitData.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hourly Profit Analysis</CardTitle>
                <CardDescription>Profit by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={profitData.hourlyAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Profit']}
                      labelFormatter={(label) => `Hour: ${label}:00`}
                    />
                    <Bar dataKey="profit" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Distribution of all costs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={costData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Detailed cost breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costData.map((cost) => (
                    <div key={cost.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: cost.color }}
                        />
                        <span className="font-medium">{cost.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(cost.value)}</p>
                        <p className="text-sm text-gray-500">
                          {formatPercentage((cost.value / profitData.summary.totalRevenue) * 100)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </main>
    </div>
  );
}