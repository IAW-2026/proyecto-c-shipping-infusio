"use client"

import React, { useState } from 'react'

type ActionResult = { ok?: boolean; errors?: Record<string, string>; message?: string }

export default function ContactFormClient({ action }: { action: (data: any) => Promise<ActionResult> }) {
  const [form, setForm] = useState({ name: '', lastname: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setSuccess(null)
    setSubmitting(true)

    try {
      const res = await action(form)
      if (!res.ok) {
        if (res.errors) setErrors(res.errors)
        else setErrors({ form: res.message ?? 'Error del servidor' })
        return
      }

      setSuccess(res.message ?? 'Consulta enviada correctamente')
      setForm({ name: '', lastname: '', email: '', subject: '', message: '' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">Nombre</label>
          <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary" />
          {errors.name ? <p className="text-xs text-red-500">{errors.name}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="lastname" className="text-sm font-medium text-foreground">Apellido</label>
          <input id="lastname" value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary" />
          {errors.lastname ? <p className="text-xs text-red-500">{errors.lastname}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">Correo electrónico</label>
        <input id="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary" />
        {errors.email ? <p className="text-xs text-red-500">{errors.email}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium text-foreground">Asunto</label>
        <input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary" />
        {errors.subject ? <p className="text-xs text-red-500">{errors.subject}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-foreground">Mensaje</label>
        <textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={6} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary" />
        {errors.message ? <p className="text-xs text-red-500">{errors.message}</p> : null}
      </div>

      {errors.form ? <p className="text-sm text-red-500">{errors.form}</p> : null}
      {success ? <p className="text-sm text-green-600">{success}</p> : null}

      <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
        {submitting ? 'Enviando...' : 'Enviar consulta'}
      </button>
    </form>
  )
}
