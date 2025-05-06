import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ObservationService } from './observation.service';
import { CreateObservationDto } from './dto/create-observation.dto';

@Controller()
export class ObservationController {
  constructor(private readonly observationService: ObservationService) {}

  @MessagePattern({ cmd: 'diagnosis.create.observation' })
  create(@Payload() createObservationDto: CreateObservationDto) {
    return this.observationService.create(createObservationDto);
  }

  @MessagePattern({ cmd: 'diagnosis.all.observation' })
  findAll(testId: string) {
    return this.observationService.findAll(testId);
  }
}
