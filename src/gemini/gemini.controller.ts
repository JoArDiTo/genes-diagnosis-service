import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GeminiService } from './gemini.service';
import { CreateGeminiDto } from './dto/create-gemini.dto';
import { CreateValidationDto } from './dto/create-validation';

@Controller()
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @MessagePattern({ cmd: 'diagnosis.generate.gemini' })
  create(@Payload() createGeminiDto: CreateGeminiDto) {
    return this.geminiService.create(createGeminiDto);
  }

  @MessagePattern({ cmd: 'diagnosis.generate.gemini.validation' })
  validate(@Payload() createValidationDto: CreateValidationDto) {
    return this.geminiService.getContentValidation(createValidationDto);
  }
}
