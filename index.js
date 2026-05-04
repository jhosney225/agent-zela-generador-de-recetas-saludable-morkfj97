import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function generateHealthyRecipe() {
  console.log("\n🍎 Generador de Recetas Saludables con Calorías 🍎\n");
  console.log("Bienvenido al generador de recetas saludables.");
  console.log(
    "Proporciona información sobre tus preferencias dietéticas.\n"
  );

  const dietary_restrictions = await prompt(
    "¿Tienes restricciones dietéticas? (ej: vegetariano, sin gluten, vegano, ninguna): "
  );
  const calorie_target = await prompt(
    "¿Cuántas calorías objetivo buscas? (ej: 500, 1000, 1500): "
  );
  const cuisine_preference = await prompt(
    "¿Qué tipo de cocina prefieres? (ej: italiana, mexicana, asiática, cualquiera): "
  );
  const ingredients_preference = await prompt(
    "¿Hay ingredientes que especialmente te gusten o quieras evitar?: "
  );
  const meal_type = await prompt(
    "¿Qué tipo de comida necesitas? (desayuno, almuerzo, cena, snack): "
  );

  const prompt_content = `Eres un chef nutricional experto. Genera una receta saludable basada en los siguientes criterios:

Restricciones dietéticas: ${dietary_restrictions}
Calorías objetivo: ${calorie_target} calorías
Tipo de cocina: ${cuisine_preference}
Preferencias de ingredientes: ${ingredients_preference}
Tipo de comida: ${meal_type}

Por favor, proporciona:
1. Nombre de la receta
2. Ingredientes con cantidades (incluye calorías por ingrediente)
3. Pasos de preparación
4. Información nutricional completa (calorías totales, proteínas, carbohidratos, grasas, fibra)
5. Tiempo de preparación
6. Dificultad (fácil, media, difícil)
7. Consejos de salud específicos

Formato la respuesta de manera clara y estructurada.`;

  console.log("\n⏳ Generando tu receta personalizada...\n");

  const stream = client.messages.stream({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: prompt_content,
      },
    ],
  });

  stream.on("text", (text) => {
    process.stdout.write(text);
  });

  await stream.finalMessage();

  console.log("\n\n");

  const continue_session = await prompt(
    "¿Deseas generar otra receta? (sí/no): "
  );
  rl.close();

  if (continue_session.toLowerCase() === "sí" || continue_session.toLowerCase() === "si") {
    // Reiniciar para nueva receta
    const newRl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Reemplazo del readline original
    Object.assign(rl, newRl);
    rl.on = newRl.on.bind(newRl);
    rl.question = newRl.question.bind(newRl);

    await generateHealthyRecipe();
  } else {
    console.log(
      "\n¡Gracias por usar el generador de recetas saludables! ¡Buen provecho! 🥗\n"
    );
    process.exit(0);
  }
}

// Ejecutar la aplicación
generateHealthyRecipe().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});