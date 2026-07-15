import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ObservationService } from './observation.service';
import { CreateObservationDto } from './dto/create-observation.dto';

@Controller()
export class ObservationController {
  constructor(private readonly observationService: ObservationService) {}

  // Versión original TCP
  @MessagePattern({ cmd: 'diagnosis.create.observation' })
  create(@Payload() createObservationDto: CreateObservationDto) {
    return this.observationService.create(createObservationDto);
  }

  // Nueva versión HTTP para Render
  @Post('diagnosis/:testPerformedId')
  createHttp(
    @Param('testPerformedId') testPerformedId: string,
    @Body() body: { analysis: string },
  ) {
    return this.observationService.create({
      testPerformedId,
      analysis: body.analysis,
    });
  }

  // Versión original TCP
  @MessagePattern({ cmd: 'diagnosis.all.observation' })
  findAll(@Payload() testId: string) {
    return this.observationService.findAll(testId);
  }

  // Nueva versión HTTP para Render
  @Get('diagnosis/:testPerformedId')
  findAllHttp(@Param('testPerformedId') testPerformedId: string) {
    return this.observationService.findAll(testPerformedId);
  }
}
