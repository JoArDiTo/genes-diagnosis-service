import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateGeminiDto {
  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  templateTestName: string;

  @IsString()
  studentName: string;

  @IsString()
  studentGender: string;

  @IsNumber()
  studentAge: number;
  
  @IsArray()
  answers: { question: string; alternative: string }[];
}
