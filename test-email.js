const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.raczsnyieqlsrrfphaae:Kontradiksi123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres' });
  await client.connect();
  
  await client.query('UPDATE portfolios SET "isPublished" = true');
  
  const res = await client.query('SELECT id FROM portfolios LIMIT 1');
  const portfolioId = res.rows[0].id;
  console.log('Using PID:', portfolioId);
  
  const response = await fetch(`http://localhost:3000/api/contact/${portfolioId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      senderName: 'HgzPort Assistant', 
      senderEmail: 'hello@example.com', 
      subject: 'Test Notifikasi Email dari AI!', 
      message: 'Halo! Ini adalah pesan uji coba otomatis dari asisten AI Anda untuk memastikan bahwa notifikasi email Resend berfungsi dengan sempurna. Jika Anda menerima ini, selamat, konfigurasi Anda 100% sukses! Selamat bekerja!' 
    })
  });
  
  const data = await response.json();
  console.log('Result:', data);
  
  await client.end();
}

run().catch(console.error);
