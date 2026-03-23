import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, DollarSign, Target, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Colores consistentes con Chart.js original
const COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#fbbf24',
  danger: '#ef4444',
  purple: '#9333ea',
  gray: '#9ca3af'
};

const PIE_COLORS_SOLID = [
  '#3b82f6',
  '#22c55e',
  '#fbbf24',
  '#ef4444',
  '#9333ea'
];

interface ExecutiveChartsProps {
  refreshData: () => void;
  lastUpdate: Date;
}

// Tipos para datos de Recharts
interface ChartDataPoint {
  name: string;
  value: number;
}

interface LineChartData {
  name: string;
  [key: string]: string | number;
}

export default function ExecutiveCharts({ refreshData, lastUpdate }: ExecutiveChartsProps) {
  const [chartData, setChartData] = useState<{
    userGrowth: LineChartData[];
    monthlyRevenue: LineChartData[];
    projectDistribution: ChartDataPoint[];
    ticketPriority: ChartDataPoint[];
    systemActivity: LineChartData[];
  } | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  // Cargar datos reales desde la base de datos
  const loadRealData = async () => {
    try {
      setLoading(true);
      
      // Cargar usuarios
      const { data: users = [], error: usersError } = await supabase
        .from('users')
        .select('created_at')
        .order('created_at', { ascending: true });
      
      if (usersError) {
        console.error('Error loading users:', usersError);
      }

      // Cargar pagos
      const { data: payments = [], error: paymentsError } = await supabase
        .from('payments')
        .select('amount, created_at, status')
        .eq('status', 'completed')
        .order('created_at', { ascending: true });
      
      if (paymentsError) {
        console.error('Error loading payments:', paymentsError);
      }

      // Cargar proyectos
      const { data: projects = [], error: projectsError } = await supabase
        .from('projects')
        .select('status, created_at')
        .order('created_at', { ascending: true });
      
      if (projectsError) {
        console.error('Error loading projects:', projectsError);
      }

      // Cargar tickets
      const { data: tickets = [], error: ticketsError } = await supabase
        .from('tickets')
        .select('prioridad, estado, created_at')
        .order('created_at', { ascending: true });
      
      if (ticketsError) {
        console.error('Error loading tickets:', ticketsError);
      }

      // Generar etiquetas de fechas según el rango seleccionado
      const now = new Date();
      const labels: string[] = [];
      
      if (timeRange === '7d') {
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
        }
      } else if (timeRange === '30d') {
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
        }
      } else if (timeRange === '90d') {
        for (let i = 89; i >= 0; i -= 3) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
        }
      }

      // Procesar datos de usuarios por fecha
      const userGrowthData: LineChartData[] = labels.map((label, index) => {
        const targetDate = new Date(now);
        if (timeRange === '7d') {
          targetDate.setDate(targetDate.getDate() - (6 - index));
        } else if (timeRange === '30d') {
          targetDate.setDate(targetDate.getDate() - (29 - index));
        } else if (timeRange === '90d') {
          targetDate.setDate(targetDate.getDate() - (89 - index * 3));
        }
        
        const endDate = new Date(targetDate);
        endDate.setDate(endDate.getDate() + 1);
        
        const count = (users || []).filter(user => {
          const userDate = new Date(user.created_at);
          return userDate >= targetDate && userDate < endDate;
        }).length || 0;
        
        return {
          name: label,
          'Usuarios Registrados': Math.round(count)
        };
      });

      // Procesar datos de ingresos por fecha
      const revenueData: LineChartData[] = labels.map((label, index) => {
        const targetDate = new Date(now);
        if (timeRange === '7d') {
          targetDate.setDate(targetDate.getDate() - (6 - index));
        } else if (timeRange === '30d') {
          targetDate.setDate(targetDate.getDate() - (29 - index));
        } else if (timeRange === '90d') {
          targetDate.setDate(targetDate.getDate() - (89 - index * 3));
        }
        
        const endDate = new Date(targetDate);
        endDate.setDate(endDate.getDate() + 1);
        
        const total = (payments || []).filter(payment => {
          const paymentDate = new Date(payment.created_at);
          return paymentDate >= targetDate && paymentDate < endDate;
        }).reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0) || 0;
        
        return {
          name: label,
          'Ingresos ($)': Math.round(total)
        };
      });

      // Procesar distribución de proyectos
      const projectStatuses = (projects || []).reduce((acc, project) => {
        const status = project.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const projectDistribution: ChartDataPoint[] = Object.keys(projectStatuses).length > 0
        ? Object.entries(projectStatuses).map(([name, value]) => ({
            name,
            value: Math.round(value)
          }))
        : [{ name: 'Sin datos', value: 0 }];

      // Procesar tickets por prioridad
      const ticketPriorities = (tickets || []).reduce((acc, ticket) => {
        const priority = ticket.prioridad || 'unknown';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const ticketPriority: ChartDataPoint[] = Object.keys(ticketPriorities).length > 0
        ? Object.entries(ticketPriorities).map(([name, value]) => ({
            name,
            value: Math.round(value)
          }))
        : [{ name: 'Sin datos', value: 0 }];

      // Procesar actividad del sistema (última semana)
      const weekLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const systemActivity: LineChartData[] = weekLabels.map((_, index) => {
        const targetDate = new Date(now);
        const dayOfWeek = targetDate.getDay();
        const daysToSubtract = dayOfWeek - index;
        targetDate.setDate(targetDate.getDate() - daysToSubtract);
        
        const endDate = new Date(targetDate);
        endDate.setDate(endDate.getDate() + 1);
        
        // Contar actividad (usuarios + proyectos + tickets creados ese día)
        const userActivity = users?.filter(user => {
          const userDate = new Date(user.created_at);
          return userDate >= targetDate && userDate < endDate;
        }).length || 0;

        const projectActivity = projects?.filter(project => {
          const projectDate = new Date(project.created_at);
          return projectDate >= targetDate && projectDate < endDate;
        }).length || 0;

        const ticketActivity = (tickets || []).filter(ticket => {
          const ticketDate = new Date(ticket.created_at);
          return ticketDate >= targetDate && ticketDate < endDate;
        }).length || 0;

        return {
          name: _,
          'Actividad del Sistema': Math.round(userActivity + projectActivity + ticketActivity)
        };
      });

      setChartData({
        userGrowth: userGrowthData,
        monthlyRevenue: revenueData,
        projectDistribution,
        ticketPriority,
        systemActivity
      });
    } catch (error) {
      console.error('Error loading chart data:', error);
      // Si hay error, mostrar gráficos vacíos
      setChartData({
        userGrowth: [],
        monthlyRevenue: [],
        projectDistribution: [{ name: 'Sin datos', value: 0 }],
        ticketPriority: [{ name: 'Sin datos', value: 0 }],
        systemActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();
  }, [timeRange]);

  // Custom tooltip para gráficos de línea
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip para gráficos de pie
  const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-slate-800">{payload[0].name}</p>
          <p className="text-sm text-slate-600">Valor: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-500">No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Dashboard Ejecutivo</h2>
          <p className="text-slate-600">
            Análisis visual de métricas clave • Última actualización: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-white border-slate-200 text-slate-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshData} variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50">
            <TrendingUp className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Gráficos en grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crecimiento de Usuarios - LineChart */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-slate-800">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              Crecimiento de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.userGrowth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#374151', fontSize: 11 }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis 
                    tick={{ fill: '#374151', fontSize: 11 }}
                    axisLine={{ stroke: '#d1d5db' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span style={{ color: '#374151', fontSize: '12px' }}>{value}</span>}
                  />
                  <Line
                    type="monotone"
                    dataKey="Usuarios Registrados"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: COLORS.primary }}
                    fill="rgba(59, 130, 246, 0.1)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ingresos Mensuales - BarChart */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-slate-800">
              <DollarSign className="h-5 w-5 mr-2 text-green-500" />
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.monthlyRevenue} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#374151', fontSize: 11 }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis 
                    tick={{ fill: '#374151', fontSize: 11 }}
                    axisLine={{ stroke: '#d1d5db' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span style={{ color: '#374151', fontSize: '12px' }}>{value}</span>}
                  />
                  <Bar
                    dataKey="Ingresos ($)"
                    fill={COLORS.success}
                    radius={[4, 4, 0, 0]}
                    stroke={COLORS.success}
                    strokeWidth={2}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribución de Proyectos - PieChart (Doughnut) */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-slate-800">
              <Target className="h-5 w-5 mr-2 text-purple-500" />
              Distribución de Proyectos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.projectDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#9ca3af' }}
                  >
                    {chartData.projectDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PIE_COLORS_SOLID[index % PIE_COLORS_SOLID.length]}
                        stroke={PIE_COLORS_SOLID[index % PIE_COLORS_SOLID.length]}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend 
                    formatter={(value) => <span style={{ color: '#374151', fontSize: '12px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tickets por Prioridad - BarChart */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-slate-800">
              <Activity className="h-5 w-5 mr-2 text-orange-500" />
              Tickets por Prioridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.ticketPriority} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#374151', fontSize: 11 }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis 
                    tick={{ fill: '#374151', fontSize: 11 }}
                    axisLine={{ stroke: '#d1d5db' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span style={{ color: '#374151', fontSize: '12px' }}>{value}</span>}
                  />
                  <Bar
                    dataKey="value"
                    name="Tickets por Prioridad"
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.ticketPriority.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PIE_COLORS_SOLID[index % PIE_COLORS_SOLID.length]}
                        stroke={PIE_COLORS_SOLID[index % PIE_COLORS_SOLID.length]}
                        strokeWidth={2}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Actividad del Sistema (ancho completo) - LineChart */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-slate-800">
            <Activity className="h-5 w-5 mr-2 text-purple-500" />
            Actividad del Sistema (Última Semana)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.systemActivity} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#374151', fontSize: 11 }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fill: '#374151', fontSize: 11 }}
                  axisLine={{ stroke: '#d1d5db' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span style={{ color: '#374151', fontSize: '12px' }}>{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="Actividad del Sistema"
                  stroke={COLORS.purple}
                  strokeWidth={2}
                  dot={{ fill: COLORS.purple, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: COLORS.purple }}
                  fill="rgba(147, 51, 234, 0.1)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
