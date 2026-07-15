import { Body, Controller, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GeminiService } from './gemini.service';
import { CreateGeminiDto } from './dto/create-gemini.dto';
import { CreateValidationDto } from './dto/create-validation';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  // Versión original TCP
  @MessagePattern({ cmd: 'diagnosis.generate.gemini' })
  create(@Payload() createGeminiDto: CreateGeminiDto) {
    return this.geminiService.create(createGeminiDto);
  }

  // Nueva versión HTTP para Render
  @Post('generate')
  createHttp(@Body() createGeminiDto: CreateGeminiDto) {
    return this.geminiService.create(createGeminiDto);
  }

  // Versión original TCP
  @MessagePattern({ cmd: 'diagnosis.generate.gemini.validation' })
  validate(@Payload() createValidationDto: CreateValidationDto) {
    return this.geminiService.getContentValidation(createValidationDto);
  }

  // Nueva versión HTTP para Render
  @Post('validate')
  validateHttp(@Body() createValidationDto: CreateValidationDto) {
    return this.geminiService.getContentValidation(createValidationDto);
  }
}
