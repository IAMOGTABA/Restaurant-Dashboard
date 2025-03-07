"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  FileText, 
  Brain,
  PieChart as PieChartIcon,
  AlertTriangle,
  Activity,
  Shield
} from 'lucide-react';
import { Progress } from '../../../../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

// Financial data interfaces
interface FinancialMetrics {
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
    yearToDate: number;
  };
  expenses: {
    foodCost: number;
    laborCost: number;
    overhead: number;
    total: number;
  };
  profit: {
    daily: number;
    weekly: number;
    monthly: number;
    yearToDate: number;
  };
  anomalies: number;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  sales: number;
  revenue: number;
  profitMargin: number;
}

interface ExpenseItem {
  category: string;
  amount: number;
  percentage: number;
  trend: number;
}

export default function FinancialPage() {
  const [selectedReport, setSelectedReport] = useState('weekly');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialMetrics | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch financial data on component mount
  useEffect(() => {
    fetchFinancialData();
  }, []);

  // Fetch financial data from the database (mocked for demo)
  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch financial metrics from API
      const metricsResponse = await fetch('/api/financial/metrics');
      if (!metricsResponse.ok) throw new Error('Failed to fetch financial metrics');
      const metricsData = await metricsResponse.json();
      
      // Set metrics with data from API
      setFinancialData(metricsData);
      
      // Fetch menu items for profitability analysis
      const menuResponse = await fetch('/api/financial/menu-analysis');
      if (!menuResponse.ok) throw new Error('Failed to fetch menu analysis');
      const menuData = await menuResponse.json();
      
      // Sort menu items by profit margin
      const sortedItems = [...menuData];
      const highProfitItems = sortedItems
        .sort((a, b) => b.profitMargin - a.profitMargin)
        .slice(0, 3);
      
      const lowProfitItems = sortedItems
        .sort((a, b) => a.profitMargin - b.profitMargin)
        .slice(0, 3);
      
      setMenuItems(sortedItems);
      
      // Fetch expense data
      const expensesResponse = await fetch('/api/financial/expenses');
      if (!expensesResponse.ok) throw new Error('Failed to fetch expenses');
      const expensesData = await expensesResponse.json();
      
      setExpenses(expensesData);
      
      // Count anomalies from metrics
      const anomalyCount = metricsData.anomalies || 0;
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError('Failed to load financial data. Please try again later.');
      
      // Set fallback data in case of error
      setFinancialData({
        revenue: {
          daily: 3245.89,
          weekly: 22460.75,
          monthly: 94250.34,
          yearToDate: 845678.90
        },
        expenses: {
          foodCost: 31250.45,
          laborCost: 42680.32,
          overhead: 18760.90,
          total: 92691.67
        },
        profit: {
          daily: 988.76,
          weekly: 6890.21,
          monthly: 29560.45,
          yearToDate: 256978.12
        },
        anomalies: 3
      });
      
      setMenuItems([
        { id: '1', name: 'Premium Shisha Mix', category: 'Shisha', cost: 5.20, price: 39.99, sales: 342, revenue: 13676.58, profitMargin: 87 },
        { id: '2', name: 'Specialty Cocktails', category: 'Drinks', cost: 3.50, price: 15.99, sales: 520, revenue: 8314.80, profitMargin: 78 },
        { id: '3', name: 'Mezze Platter', category: 'Appetizer', cost: 8.40, price: 29.99, sales: 275, revenue: 8247.25, profitMargin: 72 },
        { id: '4', name: 'Seafood Platter', category: 'Main Course', cost: 28.50, price: 36.99, sales: 120, revenue: 4438.80, profitMargin: 23 },
        { id: '5', name: 'Imported Beer Selection', category: 'Drinks', cost: 4.80, price: 6.99, sales: 380, revenue: 2656.20, profitMargin: 31 }
      ]);
      
      setExpenses([
        { category: 'Utility costs', amount: 5680.45, percentage: 15, trend: 5.2 },
        { category: 'Food waste', amount: 4230.20, percentage: 12, trend: 3.8 },
        { category: 'Staff overtime', amount: 3560.75, percentage: 10, trend: 2.1 },
        { category: 'Ingredients', amount: 42350.80, percentage: 45, trend: -1.3 },
        { category: 'Rent', amount: 15000.00, percentage: 18, trend: 0 }
      ]);
      
      setIsLoading(false);
    }
  };

  // Generate financial report with AI
  const generateReport = async (reportType: string) => {
    setIsGeneratingReport(true);
    try {
      // In a real implementation, this would call an API endpoint that uses AI
      const response = await fetch('/api/financial/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportType }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      const reportData = await response.json();
      console.log('Report generated:', reportData);
      // You could also download as PDF or display in a modal

    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again later.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Run AI analysis
  const runAnalysis = async (analysisType: string) => {
    setIsAnalyzing(true);
    try {
      // In a real implementation, this would call an AI service API
      const response = await fetch('/api/financial/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisType }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to run analysis');
      }
      
      const analysisData = await response.json();
      console.log('Analysis complete:', analysisData);

      // Update relevant state based on analysis type if needed
      // e.g., if (analysisType === 'revenuePrediction') { setRevenuePrediction(analysisData) }

    } catch (err) {
      console.error('Error running analysis:', err);
      setError('Failed to run analysis. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ----- Render States -----
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-t-purple-600 border-b-purple-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error && !financialData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="mb-2 text-xl font-bold text-center text-gray-800">Error Loading Data</h2>
          <p className="text-center text-gray-600">{error}</p>
          <Button 
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
            onClick={fetchFinancialData}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ----- Main UI -----
  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-100 to-purple-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
            Financial Intelligence Hub
          </h1>
          <p className="text-gray-600">AI-powered insights for your business</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-purple-200 hover:border-purple-300 rounded-lg">
            <FileText className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 transition-all rounded-lg">
            <Brain className="w-4 h-4 mr-2" />
            Full Business Analysis
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData?.revenue?.monthly?.toLocaleString() || '0'}</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-xs text-green-600 font-medium">
                +{((financialData?.revenue?.monthly || 0) / (financialData?.revenue?.monthly || 1) * 5).toFixed(1)}% from last month
              </p>
            </div>
            <Progress value={75} className="h-2 mt-4 bg-blue-100" />
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData?.expenses?.total?.toLocaleString() || '0'}</div>
            <div className="flex items-center mt-1">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-xs text-green-600 font-medium">-3% from last month</p>
            </div>
            <Progress value={45} className="h-2 mt-4 bg-red-100" />
          </CardContent>
        </Card>
        
        {/* Net Profit */}
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData?.profit?.monthly?.toLocaleString() || '0'}</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-xs text-green-600 font-medium">
                +{((financialData?.profit?.monthly || 0) / (financialData?.profit?.monthly || 1) * 3).toFixed(1)}% from last month
              </p>
            </div>
            <Progress value={65} className="h-2 mt-4 bg-green-100" />
          </CardContent>
        </Card>

        {/* Anomalies */}
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData?.anomalies || 0}</div>
            <p className="text-xs text-amber-600 mt-1">Requires attention</p>
            <Progress value={30} className="h-2 mt-4 bg-amber-100" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm grid w-full grid-cols-5 mb-8">
          <TabsTrigger 
            value="reports" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-100 data-[state=active]:to-pink-50 
                       data-[state=active]:text-purple-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
          >
            <FileText className="h-4 w-4 mr-2" /> Auto Reports
          </TabsTrigger>
          <TabsTrigger 
            value="prediction"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-100 data-[state=active]:to-pink-50 
                       data-[state=active]:text-purple-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
          >
            <TrendingUp className="h-4 w-4 mr-2" /> Revenue Prediction
          </TabsTrigger>
          <TabsTrigger 
            value="expenses"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-100 data-[state=active]:to-pink-50 
                       data-[state=active]:text-purple-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
          >
            <TrendingDown className="h-4 w-4 mr-2" /> Expense Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="menu"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-100 data-[state=active]:to-pink-50 
                       data-[state=active]:text-purple-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
          >
            <PieChartIcon className="h-4 w-4 mr-2" /> Menu Profitability
          </TabsTrigger>
          <TabsTrigger 
            value="anomalies"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-100 data-[state=active]:to-pink-50 
                       data-[state=active]:text-purple-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
          >
            <AlertTriangle className="h-4 w-4 mr-2" /> Anomaly Detection
          </TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="border-none shadow-lg overflow-hidden rounded-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Brain className="h-6 w-6 text-white" /> 
                AI-Generated Financial Reports
              </CardTitle>
              <CardDescription className="text-pink-100">
                Automate the creation of weekly, monthly, and yearly financial reports. 
                Our AI collects data from orders, expenses, sales, and inventory 
                to create comprehensive reports without manual input.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Generate Report */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                <Select 
                  value={selectedReport} 
                  onValueChange={setSelectedReport}
                >
                  <SelectTrigger className="w-full md:w-[220px] border-purple-200 rounded-lg">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly Report</SelectItem>
                    <SelectItem value="monthly">Monthly Report</SelectItem>
                    <SelectItem value="quarterly">Quarterly Report</SelectItem>
                    <SelectItem value="yearly">Yearly Report</SelectItem>
                    <SelectItem value="custom">Custom Period</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => generateReport(selectedReport)} 
                  disabled={isGeneratingReport}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </Button>
              </div>
              
              {/* Recent Reports */}
              <div className="border border-purple-100 rounded-xl p-6 bg-purple-50/50">
                <h3 className="font-medium mb-4 text-gray-700 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Recent Reports
                </h3>
                <div className="space-y-3">
                  {[
                    { title: 'Weekly Financial Report', dateRange: 'March 1-7, 2024', created: 'March 8, 2024' },
                    { title: 'Monthly Financial Report', dateRange: 'February 2024', created: 'March 1, 2024' },
                    { title: 'Weekly Financial Report', dateRange: 'February 23-29, 2024', created: 'March 1, 2024' }
                  ].map((report, idx) => (
                    <div 
                      key={idx}
                      className="flex justify-between items-center p-3 bg-white hover:bg-purple-50 
                                 rounded-lg cursor-pointer transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <div>
                          <span className="font-medium text-gray-800">{report.title}</span>
                          <p className="text-sm text-gray-500">{report.dateRange}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{report.created}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Prediction Tab */}
        <TabsContent value="prediction" className="space-y-6">
          <Card className="border-none shadow-lg overflow-hidden rounded-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="h-6 w-6 text-white" /> 
                AI Revenue Prediction
              </CardTitle>
              <CardDescription className="text-blue-100">
                Estimate future revenue based on historical trends, seasonal patterns, and 
                advanced machine learning models.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Button
                onClick={() => runAnalysis('revenuePrediction')}
                disabled={isAnalyzing}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Predicting...
                  </>
                ) : (
                  'Run Revenue Prediction'
                )}
              </Button>
              <div className="border border-blue-100 rounded-xl p-6 bg-blue-50">
                <p className="text-sm text-gray-700">
                  This is a placeholder for the predicted revenue chart or data. 
                  After running the analysis, you could display the predicted revenue 
                  for the upcoming weeks or months here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Analysis Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <Card className="border-none shadow-lg overflow-hidden rounded-lg">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingDown className="h-6 w-6 text-white" /> 
                AI Expense Analysis
              </CardTitle>
              <CardDescription className="text-orange-100">
                Dive deeper into cost structures, spot inefficiencies, 
                and optimize your bottom line with advanced analytics.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Button
                onClick={() => runAnalysis('expenseAnalysis')}
                disabled={isAnalyzing}
                className="bg-orange-600 hover:bg-orange-700 rounded-lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Analyzing Expenses...
                  </>
                ) : (
                  'Run Expense Analysis'
                )}
              </Button>
              <div className="border border-red-100 rounded-xl p-6 bg-red-50">
                <p className="text-sm text-gray-700">
                  Here you can show a breakdown of expenses, top cost drivers, 
                  or recommended optimizations from the AI. 
                  For example: "Reduce labor costs by adjusting staff scheduling."
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menu Profitability Tab */}
        <TabsContent value="menu" className="space-y-6">
          <Card className="border-none shadow-lg overflow-hidden rounded-lg">
            <CardHeader className="bg-gradient-to-r from-green-500 to-lime-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <PieChartIcon className="h-6 w-6 text-white" /> 
                AI Menu Profitability Analysis
              </CardTitle>
              <CardDescription className="text-lime-100">
                Identify your most and least profitable menu items based on cost, 
                sales frequency, and customer preferences to optimize pricing.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Menu Analysis Controls */}
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <Button 
                  onClick={() => runAnalysis('menuAnalysis')} 
                  disabled={isAnalyzing}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700 rounded-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Menu Profitability'
                  )}
                </Button>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full md:w-[220px] border-green-200 rounded-lg">
                    <SelectValue placeholder="Menu category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="drinks">Drinks</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                    <SelectItem value="shisha">Shisha</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Top & Underperforming Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow-md rounded-xl p-6">
                  <h3 className="font-medium mb-4 text-gray-700 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" />
                    Top Performing Items
                  </h3>
                  <div className="space-y-4">
                    {menuItems.filter(item => item.profitMargin >= 50).slice(0, 3).map((item) => {
                      return (
                        <div key={item.id} className="group">
                          <div className="flex justify-between mb-2">
                            <div>
                              <span className="font-medium text-gray-800 group-hover:text-emerald-600 transition-colors">{item.name}</span>
                              <p className="text-sm text-gray-500">{item.category}</p>
                            </div>
                            <span className="text-sm font-medium text-emerald-600">{item.profitMargin}% profit</span>
                          </div>
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-emerald-100">
                              <div 
                                style={{ width: `${item.profitMargin}%` }} 
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-500 group-hover:bg-emerald-600">
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Sales: {item.sales} units • Revenue: ${item.revenue.toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="bg-white shadow-md rounded-xl p-6">
                  <h3 className="font-medium mb-4 text-gray-700 flex items-center">
                    <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
                    Underperforming Items
                  </h3>
                  <div className="space-y-4">
                    {menuItems.filter(item => item.profitMargin < 50).slice(0, 3).map((item) => {
                      return (
                        <div key={item.id} className="group">
                          <div className="flex justify-between mb-2">
                            <div>
                              <span className="font-medium text-gray-800 group-hover:text-red-600 transition-colors">{item.name}</span>
                              <p className="text-sm text-gray-500">{item.category}</p>
                            </div>
                            <span className="text-sm font-medium text-red-600">{item.profitMargin}% profit</span>
                          </div>
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-red-100">
                              <div 
                                style={{ width: `${item.profitMargin}%` }} 
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500 transition-all duration-500 group-hover:bg-red-600">
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Sales: {item.sales} units • Revenue: ${item.revenue.toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* AI Recommendation */}
              <Card className="bg-gradient-to-r from-lime-50 to-lime-100 border-lime-100 mt-4 rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
                    <Brain className="h-4 w-4 text-green-500" />
                    AI Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    Consider a 10% price increase for Premium Shisha Mix and Specialty Cocktails
                    — customer demand analysis suggests price elasticity is low for these items.
                    For Seafood Platter, either adjust portion size or increase price by 15% 
                    to improve profitability.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anomaly Detection Tab */}
        <TabsContent value="anomalies" className="space-y-6">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Brain className="h-6 w-6 text-white" /> 
                AI Transaction Anomaly Detection
              </CardTitle>
              <CardDescription className="text-pink-100">
                Our AI continuously monitors financial transactions to detect unusual patterns, unauthorized discounts, fraudulent activities, and missing payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Button 
                onClick={() => runAnalysis('anomalyDetection')} 
                disabled={isAnalyzing}
                className="w-full md:w-auto bg-pink-600 hover:bg-pink-700 rounded-lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Checking Anomalies...
                  </>
                ) : (
                  'Run Anomaly Detection'
                )}
              </Button>
              <div className="border border-pink-100 rounded-xl p-6 bg-pink-50">
                <h3 className="font-medium mb-4 text-gray-700 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-pink-500" />
                  Detected Anomalies
                </h3>
                <div className="space-y-4">
                  <Card className="bg-red-50 border-red-200 hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        High Priority
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">Unusual number of refunds (12) processed by employee ID #103 on March 2, 2024. This exceeds the typical refund rate by 400%.</p>
                      <div className="mt-2 flex justify-end">
                        <Button variant="outline" size="sm" className="text-xs border-red-200 text-red-700 hover:bg-red-50">Investigate</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-amber-50 border-amber-200 hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Medium Priority
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">Discount rate of 35% applied to 8 transactions on February 28, 2024, exceeds authorized maximum of 25% for regular employees.</p>
                      <div className="mt-2 flex justify-end">
                        <Button variant="outline" size="sm" className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50">Investigate</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="bg-white shadow-md rounded-xl p-6">
                  <h3 className="font-medium mb-4 text-gray-700 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-pink-500" />
                    Recent Activity Timeline
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-1 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-800">Unusual refund pattern detected</p>
                        <p className="text-sm text-gray-500">March 2, 2024 at 9:45 PM</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-1 bg-amber-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-800">Unauthorized discount rates applied</p>
                        <p className="text-sm text-gray-500">February 28, 2024 at 8:30 PM</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-1 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-800">Unusual payment method distribution</p>
                        <p className="text-sm text-gray-500">March 5, 2024 at 10:15 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white shadow-md rounded-xl p-6">
                  <h3 className="font-medium mb-4 text-gray-700 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-pink-500" />
                    AI Protection System
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-700">Transaction monitoring</span>
                      <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-700">Real-time alerts</span>
                      <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-700">Automated risk assessment</span>
                      <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-700">Employee activity analysis</span>
                      <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-700">Last full system scan</span>
                      <span className="text-sm text-gray-500">Today at 03:00 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
