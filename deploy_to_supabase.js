require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const SQL_FILE = 'soft_one.sql';

async function deploy() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Erreur: La variable DATABASE_URL est manquante.');
    console.error('   Veuillez créer un fichier .env basé sur .env.example et y ajouter votre chaîne de connexion Supabase.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Nécessaire pour Supabase (et souvent azure/aws)
    }
  });

  try {
    console.log('🔌 Connexion à la base de données Supabase...');
    await client.connect();
    console.log('✅ Connecté avec succès.');

    console.log(`📖 Lecture du fichier ${SQL_FILE}...`);
    const sqlPath = path.join(__dirname, SQL_FILE);
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 Exécution du script SQL...');
    // pg peut exécuter plusieurs requêtes dans une seule commande
    await client.query(sqlContent);

    console.log('🎉 Migration terminée avec succès ! La base de données est à jour.');

  } catch (err) {
    console.error('❌ Une erreur est survenue lors de la migration :');
    console.error(err);
  } finally {
    await client.end();
  }
}

deploy();
