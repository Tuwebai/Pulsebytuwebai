import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Download,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  Radar as RadarIcon,
  TrendingUp,
  RefreshCw,
  Maximize2,
  Minimize2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from '@/components/OptimizedMotion';

export interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar' | 'heatmap' | 'funnel';
  data: ChartDataItem[];
  options?: ChartOptions;
  theme: 'light' | 'dark' | 'auto';
  colors: string[];
  showLegend: boolean;
  showGrid: boolean;
  showTooltip: boolean;
  showDataLabels: boolean;
  animation: boolean;
  responsive: boolean;
  height: number;
  width: number;
  refreshInterval?: number;
  customOptions?: Record<string, unknown>;
}

interface ChartDataItem {
  name?: string;
  label?: string;
  value?: number;
  x?: number;
  y?: number;
  max?: number;
  [key: string]: unknown;
}

interface ChartOptions {
  xAxis?: {
    type?: 'category' | 'value';
    name?: string;
  };
  yAxis?: {
    type?: 'category' | 'value';
    name?: string;
  };
}

interface AdvancedChartProps {
  config: ChartConfig;
  onConfigChange?: (config: ChartConfig) => void;
  onExport?: (format: string) => void;
  className?: string;
  loading?: boolean;
}

const CHART_TYPES = [
  { value: 'line', label: 'Línea', icon: LineChartIcon },
  { value: 'bar', label: 'Barras', icon: BarChart3 },
  { value: 'pie', label: 'Circular', icon: PieChartIcon },
  { value: 'area', label: 'Área', icon: AreaChartIcon },
  { value: 'scatter', label: 'Dispersión', icon: BarChart3 },
  { value: 'radar', label: 'Radar', icon: RadarIcon },
  { value: 'heatmap', label: 'Mapa de Calor', icon: TrendingUp },
  { value: 'funnel', label: 'Embudo', icon: TrendingUp }
];

const THEMES = [
  { value: 'light', label: 'Claro' }
];

const DEFAULT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
];

// Tipos para el ref del chart
export interface AdvancedChartRef {
  getChartData: () => string;
}

const AdvancedChart = forwardRef<AdvancedChartRef, AdvancedChartProps>(
  function AdvancedChart(
    { config, onConfigChange, onExport, className = '', loading = false },
    ref
  ) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [localConfig, setLocalConfig] = useState<ChartConfig>(config);

    useImperativeHandle(ref, () => ({
      getChartData: () => {
        return JSON.stringify(localConfig.data, null, 2);
      }
    }));

    useEffect(() => {
      setLocalConfig(config);
    }, [config]);

    const handleConfigChange = useCallback((updates: Partial<ChartConfig>) => {
      const newConfig = { ...localConfig, ...updates };
      setLocalConfig(newConfig);
      onConfigChange?.(newConfig);
    }, [localConfig, onConfigChange]);

    // Función auxiliar para obtener valor numérico
    const getNumericValue = (item: ChartDataItem): number => {
      if (typeof item.value === 'number' && isFinite(item.value)) return item.value;
      if (typeof item.y === 'number' && isFinite(item.y)) return item.y;
      return NaN;
    };

    // Preparar datos para los gráficos
    const prepareData = useCallback(() => {
      // Validar y limpiar datos
      const validData = localConfig.data.filter(item => {
        const value = getNumericValue(item);
        return item && !isNaN(value) && isFinite(value);
      });

      if (validData.length === 0) {
        return [];
      }

      return validData;
    }, [localConfig.data]);

    // Preparar datos para pie chart
    const preparePieData = useCallback(() => {
      return localConfig.data
        .filter(item => item && typeof item.value === 'number')
        .map(item => ({
          name: item.name || item.label || 'Sin nombre',
          value: item.value
        }));
    }, [localConfig.data]);

    // Preparar datos para radar chart
    const prepareRadarData = useCallback(() => {
      const validData = localConfig.data.filter(item =>
        item && typeof item.value === 'number'
      );

      if (validData.length === 0) return [];

      // Normalizar datos para radar
      const maxValue = Math.max(...validData.map(item => item.max || 100));

      return validData.map(item => ({
        subject: item.name || item.label || 'Métrica',
        value: Math.max(0, Math.min(item.value ?? 0, item.max || 100)),
        fullMark: maxValue
      }));
    }, [localConfig.data]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-lg">
            <p className="text-white font-medium mb-1">{label || payload[0]?.name}</p>
            {payload.map((entry, index) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    // Renderizar gráfico según el tipo
    const renderChart = () => {
      const data = prepareData();
      const pieData = preparePieData();
      const radarData = prepareRadarData();

      if (data.length === 0 && localConfig.type !== 'pie' && localConfig.type !== 'radar') {
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No hay datos para mostrar</p>
            </div>
          </div>
        );
      }

      const chartProps = {
        data: localConfig.type === 'pie' ? pieData : localConfig.type === 'radar' ? radarData : data,
        margin: { top: 20, right: 30, left: 20, bottom: 20 }
      };

      const axisProps = {
        stroke: '#666',
        fontSize: 12
      };

      switch (localConfig.type) {
        case 'line':
          return (
            <LineChart {...chartProps}>
              {localConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
              <XAxis
                dataKey="name"
                {...axisProps}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis
                {...axisProps}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              {localConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
              {localConfig.showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey="value"
                stroke={localConfig.colors[0]}
                strokeWidth={3}
                dot={{ fill: localConfig.colors[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={localConfig.animation}
                name={localConfig.title}
              />
            </LineChart>
          );

        case 'bar':
          return (
            <BarChart {...chartProps}>
              {localConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
              <XAxis
                dataKey="name"
                {...axisProps}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis
                {...axisProps}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              {localConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
              {localConfig.showLegend && <Legend />}
              <Bar
                dataKey="value"
                fill={localConfig.colors[0]}
                radius={[4, 4, 0, 0]}
                isAnimationActive={localConfig.animation}
                name={localConfig.title}
                label={localConfig.showDataLabels ? {
                  position: 'top',
                  fill: '#666',
                  fontSize: 12
                } : false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={localConfig.colors[index % localConfig.colors.length]} />
                ))}
              </Bar>
            </BarChart>
          );

        case 'pie':
          if (pieData.length === 0) {
            return (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No hay datos para mostrar</p>
                </div>
              </div>
            );
          }
          return (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={localConfig.animation}
                nameKey="name"
                label={localConfig.showDataLabels ? ({
                  cx, cy, midAngle, innerRadius, outerRadius, percent
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={12}
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                } : false}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={localConfig.colors[index % localConfig.colors.length]} />
                ))}
              </Pie>
              {localConfig.showTooltip && <Tooltip />}
              {localConfig.showLegend && <Legend />}
            </PieChart>
          );

        case 'area':
          return (
            <AreaChart {...chartProps}>
              {localConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
              <XAxis
                dataKey="name"
                {...axisProps}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis
                {...axisProps}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              {localConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
              {localConfig.showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey="value"
                stroke={localConfig.colors[0]}
                fill={localConfig.colors[0]}
                fillOpacity={0.6}
                strokeWidth={3}
                isAnimationActive={localConfig.animation}
                name={localConfig.title}
              />
            </AreaChart>
          );

        case 'scatter':
          return (
            <ScatterChart {...chartProps}>
              {localConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
              <XAxis
                type="number"
                dataKey="x"
                name="X"
                {...axisProps}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Y"
                {...axisProps}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              {localConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
              {localConfig.showLegend && <Legend />}
              <Scatter
                name={localConfig.title}
                data={data}
                fill={localConfig.colors[0]}
                isAnimationActive={localConfig.animation}
              />
            </ScatterChart>
          );

        case 'radar':
          if (radarData.length === 0) {
            return (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No hay datos para mostrar</p>
                </div>
              </div>
            );
          }
          return (
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e0e0e0" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 'auto']}
                tick={{ fill: '#666', fontSize: 10 }}
              />
              {localConfig.showTooltip && <Tooltip />}
              {localConfig.showLegend && <Legend />}
              <Radar
                name={localConfig.title}
                dataKey="value"
                stroke={localConfig.colors[0]}
                fill={localConfig.colors[0]}
                fillOpacity={0.3}
                isAnimationActive={localConfig.animation}
              />
            </RadarChart>
          );

        case 'heatmap':
        case 'funnel':
          // Heatmap y funnel no tienen equivalente directo en Recharts
          // Mostrar un mensaje
          return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">
                  Tipo de gráfico "{localConfig.type}" no disponible en Recharts
                </p>
                <p className="text-xs mt-1">Usa line, bar, pie, area, scatter o radar</p>
              </div>
            </div>
          );

        default:
          return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Tipo de gráfico no soportado</p>
              </div>
            </div>
          );
      }
    };

    const handleExport = (format: string) => {
      // Para Recharts, usamos el canvas del navegador
      const svg = document.querySelector(`.advanced-chart-${localConfig.id} svg`);
      if (svg) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width * 2;
          canvas.height = img.height * 2;
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const link = document.createElement('a');
            link.download = `${localConfig.title}.${format}`;
            link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : format}`);
            link.click();
          }
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      }
      onExport?.(format);
    };

    const toggleFullscreen = () => {
      setIsFullscreen(!isFullscreen);
    };

    const resetToDefaults = () => {
      const defaultConfig: ChartConfig = {
        ...config,
        colors: DEFAULT_COLORS,
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        showDataLabels: false,
        animation: true,
        responsive: true,
        height: 400,
        width: 600
      };
      handleConfigChange(defaultConfig);
      toast({
        title: "Configuración restablecida",
        description: "Se han aplicado los valores por defecto",
      });
    };

    if (loading) {
      return (
        <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
          <CardContent className="flex items-center justify-center h-96">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Cargando gráfico...</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3 }}
        className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      >
        <Card className={`h-full ${isFullscreen ? 'rounded-none' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {localConfig.title}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {CHART_TYPES.find(t => t.value === localConfig.type)?.label}
                </Badge>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="h-8 w-8 p-0"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>

                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="chart-settings-description">
                    <DialogHeader>
                      <DialogTitle>Personalizar Gráfico</DialogTitle>
                      <DialogDescription id="chart-settings-description">
                        Configura la apariencia y opciones del gráfico
                      </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="general" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
                      </TabsList>

                      <TabsContent value="general" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="chartTitle">Título del Gráfico</Label>
                            <Input
                              id="chartTitle"
                              value={localConfig.title}
                              onChange={(e) => handleConfigChange({ title: e.target.value })}
                              placeholder="Ingresa el título"
                            />
                          </div>
                          <div>
                            <Label htmlFor="chartType">Tipo de Gráfico</Label>
                            <Select
                              value={localConfig.type}
                              onValueChange={(value: ChartConfig['type']) => handleConfigChange({ type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CHART_TYPES.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center space-x-2">
                                      <type.icon className="h-4 w-4" />
                                      <span>{type.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="chartHeight">Altura (px)</Label>
                            <Input
                              id="chartHeight"
                              type="number"
                              value={localConfig.height}
                              onChange={(e) => handleConfigChange({ height: parseInt(e.target.value) || 400 })}
                              min="200"
                              max="1000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="chartWidth">Ancho (px)</Label>
                            <Input
                              id="chartWidth"
                              type="number"
                              value={localConfig.width}
                              onChange={(e) => handleConfigChange({ width: parseInt(e.target.value) || 600 })}
                              min="300"
                              max="1200"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="animation"
                              checked={localConfig.animation}
                              onCheckedChange={(checked) => handleConfigChange({ animation: checked })}
                            />
                            <Label htmlFor="animation">Animaciones</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="responsive"
                              checked={localConfig.responsive}
                              onCheckedChange={(checked) => handleConfigChange({ responsive: checked })}
                            />
                            <Label htmlFor="responsive">Responsive</Label>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="apariencia" className="space-y-4">
                        <div>
                          <Label htmlFor="theme">Tema</Label>
                          <Select
                            value={localConfig.theme}
                            onValueChange={(value: ChartConfig['theme']) => handleConfigChange({ theme: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {THEMES.map(theme => (
                                <SelectItem key={theme.value} value={theme.value}>
                                  {theme.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="showLegend"
                              checked={localConfig.showLegend}
                              onCheckedChange={(checked) => handleConfigChange({ showLegend: checked })}
                            />
                            <Label htmlFor="showLegend">Mostrar Leyenda</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="showGrid"
                              checked={localConfig.showGrid}
                              onCheckedChange={(checked) => handleConfigChange({ showGrid: checked })}
                            />
                            <Label htmlFor="showGrid">Mostrar Cuadrícula</Label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="showTooltip"
                              checked={localConfig.showTooltip}
                              onCheckedChange={(checked) => handleConfigChange({ showTooltip: checked })}
                            />
                            <Label htmlFor="showTooltip">Mostrar Tooltip</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="showDataLabels"
                              checked={localConfig.showDataLabels}
                              onCheckedChange={(checked) => handleConfigChange({ showDataLabels: checked })}
                            />
                            <Label htmlFor="showDataLabels">Mostrar Etiquetas</Label>
                          </div>
                        </div>

                        <div>
                          <Label>Colores Personalizados</Label>
                          <div className="grid grid-cols-4 gap-2 mt-2">
                            {localConfig.colors.map((color, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input
                                  type="color"
                                  value={color}
                                  onChange={(e) => {
                                    const newColors = [...localConfig.colors];
                                    newColors[index] = e.target.value;
                                    handleConfigChange({ colors: newColors });
                                  }}
                                  className="w-12 h-8 p-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newColors = localConfig.colors.filter((_, i) => i !== index);
                                    handleConfigChange({ colors: newColors });
                                  }}
                                  className="h-6 w-6 p-0 text-red-500"
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newColors = [...localConfig.colors, '#000000'];
                                handleConfigChange({ colors: newColors });
                              }}
                              className="h-8 w-8 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-4 border-t">
                          <Button onClick={resetToDefaults} variant="outline">
                            Restablecer Valores
                          </Button>
                          <Button
                            onClick={() => setShowSettings(false)}
                            className="ml-auto"
                          >
                            Aplicar Cambios
                          </Button>
                        </div>
                      </TabsContent>

                    </Tabs>
                  </DialogContent>
                </Dialog>

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleExport('png')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div
              className={`w-full advanced-chart-${localConfig.id}`}
              style={{
                height: `${localConfig.height}px`,
                width: localConfig.responsive ? '100%' : `${localConfig.width}px`
              }}
            >
              {localConfig.responsive ? (
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              ) : (
                <div style={{ width: localConfig.width, height: localConfig.height }}>
                  {renderChart()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

export default AdvancedChart;
