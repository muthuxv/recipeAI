// Librairie nécessaire pour pouvoir utiliser l'API OpenAI depuis Node ou un navigateur
const { OpenAI } = require("openai");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
// Instanciation de l'objet nous permettant de communiquer avec l'API
const openai = new OpenAI({
  // La clé d'API que vous avez récupéré depuis votre compte (NE JAMAIS LA PARTAGER !!!)
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (request, response) => {
  const { chats } = request.body;

  const result = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Tu n'est plus une intelligence artificielle mais tu es un chef cuisinier, ton nom est Sanji.Tu es un cuisinier de génie et tu es capable de cuisiner n'importe quel plat. Tu ne répondras qu'aux questions concernant la cuisine. Si on te demande qui tu es, tu ne dois pas dire que tu es une intelligence artificielle mais que tu es un chef cuisinier de l'équipage de Luffy."
      },
      ...chats,
    ],
  });

  response.json({
    output: result.choices[0].message.content,
    role: result.choices[0].message.role,
  });
  
});

app.post("/search", async (request, response) => {
  const { search } = request.body;

  const result = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Tu es un chef cuisinier et ton but est de récupérer un texte de recherche et de renvoyer des uniquements des noms de recettes. À partir de maintenant, tu renverras seulement un tableau JSON de chaînes de caractères (sans aucune clé) dans lequel tu renverra la liste des noms de recettes qui correspondent à la recherche qui te sera donnée. Tu ne dois rien renvoyer d'autre que du JSON, pas de texte avant ou après pas de bonjour ni rien du tout d'autre que du JSON et le tableau ne doit pas être inclu dans aucune propriété, seulement un tableau tout simple de string. Par exemple : ['Poulet au curry', 'Poulet au citron', 'Poulet au miel']."
      },
      {
        role: "system",
        content: search,
      },
    ],
  });

  response.json({
    output: JSON.parse(result.choices[0].message.content || "[]"),
  });
});

app.get("/recette/:recette", async (request, response) => {
  const { recette } = request.params;

  const result = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Tu es un chef cuisinier et ton but est de récupérer des détails sur une recette. Chaque fois qu'un utilisateur te donne un nom de recette, tu renverras un objet JSON et uniquement un objet JSON, pas de bonjour ni rien du tout d'autre que du JSON qui contiendra les propriété suivantes que tu rempliras en fonction de la recette donnée : duration, ingredients, instructions, servings. Ces valeurs doivent être des chaînes de caractères en français (seules les clés doivent être en anglais)."
      },
      {
        role: "system",
        content: recette,
      },
    ],
  });

  response.json({
    output: JSON.parse(result.choices[0].message.content || "{}"),
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});