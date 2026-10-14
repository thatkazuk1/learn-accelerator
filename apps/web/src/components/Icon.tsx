import {
  AlertCircle,
  Box,
  Cable,
  Check,
  Circle,
  CircleAlert,
  CircleCheck,
  Globe,
  HardDrive,
  Info,
  Lightbulb,
  Lock,
  MinusCircle,
  Monitor,
  Network,
  Play,
  Plus,
  ArrowRight,
  RotateCcw,
  Route,
  Router,
  Scan,
  Server,
  Smartphone,
  Undo2,
  Unplug,
  Wifi,
  X,
} from 'lucide-react'
import type { DeviceId } from '@homelab/core'

const icons = {
  AlertCircle,
  Box,
  Cable,
  Check,
  Circle,
  CircleAlert,
  CircleCheck,
  Globe,
  HardDrive,
  Info,
  Lightbulb,
  Lock,
  MinusCircle,
  Monitor,
  Network,
  Play,
  Plus,
  ArrowRight,
  RotateCcw,
  Route,
  Router,
  Scan,
  Server,
  Smartphone,
  Undo2,
  Unplug,
  Wifi,
  X,
}
export type IconName = keyof typeof icons
export const deviceIcons: Record<DeviceId | 'internet', IconName> = {
  isp: 'Globe',
  router: 'Router',
  switch: 'Network',
  ap: 'Wifi',
  desktop: 'Monitor',
  phone: 'Smartphone',
  internet: 'Server',
}
export function Icon({ name }: { name: IconName }) {
  const Component = icons[name]
  return <Component aria-hidden="true" strokeWidth={1.5} />
}
export function IconButton({
  title,
  icon,
  onClick,
  disabled = false,
  action,
}: {
  title: string
  icon: IconName
  onClick: () => void
  disabled?: boolean
  action?: string
}) {
  return (
    <button
      type="button"
      className="icon-button"
      aria-label={title}
      title={title}
      disabled={disabled}
      data-action={action}
      onClick={onClick}
    >
      <Icon name={icon} />
    </button>
  )
}
