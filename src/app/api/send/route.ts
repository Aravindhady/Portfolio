import { EmailTemplate } from "@/components/email-template";
import { config } from "@/data/config";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const Email = z.object({
  fullName: z.string().min(2, "Full name is invalid!"),
  email: z.string().email({ message: "Email is invalid!" }),
  message: z.string().min(10, "Message is too short!"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);

    const {
      success: zodSuccess,
      data: zodData,
      error: zodError,
    } = Email.safeParse(body);

    if (!zodSuccess) {
      console.error("Validation error:", zodError);
      return Response.json({ error: zodError?.message }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return Response.json(
        { error: "Email service is not configured" },
        { status: 500 }
      );
    }

    console.log("Sending email to:", config.email);
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: [config.email],
      replyTo: zodData.email,
      subject: `New Contact Form Submission from ${zodData.fullName}`,
      react: EmailTemplate({
        fullName: zodData.fullName,
        email: zodData.email,
        message: zodData.message,
      }),
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return Response.json({ error: resendError }, { status: 500 });
    }

    console.log("Email sent successfully:", resendData);
    return Response.json(resendData);
  } catch (error) {
    console.error("Unexpected error:", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
