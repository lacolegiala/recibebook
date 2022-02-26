import express from "express";
const app = express();
const port = 3000;
import { createPool, sql } from "slonik";
import * as dotenv from "dotenv";
import { body, validationResult } from "express-validator";

dotenv.config();

app.use(express.json());

let connectionString: string;
if (process.env.PG_CONNECTION_STRING) {
  connectionString = process.env.PG_CONNECTION_STRING;
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

app.get("/recipes/:id", async (req, res) => {
  const id = req.params.id;
  const getRecipe = await pool.connect((connection) =>
    connection.many(sql`
      SELECT * FROM recipe WHERE id=${id}
    `)
  );
  res.send(getRecipe);
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

app.get("/meals/:id", async (req, res) => {
  const id = req.params.id;
  const getMeal = await pool.connect((connection) =>
    connection.many(sql`
      SELECT * FROM meal WHERE id=${id}
    `)
  );
  res.send(getMeal);
});

app.get("/recipes/:id/details", async (req, res) => {
  const id = req.params.id;
  const getDetails = await pool.connect((connection) =>
    connection.many(sql`
      SELECT ingredient.name FROM ingredient
      JOIN recipeingredient ON recipeingredient.ingredientid = ingredient.id
      JOIN recipe ON recipe.id = recipeingredient.recipeid
      WHERE recipe.id=${id};
    `)
  );
  res.send(getDetails);
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
    console.log("nak", recipe);
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
