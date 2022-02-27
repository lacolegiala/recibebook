import express from "express";
const app = express();
const port = process.env.PORT || 3000;
import { createPool, sql } from "slonik";
import * as dotenv from "dotenv";
import { body, validationResult } from "express-validator";

dotenv.config();

app.use(express.json());

let connectionString: string;
if (process.env.DATABASE_URL) {
  connectionString = process.env.DATABASE_URL.concat('?ssl=1');
} else {
  throw new Error("Connection string environment variable is not set");
}

const pool = createPool(connectionString);

app.get("/", (req, res) => {
  res.send("Welcome to your virtual recipe book!");
});

app.get("/recipes", async (req, res) => {
  const allRecipes = await pool.connect((connection) =>
    connection.many(sql`SELECT * FROM recipe`)
  );
  res.send(allRecipes);
});

app.get("/ingredients", async (req, res) => {
  const allIngredients = await pool.connect((connection) =>
    connection.many(sql`SELECT * FROM ingredient`)
  );
  res.send(allIngredients);
});

app.get("/meals", async (req, res) => {
  const allMeals = await pool.connect((connection) =>
    connection.many(sql`SELECT * FROM meal`)
  );
  res.send(allMeals);
});

app.get("/ingredients/:id", async (req, res) => {
  const id = req.params.id;
  const getIngredient = await pool.connect((connection) =>
    connection.many(sql`
      SELECT * FROM ingredient WHERE id=${id}
    `)
  );
  res.send(getIngredient);
});

app.get("/recipes/:id", async (req, res) => {
  const id = req.params.id;
  let recipe
  try {
    recipe = await pool.connect((connection) =>
      connection.one(sql`
        SELECT * FROM recipe WHERE id=${id}
      `)
    )
  } catch {
    return res.status(404).json('Recipe id not found')
  }
  const ingredients = await pool.connect((connection) =>
    connection.query(sql`
      SELECT ingredient.name, recipeingredient.amount, recipeingredient.unit
      FROM recipe
      JOIN recipeingredient
      ON recipe.id=recipeingredient.recipeid
      JOIN ingredient
      ON recipeingredient.ingredientid=ingredient.id
      WHERE recipe.id=${id};
    `)
  );
  const meals = await pool.connect((connection) =>
    connection.query(sql`
      SELECT meal.name
      FROM recipe
      JOIN recipemeal
      ON recipe.id=recipemeal.recipeid
      JOIN meal
      ON recipemeal.mealid=meal.id
      WHERE recipe.id=${id}
    `)
  )
  const recipeWithDetails = {recipe: recipe, ingredients: ingredients.rows, meals: meals.rows}
  res.send(recipeWithDetails);
});

app.post(
  "/recipes",
  body("name").isString(),
  body("method").optional().isString(),
  body("servings").optional().isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const recipe: { name: string; method?: string; servings?: number } =
      req.body;
    const addRecipe = await pool.connect((connection) =>
      connection.query(sql`
        INSERT INTO recipe (name, method, servings)
        VALUES (${recipe.name}, ${recipe.method ?? null}, ${
        recipe.servings ?? null
      })
      `)
    );
    res.send(addRecipe);
  }
);

app.post(
  "/ingredients",
  body("name").isString(),
  body("foodGroup").optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ingredient: { name: string; foodGroup?: string } = req.body;
    const addIngredient = await pool.connect((connection) =>
      connection.query(sql`
        INSERT INTO ingredient (name, foodGroup)
        VALUES (${ingredient.name}, ${ingredient.foodGroup ?? null})
      `)
    );
    res.send(addIngredient);
  }
);

app.post("/meals", body("name").isString(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const meal: { name: string } = req.body;
  const addMeal = await pool.connect((connection) =>
    connection.query(sql`
      INSERT INTO meal (name)
      VALUES (${meal.name})
    `)
  );
  res.send(addMeal);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
