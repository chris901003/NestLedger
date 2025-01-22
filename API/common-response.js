/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/01/22.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

function successResponse(data) {
    return {
        'success': true,
        'message': 'Success',
        'data': data
    }
}

function failedResponse(message) {
    return {
        'success': false,
        'message': message,
        'data': {}
    }
}

export { successResponse, failedResponse }