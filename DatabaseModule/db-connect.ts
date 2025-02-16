/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/02/16.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import mongoose from 'mongoose'
import dotenv from 'dotenv'

const connectDB = async () => {
    dotenv.config()
    try {
        const dbURL = process.env.MONGODB_URL as string
        await mongoose.connect(dbURL)
        console.log('MongoDB connected')
    } catch (error) {
        console.log('Database connection failed')
        console.log(error)
    }
}

connectDB()

export default mongoose