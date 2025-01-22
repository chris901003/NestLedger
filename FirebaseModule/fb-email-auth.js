/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/01/22.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
 * This file is just for testing and should be removed in the final version.
 * =============================================================================
*/

import { admin } from './fb-admin.js'
import { fbAuth } from './fb-app.js'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { FBAuthManager } from './fb-auth.js'

class FBEmailAuth {
    async registerUser(email, password) {
        try {
            await admin.auth().createUser({
                email: email,
                password: password
            })
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async loginUser(email, password) {
        try {
            return (await signInWithEmailAndPassword(fbAuth, email, password)).user.getIdToken()
        } catch (error) {
            console.error(error)
            return false
        }
    }
}

testFunction()
async function testFunction() {
    const fbAuthManager = new FBAuthManager()
    const fbEmailAuth = new FBEmailAuth()
    const loginResult = await fbEmailAuth.loginUser('test@test.com', '123456')
    const uid = await fbAuthManager.verifyTokenAndGetUID(loginResult)
    console.log(uid)
}