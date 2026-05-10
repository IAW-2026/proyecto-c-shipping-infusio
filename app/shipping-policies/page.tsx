export default function ShippingPoliciesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 w-full">
      <div className="mb-12">
        <p className="text-sm uppercase tracking-widest text-primary font-medium mb-2">
          Políticas
        </p>
        <h1 className="font-serif text-3xl font-medium text-foreground mb-2">
          Políticas de envío
        </h1>
        <p className="text-muted-foreground">
          Conocé las condiciones generales aplicables a la preparación, despacho,
          seguimiento y entrega de los envíos gestionados por Infusio.
        </p>
      </div>

      <div className="space-y-10 text-muted-foreground leading-7">
        <section>
          <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
            1. Cobertura de envíos
          </h2>
          <p>
            Infusio realiza envíos dentro del territorio de la República Argentina,
            sujeto a disponibilidad logística y cobertura operativa.
          </p>
          <p className="mt-3">
            Algunas zonas pueden presentar mayores tiempos de entrega, costos
            adicionales o restricciones temporales de acceso. La disponibilidad del
            servicio podrá verificarse mediante el código postal informado al momento
            de la compra.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
            2. Tiempos de preparación
          </h2>
          <p>
            Los tiempos de preparación corresponden al período necesario para validar
            el pedido, confirmar el pago, preparar el producto y coordinar la logística
            del envío.
          </p>
          <p className="mt-3">
            Los pedidos comenzarán a procesarse una vez acreditado el pago. El plazo
            puede variar según la disponibilidad de stock, el volumen del pedido, el
            tipo de producto y la ubicación del vendedor.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
            3. Tiempos de entrega
          </h2>
          <p>
            Los plazos de entrega informados en la plataforma son estimativos y pueden
            variar por causas operativas, climáticas, logísticas o de fuerza mayor.
          </p>
          <p className="mt-3">
            El tiempo de entrega comienza a computarse una vez finalizada la preparación
            del pedido y confirmado el despacho.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
            4. Costos de envío
          </h2>
          <p>
            El costo del envío será calculado automáticamente considerando origen,
            destino, volumen, peso estimado, distancia logística y tipo de servicio.
          </p>
          <p className="mt-3">
            El valor final será informado antes de confirmar la compra. Infusio podrá
            ofrecer promociones de envío gratuito o bonificaciones parciales sujetas a
            condiciones específicas.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
            5. Seguimiento de envíos
          </h2>
          <p>
            Una vez despachado el pedido, el usuario podrá realizar el seguimiento
            mediante el número de envío proporcionado por la plataforma.
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>Pendiente</li>
            <li>En preparación</li>
            <li>Despachado</li>
            <li>En tránsito</li>
            <li>En distribución</li>
            <li>Entregado</li>
            <li>Incidencia logística</li>
            <li>Cancelado</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
            6. Recepción del pedido
          </h2>
          <p>
            Al recibir el pedido, el destinatario deberá verificar la integridad del
            paquete, el estado exterior y la coincidencia con la compra realizada.
          </p>
          <p className="mt-3">
            En caso de detectar daños visibles, faltantes o inconsistencias, se
            recomienda dejar constancia con el transportista y contactar al soporte de
            Infusio.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
            7. Intentos de entrega
          </h2>
          <p>
            Las entregas se realizarán en la dirección informada por el usuario. En caso
            de ausencia del destinatario, podrán realizarse nuevos intentos de entrega o
            el pedido podrá quedar disponible para retiro según la operación logística.
          </p>
          <p className="mt-3">
            Los costos derivados de errores en la dirección o de reiteración de entregas
            podrán ser trasladados al usuario.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
            8. Incidencias logísticas
          </h2>
          <p>
            Se considera incidencia logística cualquier situación que impida o altere el
            proceso normal de entrega.
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>Dirección incorrecta o incompleta</li>
            <li>Domicilio inexistente</li>
            <li>Ausencia reiterada del destinatario</li>
            <li>Rechazo del pedido</li>
            <li>Daños durante el transporte</li>
            <li>Pérdida del paquete</li>
            <li>Imposibilidad de acceso al domicilio</li>
          </ul>

          <p className="mt-3">
            Infusio realizará esfuerzos razonables para resolver la incidencia y
            mantener informado al usuario.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
            9. Productos dañados o faltantes
          </h2>
          <p>
            Si el usuario recibe un producto dañado, incompleto, incorrecto o con
            faltantes, deberá reportarlo dentro de las 48 horas posteriores a la
            recepción.
          </p>
          <p className="mt-3">
            El reclamo deberá incluir número de pedido, descripción del inconveniente y
            evidencia fotográfica cuando corresponda.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
            10. Cancelaciones y devoluciones
          </h2>
          <p>
            Las condiciones de cancelación, cambios y devoluciones se rigen por las
            políticas específicas publicadas en la plataforma y por la normativa vigente
            de defensa del consumidor.
          </p>
          <p className="mt-3">
            Algunos costos logísticos podrían no ser reintegrables una vez efectuado el
            despacho.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
            11. Responsabilidad
          </h2>
          <p>
            Infusio actúa como plataforma de gestión logística. No será responsable por
            demoras atribuibles a terceros, eventos de fuerza mayor, información
            incorrecta proporcionada por el usuario o situaciones ajenas a su control
            razonable.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
            12. Modificaciones
          </h2>
          <p>
            Infusio podrá modificar estas políticas de envío para adecuarlas a cambios
            operativos, tecnológicos, comerciales o normativos.
          </p>
          <p className="mt-3">
            Las modificaciones entrarán en vigencia desde su publicación en la
            plataforma.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
            13. Contacto
          </h2>
          <p>
            Para consultas relacionadas con envíos, seguimiento o incidencias logísticas,
            el usuario podrá comunicarse mediante los canales oficiales de soporte de
            Infusio.
          </p>
        </section>
      </div>
    </div>
  )
}