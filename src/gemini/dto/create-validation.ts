import { IsString } from "class-validator";

export class CreateValidationDto {
  @IsString()
  sessionId: string;

  @IsString()
  studentName: string;
  
  @IsString()
  templateTestName: string;

  @IsString()
  content: string;

}