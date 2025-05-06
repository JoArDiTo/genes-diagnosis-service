import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateObservationDto } from './dto/create-observation.dto';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class ObservationService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  create(createObservationDto: CreateObservationDto) {
    return this.observation.create({ data: { ...createObservationDto } })
  }

  findAll(testPerformedId: string) {
    return this.observation.findMany({ where: { testPerformedId: testPerformedId } });
  }
}
