import { RegistrationData } from '../types';

export const submitRegistration = async (data: RegistrationData): Promise<boolean> => {
  const webhookUrl = process.env.WEBHOOK_URL;

  // Simulate network delay for better UX
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (!webhookUrl) {
    console.warn("WEBHOOK_URL is not defined. Simulating success.");
    console.log("Form Data:", JSON.stringify(data, null, 2));
    return true;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Submission failed:", error);
    throw error;
  }
};
