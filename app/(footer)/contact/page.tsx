import ContactFormClient from './ContactFormClient'
import { contactSchema, type ContactInput } from '@/app/lib/schemas'

export default function ContactPage() {
  async function sendContact(data: ContactInput) {
    'use server'
    // Validación server-side con zod
    const parsed = contactSchema.safeParse(data)
    if (!parsed.success) {
      const issues: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string
        issues[key] = issue.message
      }
      return { ok: false, errors: issues }
    }

    // Aquí integrar envío de mail o persistencia. Por ahora: log
    console.log('Contacto (server action):', parsed.data)

    return { ok: true, message: 'Consulta recibida. Te responderemos pronto.' }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 w-full">
      <div className="mb-12">
        <p className="text-sm uppercase tracking-widest text-primary font-medium mb-2">
          Contacto
        </p>

        <h1 className="font-serif text-3xl font-medium text-foreground mb-2">
          Estamos para ayudarte
        </h1>

        <p className="text-muted-foreground max-w-2xl">
          Si tenés consultas relacionadas con pedidos, envíos, pagos,
          incidencias o cualquier aspecto de la plataforma, podés comunicarte
          con el equipo de Infusio completando el siguiente formulario.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <ContactFormClient action={sendContact} />
        </div>

        <div className="h-fit rounded-2xl border border-border bg-secondary/30 p-8">
          <h2 className="font-serif text-2xl font-medium text-foreground mb-4">
            Información de contacto
          </h2>

          <div className="space-y-6 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">
                Soporte general
              </p>
              <p>support@infusio.com</p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                Atención logística
              </p>
              <p>shipping@infusio.com</p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                Horario de atención
              </p>
              <p>Lunes a viernes de 9:00 a 18:00 hs</p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">
                Tiempo estimado de respuesta
              </p>
              <p>Entre 24 y 48 horas hábiles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}