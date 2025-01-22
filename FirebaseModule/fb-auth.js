/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/01/22.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import { admin } from './fb-admin.js'

class FBAuthVerifyResult {
    constructor(isSuccess, uid, errorType) {
        this.isSuccess = isSuccess
        this.uid = uid
        this.errorType = errorType
    }
}

FBAuthVerifyResult.ERROR_TYPE = {
    TOKEN_EXPIRED: 'Token expired',
    TOKEN_REVOKED: 'Token revoked',
    TOKEN_UNAUTHORIZED: 'Token unauthorized'
}

class FBAuthManager {
    async verifyTokenAndGetUID(token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token)
            return new FBAuthVerifyResult(true, decodedToken.uid, null)
        } catch (error) {
            switch (error.code) {
                case 'auth/id-token-expired':
                    return new FBAuthVerifyResult(false, null, FBAuthVerifyResult.ERROR_TYPE.TOKEN_EXPIRED)
                case 'auth/id-token-revoked':
                    return new FBAuthVerifyResult(false, null, FBAuthVerifyResult.ERROR_TYPE.TOKEN_REVOKED)
                default:
                    return new FBAuthVerifyResult(false, null, FBAuthVerifyResult.ERROR_TYPE.TOKEN_UNAUTHORIZED)
            }
        }
    }
}

export { FBAuthManager }