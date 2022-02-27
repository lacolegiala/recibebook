import express from "express";
const app = express();
const port = process.env.PORT || 3000;
import { body, validationResult } from "express-validator";
import {
  createIngredient,
  createMeal,
  createRecipe,
  getAllIngredients,
  getAllMeals,
  getAllRecipes,
  getIngredientWithId,
  getRecipeIngredients,
  getRecipeMeals,
  getRecipeWithId,
} from "./database";
import { Ingredient, Meal, Recipe } from "./types";

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to your virtual recipe book!");
});

app.get("/recipes", async (req, res) => {
  const allRecipes = await getAllRecipes();
  res.send(allRecipes);
});

app.get("/ingredients", async (req, res) => {
  const allIngredients = await getAllIngredients();
  res.send(allIngredients);
});

app.get("/meals", async (req, res) => {
  const allMeals = await getAllMeals();
  res.send(allMeals);
});

app.get("/ingredients/:id", async (req, res) => {
  const id = req.params.id;
  const getIngredient = await getIngredientWithId(id);
  res.send(getIngredient);
});

app.get("/recipes/:id", async (req, res) => {
  const id = req.params.id;
  let recipe;
  try {
    recipe = await getRecipeWithId(id);
  } catch {
    return res.status(404).json("Recipe id not found");
  }
  const ingredients = await getRecipeIngredients(id);
  const meals = await getRecipeMeals(id);
  const recipeWithDetails = {
    recipe: recipe,
    ingredients: ingredients.rows,
    meals: meals.rows,
  };
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
    const recipe: Recipe = req.body;
    const addRecipe = await createRecipe(recipe);
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
    const ingredient: Ingredient = req.body;
    const addIngredient = await createIngredient(ingredient);
    res.send(addIngredient);
  }
);

app.post("/meals", body("name").isString(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const meal: Meal = req.body;
  const addMeal = await createMeal(meal);
  res.send(addMeal);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
