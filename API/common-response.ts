/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/02/17.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

interface CommonResponse {
    success: boolean,
    message: string,
    data: any
}

function successResponse(data: any): CommonResponse {
    return {
        'success': true,
        'message': 'Success',
        'data': data
    }
}

function failedResponse(message: string): CommonResponse {
    return {
        'success': false,
        'message': message,
        'data': {}
    }
}

export { successResponse, failedResponse }