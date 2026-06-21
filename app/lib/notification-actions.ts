"use server"

import { prisma } from "@/app/lib/prisma"
import { TimelineStatuses } from "@/app/lib/definitions"

type TimelineStatusKey = keyof typeof TimelineStatuses

type ShipmentStatusNotificationInput = {
  shipmentId: string
  status: TimelineStatusKey
}

function getResendApiKey() {
  return process.env.RESEND_API_KEY
}

function getFromEmail() {
  return process.env.NOTIFICATIONS_FROM_EMAIL ?? "onboarding@resend.dev"
}

function buildEmailHtml({
  shipmentId,
  statusLabel,
}: {
  shipmentId: string
  statusLabel: string
}) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px;">Actualización de envío</h2>
      <p style="margin: 0 0 8px;">Tu envío <strong>${shipmentId}</strong> avanzó en su recorrido.</p>
      <p style="margin: 0 0 8px;">Nuevo estado: <strong>${statusLabel}</strong></p>
      <p style="margin: 16px 0 0; color: #6B7280;">Este correo se envió porque tenés activadas las alertas por email.</p>
    </div>
  `.trim()
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const resendApiKey = getResendApiKey()
  if (!resendApiKey) {
    console.warn("Skipping email alert: RESEND_API_KEY is not configured.")
    return
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to: [to],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "")
    throw new Error(`Resend error (${response.status}): ${errorBody}`)
  }
}

export async function notifyBuyerShipmentStepByEmail({
  shipmentId,
  status,
}: ShipmentStatusNotificationInput) {
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    select: { id: true, buyerId: true },
  })

  if (!shipment) return

  const buyer = await prisma.user.findUnique({
    where: { id: shipment.buyerId },
    select: { email: true, emailSub: true },
  })

  if (!buyer?.emailSub || !buyer.email) return

  const statusLabel = TimelineStatuses[status]

  await sendEmail({
    to: buyer.email,
    subject: `Estado actualizado de tu envío ${shipment.id}`,
    html: buildEmailHtml({ shipmentId: shipment.id, statusLabel }),
  })
}

