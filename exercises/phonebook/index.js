import express from "express"
import process from "node:process"
import { config } from "dotenv"
import morgan from "morgan"
import cors from "cors"
import Phonebook from "./src/store/phonebook.js"
import { generateUUID } from "./src/util/generateUUID.js"
import { unknownEndpoint } from "./src/middleware/unknownEndpoint.js"
config({ path: "../../.env" })

const app = express()
app.use(cors())
app.use(express.json())
morgan.token("body", (request) => JSON.stringify(request.body))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))
app.use(express.static("dist"))

app.get("/api/contacts", (request, response) => {
  response.json(Phonebook.getPhonebook())
})

app.get("/api/contacts/:id", (request, response) => {
  const id = request.params.id
  const person = Phonebook.getPhonebook().find((person) => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.post("/api/contacts", (request, response) => {
  const body = request.body
  const nameExist = Phonebook.getPhonebook().find((person) => person.name === body.name)
  if (Object.entries(body).length > 0) {
    if (!body.number || !body.name) {
      return response.status(400).json({ error: "Name or number missing" })
    }
    if (nameExist) {
      return response.status(400).json({ error: "name must be unique" })
    }
    const newPerson = {
      id: generateUUID(),
      name: body.name,
      number: body.number,
    }
    const person = Phonebook.addPerson(newPerson)
    return response.status(200).json(person)
  } else {
    return response.status(400).json({ error: "Content missing" })
  }
})

app.delete("/api/contacts/:id", (request, response) => {
  const id = request.params.id
  const personToDelete = Phonebook.getPhonebook().find((person) => person.id === id)

  if (personToDelete) {
    const updatedPhonebook = Phonebook.deletePerson(personToDelete.id)
    console.log(updatedPhonebook)
    response.status(200).end()
  } else {
    response.status(404).end()
  }
})

app.get("/info", (request, response) => {
  response.send(`
  <p>Phonebook has info for ${Phonebook.getPhonebook().length} people</p>
  <p>${new Date().toString()}</p>`)
})

app.use(unknownEndpoint)
app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on port ${process.env.PORT}`)
  console.log(`url: http://localhost:${process.env.PORT}`)
})
