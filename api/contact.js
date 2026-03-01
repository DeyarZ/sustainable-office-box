import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firma, ansprechpartner, position, email, telefon, stueckzahl, materialwunsch, nachricht } = req.body;

  if (!firma || !ansprechpartner || !email) {
    return res.status(400).json({ error: 'Pflichtfelder fehlen' });
  }

  const text = [
    `Neue B2B-Anfrage über die Website`,
    ``,
    `Firma: ${firma}`,
    `Ansprechpartner: ${ansprechpartner}`,
    position ? `Position/Abteilung: ${position}` : null,
    `E-Mail: ${email}`,
    telefon ? `Telefon: ${telefon}` : null,
    stueckzahl ? `Gewünschte Stückzahl: ${stueckzahl}` : null,
    materialwunsch ? `Bevorzugtes Material: ${materialwunsch}` : null,
    nachricht ? `\nNachricht:\n${nachricht}` : null,
  ].filter(Boolean).join('\n');

  try {
    const transporter = nodemailer.createTransport({
      host: 'mail.gmx.net',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Office Storage Box - Anfrage" <${process.env.SMTP_USER}>`,
      to: 'm.worlitzer@gmx.de',
      replyTo: email,
      subject: `B2B-Anfrage: ${firma}`,
      text: text,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Fehler beim Senden' });
  }
}
