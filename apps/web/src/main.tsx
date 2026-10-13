import { createRoot } from 'react-dom/client'
import { App } from '@/App'
import '@/styles/tokens.css'
import '@/styles/style.css'
import '@/styles/prediction.css'
import '@/styles/journey.css'
import '@/styles/interactions.css'

const root = document.getElementById('app')
if (!root) throw new Error('Missing app element')
createRoot(root).render(<App />)
