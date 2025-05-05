// server.js
import express from "express";
import pg from "pg";
import cors from "cors";

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configurare conexiune PostgreSQL
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "produse_fitosanitare",
  password: "Petrolul.1924", // pune-ți parola ta
  port: 5432,
});

// Ruta principală: toate produsele
app.get("/produse", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produse");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Eroare la interogare." });
  }
});

// Ruta de căutare cu filtre
app.get("/produse/cautare", async (req, res) => {
  const { denumire, substanta, categorie, cultura, daunator, sort, dir } = req.query;
  let queryText = "SELECT * FROM produse WHERE 1=1";
  const values = [];

  // Filtru după denumire_produs
  if (denumire) {
    values.push(`%${denumire.toLowerCase()}%`);
    queryText += ` AND LOWER(denumire_produs) LIKE $${values.length}`;
  }

  // Filtru după oricare din substanțele active 1–4
  if (substanta) {
    values.push(`%${substanta.toLowerCase()}%`);
    queryText += ` AND (
      LOWER(substanta_activa_1) LIKE $${values.length}
      OR LOWER(substanta_activa_2) LIKE $${values.length}
      OR LOWER(substanta_activa_3) LIKE $${values.length}
      OR LOWER(substanta_activa_4) LIKE $${values.length}
    )`;
  }

  // Filtru după categorie_produs
  if (categorie) {
    values.push(`%${categorie.toLowerCase()}%`);
    queryText += ` AND LOWER(categorie_produs) LIKE $${values.length}`;
  }

  // Filtru după culturi_omologate
  if (cultura) {
    values.push(`%${cultura.toLowerCase()}%`);
    queryText += ` AND LOWER(culturi_omologate) LIKE $${values.length}`;
  }

  // Filtru după daunatori_omologati
  if (daunator) {
    values.push(`%${daunator.toLowerCase()}%`);
    queryText += ` AND LOWER(daunatori_omologati) LIKE $${values.length}`;
  }

  // Sortare opțională
  const allowedSort = [
    "denumire_produs",
    "categorie_produs",
    "substanta_activa_1",
    "culturi_omologate",
    "daunatori_omologati",
  ];
  if (sort && allowedSort.includes(sort)) {
    const direction = dir === "desc" ? "DESC" : "ASC";
    queryText += ` ORDER BY ${sort} ${direction}`;
  }

  try {
    const result = await pool.query(queryText, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Eroare la interogare filtrată." });
  }
});

// Pornire server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅Server Express ascultă pe portul ${PORT}`));


