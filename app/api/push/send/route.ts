import { NextResponse } from "next/server"
import { sendPushToUsers } from "@/app/lib/push"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, title, message, url } = body

    if (!title || !message) {
      return NextResponse.json({ error: "title and message required" }, { status: 400 })
    }

    await sendPushToUsers(userId ? [userId] : undefined, title, message, url)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error enviando push:', error)
    return NextResponse.json({ error: 'Error enviando push' }, { status: 500 })
  }
}
