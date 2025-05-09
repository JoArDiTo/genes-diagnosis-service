import { Module } from '@nestjs/common';
import { ObservationModule } from './observation/observation.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [ObservationModule, GeminiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
