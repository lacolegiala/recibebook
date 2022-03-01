import * as dotenv from "dotenv";
import { createPool, sql } from "slonik";
import { Ingredient, Meal, Recipe } from "./types";

dotenv.config();

let connectionString: string;
if (process.env.PG_CONNECTION_STRING) {
  connectionString = process.env.PG_CONNECTION_STRING;
} else {
  throw new Error("Connection string environment variable is not set");
}

const pool = createPool(connectionString);

export const getAllRecipes = () =>
  pool.connect((connection) => connection.many(sql`SELECT * FROM recipe`));

export const getAllIngredients = () =>
  pool.connect((connection) => connection.many(sql`SELECT * FROM ingredient`));

export const getAllMeals = () =>
  pool.connect((connection) => connection.many(sql`SELECT * FROM meal`));

export const getIngredientWithId = (id: string) =>
  pool.connect((connection) =>
    connection.many(sql`
      SELECT * FROM ingredient WHERE id=${id}
    `)
  );

export const getRecipeWithId = (id: string) =>
  pool.connect((connection) =>
    connection.one(sql`
      SELECT * FROM recipe WHERE id=${id}
    `)
  );

export const getRecipeIngredients = (id: string) =>
  pool.connect((connection) =>
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

export const getRecipeMeals = (id: string) =>
  pool.connect((connection) =>
    connection.query(sql`
      SELECT meal.name
      FROM recipe
      JOIN recipemeal
      ON recipe.id=recipemeal.recipeid
      JOIN meal
      ON recipemeal.mealid=meal.id
      WHERE recipe.id=${id}
    `)
  );

export const createRecipe = (recipe: Recipe) =>
  pool.connect((connection) =>
    connection.query(sql`
      INSERT INTO recipe (name, method, servings)
      VALUES (${recipe.name}, ${recipe.method ?? null}, ${
      recipe.servings ?? null
    })
    `)
  );

export const createIngredient = (ingredient: Ingredient) =>
  pool.connect((connection) =>
    connection.query(sql`
      INSERT INTO ingredient (name, foodGroup)
      VALUES (${ingredient.name}, ${ingredient.foodGroup ?? null})
    `)
  );

export const createMeal = (meal: Meal) =>
  pool.connect((connection) =>
    connection.query(sql`
      INSERT INTO meal (name)
      VALUES (${meal.name})
    `)
  );
