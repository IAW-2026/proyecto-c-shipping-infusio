"use client"

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-3 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
          <div className="flex items-center gap-2 text-center">
            <span className="infusio">Infusio</span>
            <span className="lowernav-component">•</span>
            <span className="lowernav-component">Shipping</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-center md:justify-start md:gap-8">
            <a href="#" className="lowernav-component lowernav-component-hover">Términos</a>
            <a href="#" className="lowernav-component lowernav-component-hover">Privacidad</a>
            <a href="#" className="lowernav-component lowernav-component-hover">Contacto</a>
          </div>
          <p className="lowernav-component">© 2026 Infusio. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
