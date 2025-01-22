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

async function testConnectDB() {
    const dbUrl = process.env.MONGODB_URL
    console.log(dbUrl)
    try {
        await mongoose.connect(dbUrl)
        console.log('Database connected successfully')
        mongoose.connection.close()
        console.log('Database connection closed successfully')
    } catch (error) {
        console.error('Database connection failed')
        console.error(error)
    }
}

dotenv.config()
testConnectDB()
