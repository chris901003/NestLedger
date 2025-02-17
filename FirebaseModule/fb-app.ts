/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/02/17.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import dotenv from 'dotenv'

dotenv.config()

const firebaseConfig = {
    apiKey: process.env.FBC_API_KEY,
    authDomain: process.env.FBC_AUTH_DOMAIN,
    projectId: process.env.FBC_PROJECT_ID,
    storageBucket: process.env.FBC_STORAGE_BUCKET,
    messagingSenderId: process.env.FBC_MESSAGING_SENDER_ID,
    appId: process.env.FBC_APP_ID
}

const fbApp = initializeApp(firebaseConfig)
const fbAuth = getAuth(fbApp)

export { fbApp, fbAuth }