import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  Filler,
} from 'chart.js'

Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  Filler,
)

Chart.defaults.color = '#e9d5ff'
Chart.defaults.font.family = 'Space Grotesk, Inter, sans-serif'
Chart.defaults.plugins.legend.labels.usePointStyle = true

