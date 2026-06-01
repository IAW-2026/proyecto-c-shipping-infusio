import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').trim(),
  lastname: z.string().min(1, 'El apellido es obligatorio').trim(),
  email: z.string().min(1, 'El correo es obligatorio').email('Correo inválido').trim(),
  subject: z.string().min(1, 'El asunto es obligatorio').trim(),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').trim(),
})

export type ContactInput = z.infer<typeof contactSchema>
