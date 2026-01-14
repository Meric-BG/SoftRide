const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendActivationEmail(to, firstName, lastName, activationId) {
        // Validation basique des identifiants avant envoi
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('ERREUR CRITIQUE EMAIL : EMAIL_USER ou EMAIL_PASS non configuré dans le .env');
            return false;
        }

        const mailOptions = {
            from: `"Kemet SoftRide" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Votre ID d\'activation Kemet SoftRide',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #0d1117; color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="color: #10B981; margin: 0; font-size: 28px;">KEMET SOFTRIDE</h1>
                        <p style="color: #8b949e; margin: 8px 0 0;">Plateforme de mobilité électrique sécurisée</p>
                    </div>
                    <div style="background-color: #161b22; padding: 32px; border-radius: 8px; border: 1px solid #30363d;">
                        <h2 style="color: #ffffff; margin: 0 0 16px; font-size: 20px;">Félicitations, ${firstName} !</h2>
                        <p style="color: #c9d1d9; font-size: 16px; line-height: 1.6;">Votre véhicule a été enregistré par l'administrateur. Voici votre code d'activation exclusif :</p>
                        
                        <div style="background-color: rgba(16, 185, 129, 0.1); padding: 24px; text-align: center; border-radius: 6px; border: 1px dashed #10B981; margin: 24px 0;">
                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #10B981; font-family: monospace;">${activationId}</span>
                        </div>
                        
                        <p style="color: #c9d1d9; font-size: 14px; line-height: 1.6;">Rendez-vous sur l'application <strong>My Kemet</strong> pour finaliser votre inscription en utilisant ce code.</p>
                    </div>
                    <p style="color: #8b949e; font-size: 12px; text-align: center; margin-top: 32px;">
                        Ceci est un email automatique, merci de ne pas y répondre.<br>
                        © 2026 Kemet SoftRide - Tous droits réservés
                    </p>
                </div>
            `,
        };

        try {
            console.log(`Tentative d'envoi d'email à ${to} via ${process.env.EMAIL_HOST}...`);
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email envoyé avec succès ! Message ID:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ ECHEC DE L\'ENVOI D\'EMAIL :');
            console.error('Détails de l\'erreur :', error.message);
            if (error.code === 'EAUTH') {
                console.error('-> Problème d\'authentification. Vérifiez EMAIL_USER et EMAIL_PASS.');
                console.error('-> Si vous utilisez Gmail, avez-vous utilisé un "Mot de passe d\'application" ?');
            }
            return false;
        }
    }
}

module.exports = new EmailService();
