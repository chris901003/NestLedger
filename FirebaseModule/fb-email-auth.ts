/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/02/17.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import admin from './fb-admin'
import { fbAuth } from './fb-app'
import { signInWithEmailAndPassword } from 'firebase/auth'
import FBAuthManager from './fb-auth'

class FBEmailAuth {
    async register(email: string, password: string): Promise<boolean> {
        try {
            await admin.auth().createUser({
                email, password
            })
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async loginUser(email: string, password: string): Promise<string> {
        try {
            const userCredential = await signInWithEmailAndPassword(fbAuth, email, password)
            return userCredential.user.getIdToken()
        } catch (error) {
            console.error(error)
            return ''
        }
    }
}

testFunction()
async function testFunction() {
    const fbEmailAuth = new FBEmailAuth()
    const token = await fbEmailAuth.loginUser('test@test.com', '123456')
    console.log("Token: ", token)

    const fbAuthManager = new FBAuthManager()
    const result = await fbAuthManager.verifyTokenAndGetUid(token)
    console.log("Result: ", result)
}