import { Module } from '@nestjs/common';
import { ObservationModule } from './observation/observation.module';

@Module({
  imports: [ObservationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
