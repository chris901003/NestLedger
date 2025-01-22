/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/01/22.
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
        const dbUrl = process.env.MONGODB_URL
        await mongoose.connect(dbUrl)
        console.log('Database connected')
    } catch (error) {
        console.error('Database connection failed')
        console.error(error)
    }
}

connectDB()

export { mongoose }