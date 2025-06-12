import { IsString } from "class-validator";

export class CreateObservationDto {
  @IsString()
  testPerformedId: string;

  @IsString()
  analysis: string;

}
