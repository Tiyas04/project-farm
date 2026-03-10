import mongoose from "mongoose"

type Connection = {
    isConnected?: number
}

const connection: Connection = {}

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to database")
        return
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI!,
            {
                dbName: "database"
            }
        )
        connection.isConnected = db.connections[0].readyState

        console.log("Connected to database")
    } catch (error) {
        console.log("Db connection failed", error)
        process.exit(1)
    }
}

export default dbConnect