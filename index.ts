import express from 'express'
const app = express()
const port = 3000
import {
  createPool, sql,
} from 'slonik';
import * as dotenv from "dotenv";

dotenv.config()

let connectionString: string
if (process.env.PG_CONNECTION_STRING) {
  connectionString = process.env.PG_CONNECTION_STRING
} else {
  throw new Error('Connection string environment variable is not set')
}

const pool = createPool(process.env.PG_CONNECTION_STRING)

const allRecipes = pool.connect(async (connection) => {
  return await connection.many(sql`SELECT * FROM recipe`)
});

const allIngredients = pool.connect(async (connection) => {
  return await connection.many(sql`SELECT * FROM ingredient`)
})

const allMeals = pool.connect(async (connection) => {
  return await connection.many(sql`SELECT * FROM meal`)
})

app.get('/', (req, res) => {
  res.send('Welcome to your virtual recipe book!')
})

app.get('/recipes', async (req, res) => {
  const recipes = await allRecipes
  res.send(recipes)
})

app.get('/ingredients', async (req, res) => {
  const ingredients = await allIngredients
  res.send(ingredients)
})

app.get('/meals', async (req, res) => {
  const meals = await allMeals
  res.send(meals)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})