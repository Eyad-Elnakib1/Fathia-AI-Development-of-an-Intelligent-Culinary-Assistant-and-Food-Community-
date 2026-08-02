const express = require('express');
const axios = require('axios');

const router = express.Router();

// Fallback generator if network/service is offline
const getSmartFallbackResponse = (userPrompt) => {
  const p = userPrompt.toLowerCase();
  
  // Refuse non-food questions
  const nonFoodTerms = ['llm', 'coding', 'programming', 'software', 'math', 'calculator', 'politics', 'sports', 'game', 'history', 'physics', 'ai model', 'gpt'];
  if (nonFoodTerms.some(term => p.includes(term))) {
    return "Ahlan! 👩‍🍳 I am Fathia, a dedicated kitchen chef! I only talk about food, cooking, and delicious recipes! Please ask me about ingredients or what dish you would like to cook today! 🍳";
  }

  if (p.includes('who created') || p.includes('team') || p.includes('creator') || p.includes('made') || p.includes('who built') || p.includes('alamein')) {
    return "Fridge Fusion was created by a talented team of Computer Science and Engineering students at Alamein International University: Veronica Massim, Sousannah Magdy, Rodaina Mohamed, Farah Mohamed, Eyad Elnakib, and Mazen Samir, supervised by Dr. Ali Mohamed AbdelAziz! 🎓✨";
  }
  if (p.includes('what is fridge fusion') || p.includes('about') || p.includes('app') || p.includes('fridge fusion')) {
    return "Fridge Fusion is your ultimate smart kitchen assistant! It helps you create delicious recipes from whatever ingredients you have left in your fridge, reducing food waste and making cooking fun and easy! 🍳🥗";
  }
  if (p.includes('hi') || p.includes('hello') || p.includes('welcome') || p.includes('fathia') || p.includes('fat7eia') || p.includes('hey')) {
    return "Ahlan wa sahlan! 👋 I'm Fathia, your smart Fridge Fusion chef assistant! Tell me what ingredients you have in your fridge, and I'll give you specific, step-by-step cooking instructions!";
  }

  return `Ahlan! Fatheia is here to help you cook! 🍳 

Here are specific cooking instructions for "${userPrompt}":

1. **Prep Ingredients**: Wash and chop your ingredients (${userPrompt}).
2. **Saute & Aromatics**: Heat 2 tbsp olive oil in a pan over medium heat. Add 2 minced garlic cloves and 1 diced onion, sauteing until golden.
3. **Cook Main Ingredients**: Add your ingredients (${userPrompt}) into the pan. Season with 1 tsp salt, 1/2 tsp black pepper, and herbs.
4. **Simmer & Serve**: Cook for 10-15 minutes over medium-low heat until tender and fully infused with flavor. Serve hot and enjoy! 😋`;
};

router.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const groqApiKey = process.env.GROQ_API_KEY;

  const systemInstructions = `You are Fathia, an expert, enthusiastic Egyptian culinary chef for Fridge Fusion.

STRICT DOMAIN BOUNDARY & SAFETY RULE:
- You ONLY answer questions directly related to food, cooking, recipes, ingredients, kitchen tips, and the Fridge Fusion app/creators.
- IF THE USER ASKS ABOUT ANY NON-FOOD TOPIC (such as LLMs, AI theory, programming, math, science, politics, sports, history, general technology, etc.):
  YOU MUST STRICTLY REFUSE TO ANSWER THE NON-FOOD TOPIC AND RESPOND:
  "Ahlan! 👩‍🍳 I am Fathia, a kitchen chef! I ONLY talk about food, cooking, and recipes! Please tell me what ingredients you have in your fridge or what dish you'd like to cook today! 🍳"
- NEVER explain or discuss non-food concepts (e.g. do not explain what LLMs are or how tech works).
- When food topics or ingredients are provided, give clear, specific, numbered STEP-BY-STEP cooking instructions with exact preparation steps, heat levels, and cooking times as Fathia.`;

  try {
    // Call Groq API with ultra-fast Llama-3.3-70b
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemInstructions
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 12000
      }
    );

    const aiResponse = response.data.choices[0]?.message?.content || 'No response generated.';
    return res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error calling Groq API (70b):', error.response?.data || error.message);

    // Fallback attempt with llama-3.1-8b-instant
    try {
      const responseFallback = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: systemInstructions
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 8000
        }
      );

      const aiResponse = responseFallback.data.choices[0]?.message?.content;
      if (aiResponse) return res.json({ response: aiResponse });
    } catch (fallbackErr) {
      console.error('Groq fallback model error:', fallbackErr.message);
    }

    const fallbackResponse = getSmartFallbackResponse(prompt);
    return res.json({ response: fallbackResponse });
  }
});

module.exports = router;