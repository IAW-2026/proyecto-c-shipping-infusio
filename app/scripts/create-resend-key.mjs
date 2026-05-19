import { Resend } from "resend";

const resend = new Resend("re_xxxxxxxxx");

const { data, error } = await resend.apiKeys.create({ name: "Production" });

if (error) {
  console.error(error);
} else {
  console.log(data);
}