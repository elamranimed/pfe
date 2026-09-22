import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { formatCurrency } from '@/lib/utils';
import AuthService from '@/services/AuthService';

export async function POST(request: NextRequest) {
  const user = await AuthService.requireAuth(request, ['admin']);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

    console.log("TEST API");
    console.log('🔵 API /api/relance appelée');
  
  try {
    // Vérifier les variables d'environnement
    console.log('🔵 Vérification config SMTP...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***configuré***' : 'MANQUANT');

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ Variables SMTP manquantes');
      return NextResponse.json(
        { 
          error: 'Configuration email non définie',
          details: 'Vérifiez SMTP_USER et SMTP_PASS dans votre fichier .env'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('🔵 Body reçu:', body);

    const { 
      officeNumber, 
      officeName, 
      email, 
      moisImpayes, 
      montantCumul,
      telephone 
    } = body;

    if (!email) {
      console.error('❌ Email manquant');
      return NextResponse.json(
        { error: 'Email du locataire requis' },
        { status: 400 }
      );
    }

    console.log('🔵 Création du transporteur Brevo...');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('🔵 Vérification de la connexion SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP OK');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content { 
            padding: 30px; 
          }
          .alert-box { 
            background-color: #fef2f2; 
            border-left: 4px solid #dc2626; 
            padding: 15px; 
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-table {
            width: 100%;
            margin: 25px 0;
            border-collapse: collapse;
          }
          .info-table tr {
            border-bottom: 1px solid #e5e7eb;
          }
          .info-table td {
            padding: 12px 0;
          }
          .info-table .label { 
            font-weight: 600; 
            color: #6b7280;
            width: 50%;
          }
          .info-table .value {
            color: #111827;
            text-align: right;
          }
          .amount { 
            font-size: 28px; 
            font-weight: bold; 
            color: #dc2626; 
          }
          .footer { 
            background-color: #1f2937; 
            color: #9ca3af; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px; 
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Relance de Paiement</h1>
          </div>
          
          <div class="content">
            <p>Bonjour <strong>${officeName || 'Cher locataire'}</strong>,</p>
            
            <p>Nous vous contactons concernant votre bureau <strong>n°${officeNumber}</strong>.</p>
            
            <div class="alert-box">
              <p style="margin: 0; font-weight: 600;">⚠️ Situation de votre compte</p>
            </div>
            
            <table class="info-table">
              <tr>
                <td class="label">Bureau</td>
                <td class="value"><strong>#${officeNumber}</strong></td>
              </tr>
              <tr>
                <td class="label">Nombre de mois impayés</td>
                <td class="value"><strong style="color: #dc2626;">${moisImpayes} mois</strong></td>
              </tr>
              <tr>
                <td class="label">Montant total dû</td>
                <td class="value"><span class="amount">${formatCurrency(montantCumul)}</span></td>
              </tr>
            </table>
            
            <p style="margin-top: 30px;">
              Nous vous prions de bien vouloir <strong>régulariser votre situation dans les plus brefs délais</strong> 
              afin d'éviter toute mesure supplémentaire.
            </p>
            
            <p>
              Pour tout renseignement ou pour convenir d'un échéancier de paiement, 
              n'hésitez pas à nous contacter.
            </p>
            
            <p style="margin-top: 40px; margin-bottom: 0;">
              Cordialement,<br>
              <strong>La Direction</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement depuis notre système de gestion.</p>
            <p>© ${new Date().getFullYear()} - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
RELANCE DE PAIEMENT - Bureau n°${officeNumber}
${'='.repeat(50)}

Bonjour ${officeName || 'Cher locataire'},

Nous vous contactons concernant votre bureau n°${officeNumber}.

⚠️ SITUATION DE VOTRE COMPTE

Bureau : #${officeNumber}
Nombre de mois impayés : ${moisImpayes} mois
Montant total dû : ${formatCurrency(montantCumul)}

Nous vous prions de bien vouloir régulariser votre situation dans les plus brefs délais afin d'éviter toute mesure supplémentaire.

Pour tout renseignement ou pour convenir d'un échéancier de paiement, n'hésitez pas à nous contacter.

Cordialement,
La Direction du syndic
    `;

    console.log('🔵 Envoi de l\'email à:', email);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Gestion Bureaux" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `⚠️ Relance de paiement - Bureau n°${officeNumber}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Email envoyé avec succès:', info.messageId);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: 'Email de relance envoyé avec succès',
      recipient: email,
    });

  } catch (error: any) {
    console.error('❌ Erreur détaillée:', error);
    
    let errorMessage = 'Erreur lors de l\'envoi de l\'email';
    let hint = '';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentification refusée';
      hint = 'Vérifiez vos identifiants SMTP dans le fichier .env';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Impossible de se connecter au serveur SMTP';
      hint = 'Vérifiez votre connexion internet';
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message,
        code: error.code,
        hint
      },
      { status: 500 }
    );
  }
}