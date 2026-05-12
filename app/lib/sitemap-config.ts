export interface SitemapLink {
  label: string
  href: string
  icon: 'user' | 'package'
}

export interface SitemapSection {
  title: string
  links: SitemapLink[]
}

export const SITEMAP: SitemapSection[] = [
  {
    title: 'Cuenta',
    links: [
      { label: 'Mi Perfil', href: '/user-profile', icon: 'user' },
      { label: 'Mis Envíos', href: '/user-profile/history', icon: 'package' },
    ],
  },
  {
    title: 'Rastreo',
    links: [
      { label: 'Buscar Envío', href: '/user-profile/tracking', icon: 'package' },
      { label: 'Suscripción a Eventos', href: '/user-profile/subscription', icon: 'package' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { label: 'Centro de Ayuda', href: '/help', icon: 'user' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidad', href: '/privacy', icon: 'user' },
      { label: 'Términos de Servicio', href: '/terms', icon: 'user' },
      { label: 'Políticas de Envío', href: '/shipping-policies', icon: 'package' },
    ],
  },
]
