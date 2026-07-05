// server/src/shared/utils/ApiResponse.js
export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static ok(data, message = 'Success') {
    return new ApiResponse(200, data, message);
  }

  static created(data, message = 'Created') {
    return new ApiResponse(201, data, message);
  }

  static noContent(message = 'Success') {
    return new ApiResponse(204, null, message);
  }
}