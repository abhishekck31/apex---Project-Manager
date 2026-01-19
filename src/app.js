import express from "express";
import cors from "cors"
import healthcheckRoutes from "./routes/healthcheck.routes.js";

const app = express()
//basic config
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(express.static('public'))

//cors config
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}),
);

app.get('/payment', (req, res) => {
    res.send("Payment Has been Initiated ! An Amount of 2,34,565 will be debited from your account.")
})

//import the routes
app.use("/api/healthcheck", healthcheckRoutes)

export default app