export default function ContactPage() {
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
          <form className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  Nombre
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Ingresá tu nombre"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="lastname"
                  className="text-sm font-medium text-foreground"
                >
                  Apellido
                </label>

                <input
                  id="lastname"
                  type="text"
                  placeholder="Ingresá tu apellido"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                placeholder="ejemplo@email.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="subject"
                className="text-sm font-medium text-foreground"
              >
                Asunto
              </label>

              <input
                id="subject"
                type="text"
                placeholder="Motivo de la consulta"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="text-sm font-medium text-foreground"
              >
                Mensaje
              </label>

              <textarea
                id="message"
                rows={6}
                placeholder="Escribí tu consulta..."
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Enviar consulta
            </button>
          </form>
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