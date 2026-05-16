import { Webhook } from "svix";
import { headers } from "next/headers";
import { syncUserFromClerk } from "@/app/lib/actions";

type ClerkWebhookUserData = {
	id: string;
	first_name: string | null;
	last_name: string | null;
	email_addresses: Array<{ email_address: string }>;
	public_metadata?: { roles?: unknown };
	publicMetadata?: { roles?: unknown };
};

export async function POST(req: Request) {
	const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

	if (!webhookSecret) {
		console.error("CLERK_WEBHOOK_SECRET is not configured");
		return new Response("Webhook secret missing", { status: 500 });
	}

	const headerPayload = await headers();
	const svixId = headerPayload.get("svix-id");
	const svixTimestamp = headerPayload.get("svix-timestamp");
	const svixSignature = headerPayload.get("svix-signature");

	if (!svixId || !svixTimestamp || !svixSignature) {
		return new Response("Missing svix headers", { status: 400 });
	}

	const payload = await req.text();
	const wh = new Webhook(webhookSecret);

	let evt: { type: string; data: ClerkWebhookUserData };

	try {
		evt = wh.verify(payload, {
			"svix-id": svixId,
			"svix-timestamp": svixTimestamp,
			"svix-signature": svixSignature,
		}) as { type: string; data: ClerkWebhookUserData };
	} catch (error) {
		console.error("Error verifying Clerk webhook:", error);
		return new Response("Invalid webhook signature", { status: 400 });
	}

	try {
		if (evt.type === "user.created" || evt.type === "user.updated") {
			const emailAddresses = (evt.data.email_addresses ?? []).map((email) => ({
				emailAddress: email.email_address,
			}));

			await syncUserFromClerk({
				id: evt.data.id,
				first_name: evt.data.first_name,
				last_name: evt.data.last_name,
				emailAddresses,
				publicMetadata: evt.data.public_metadata ?? evt.data.publicMetadata,
			});
		}

		return new Response("Webhook processed", { status: 200 });
	} catch (error) {
		console.error("Error processing Clerk webhook:", error);
		return new Response("Webhook processing error", { status: 500 });
	}
}
