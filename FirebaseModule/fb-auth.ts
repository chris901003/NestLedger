/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/02/17.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import { FirebaseAuthError } from 'firebase-admin/lib/utils/error'
import admin from './fb-admin'

enum FBAuthErrorType {
    TOKEN_EXPIRED = 'Token expired',
    TOKEN_REVOKED = 'Token revoked',
    TOKEN_UNAUTHORIZED = 'Token unauthorized'
}

class FBAuthVerifyResult {
    constructor(
        public isSuccess: boolean, 
        public uid: string, 
        public errorType?: FBAuthErrorType
    ) { }
}

class FBAuthManager {
    async verifyTokenAndGetUid(token: string) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token)
            return new FBAuthVerifyResult(true, decodedToken.uid)
        } catch (error: FirebaseAuthError | any) {
            switch (error.code) {
                case 'auth/id-token-expired':
                    return new FBAuthVerifyResult(false, '', FBAuthErrorType.TOKEN_EXPIRED)
                case 'auth/id-token-revoked':
                    return new FBAuthVerifyResult(false, '', FBAuthErrorType.TOKEN_REVOKED)
                default:
                    return new FBAuthVerifyResult(false, '', FBAuthErrorType.TOKEN_UNAUTHORIZED)
            }
        }
    }
}

export default FBAuthManager
