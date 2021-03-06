const {oneLine} = require('common-tags')

const express = require('express')
const app = express()
const port = 80

const morgan = require('morgan')

const {knex, seed} = require('./db')
const auth = require('./auth')
const {channels} = require('./channels')

const runApp = () => {
  app.use(express.json({
    strict: true,
  }))
  app.use(morgan('combined'))

  app.get('/', (req, res) => res.send('Hello World!'))
  app.post('/auth', async (req, res) => {
    if (!req.body) return res.sendStatus(400)
    const {username, password} = req.body
    if (!username) return res.sendStatus(400)
    if (!password) return res.sendStatus(400)

    const match = await knex.table('users')
      .whereRaw(oneLine(`
        username = '${username}'
        AND password = '${password}'
      `))
      .count('*')
      .then(([r]) => r.count > 0)
    if (!match) return res.sendStatus(401)

    const token = auth.createToken()
    res.send({token})
  })
  app.get('/channels', (req, res) => {
    const authHeader = req.header('Authorization')
    if (!authHeader) return res.sendStatus(401)
    const match = authHeader.match(new RegExp('^Bearer (.*)$'))
    if (!match) return res.sendStatus(400)
    const token = match[1]
    if (!auth.verify(token)) return res.sendStatus(401)

    res.send({channels})
  })

  app.listen(port, () => {
    console.log(`App listening on port ${port}!`)
  })
}

exports.start = async () => {
  await knex.migrate.latest()
  await seed()
  runApp()
}
