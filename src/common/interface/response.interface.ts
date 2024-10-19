export interface ResponseDto {
    statusCode: number;
    message: string;
    data?: any;
    error?: string;
}