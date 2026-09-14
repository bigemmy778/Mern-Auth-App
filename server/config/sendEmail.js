// This function sends emails through Brevo's HTTPS API.
// We use the API instead of SMTP because Render can block SMTP ports.

const sendEmail = async ({ to, subject, html }) => {

    try {

        // Send an HTTPS request to Brevo's email API.
        const response = await fetch(
            'https://api.brevo.com/v3/smtp/email',
            {
                method: 'POST',

                headers: {
                    accept: 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                    'content-type': 'application/json'
                },

                // Information about the email we want Brevo to send.
                body: JSON.stringify({
                    sender: {
                        email: process.env.SENDER_EMAIL,
                        name: 'FelzStack'
                    },

                    to: [
                        {
                            email: to
                        }
                    ],

                    subject: subject,

                    htmlContent: html
                })
            }
        );

        // Convert Brevo's response into JavaScript.
        const data = await response.json();

        // If Brevo rejected the request, throw an error.
        if (!response.ok) {
            throw new Error(
                data.message || 'Brevo failed to send the email'
            );
        }

        // Return Brevo's successful response.
        return data;

    } catch (error) {

        // Show the error in the Render logs.
        console.log('EMAIL API ERROR:', error.message);

        // Pass the error back to the controller.
        throw error;
    }
};

export default sendEmail;