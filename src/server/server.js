const express = require("express")
const generatePoints = require("./lib/generate")
const clusteringPoint = require("./lib/clustering")
const { host, port } = require("./config/config")

const app = express()

app.use(express.json({ limit: "50mb" }))

// TODO Make validation of query params

app.get("/generate", (req, res) => {
    const { width, height, radius, quantity } = req.query
    let result = generatePoints(width, height, radius, quantity)
    res.json(result)
})

app.post("/clustering", (req, res) => {
    let { points, centersGravity } = req.body
    let result = clusteringPoint(points, centersGravity)

    res.json(result) // res.json(result.reverse().slice(0, 1))
})

app.listen(port, () => console.info(`Server started on ${host}:${port}`))
