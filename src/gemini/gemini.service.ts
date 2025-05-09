import { Injectable } from '@nestjs/common';
import { CreateGeminiDto } from './dto/create-gemini.dto';
import { ChatSession, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { envs } from 'src/config/envs';
import { RpcException } from '@nestjs/microservices';

const GEMINI_MODEL = 'gemini-2.0-flash';

@Injectable()
export class GeminiService {
  private readonly googleAI: GoogleGenerativeAI
  private readonly model: GenerativeModel
  private chatSessions: { [sessionId: string]: ChatSession } = {}
  
  constructor(){
    const geminiApiKey = envs.geminiApiKey;
    this.googleAI = new GoogleGenerativeAI(geminiApiKey);
    this.model = this.googleAI.getGenerativeModel({ model: GEMINI_MODEL })
  }

  async getChatSession(sessionId?: string) {
    if(!sessionId) sessionId = Math.random().toString(36).substring(2, 15);
    
    let result = this.chatSessions[sessionId]

    if(!result) {
      result = this.model.startChat()
      this.chatSessions[sessionId] = result
    }

    return {
      sessionId: sessionId,
      chat: result
    }
  }

  async create(createGeminiDto: CreateGeminiDto) {
    const { templateTestName, studentName, studentGender, studentAge } = createGeminiDto;
    
    try {
      const { sessionId, chat } = await this.getChatSession(createGeminiDto.sessionId ?? '');
      
      const newPropmt = 
      `
        Eres un experto en medicina con más de 20 años de experiencia en el área de salud mental. Tu tarea es apoyar a un docente especializado en la atención de salud mental de los estudiantes del colegio GENES, tienes que analizar los resultados de un test de escala de salud mental realizado por un estudiante escolar.\n
        El nombre del estudiante es ${ studentName }, su género es ${ studentGender } y su edad es ${ studentAge }.\n
        A continuación, se presentan las preguntas del test ${ templateTestName } junto con las respuestas proporcionadas por el estudiante:\n
        ${
          createGeminiDto.answers.map((answer) => {
            return `Pregunta: ${answer.question} Respuesta: ${answer.alternative}`
          }).join('\n')
        }
        Con base en esto, necesito que elabores una evaluación preliminar y generes observaciones y recomendaciones basadas en las respuestas que marcó el escolar. El formato de respueta debe ser unicamente estos puntos (observaciones y recomendaciones) tal y como está escrito en párrafos de esta forma: \n
        - observaciones: [Contenido...]"\n
        - recomendaciones: [Contenido...]"\n
      `
      
      const result = await chat.sendMessage(newPropmt);
      const text = result.response.text();
      
      // Procesar el texto para extraer observaciones y recomendaciones
      const observationsMatch = text.match(/- observaciones:\s*(.+?)(?=- recomendaciones:)/s);
      const recommendationsMatch = text.match(/- recomendaciones:\s*(.+)/s);

      const observations = observationsMatch ? observationsMatch[1].trim() : 'No se encontraron observaciones.';
      const recommendations = recommendationsMatch ? recommendationsMatch[1].trim() : 'No se encontraron recomendaciones.';

      return {
        sessionId,
        observations,
        recommendations,
      };
    } catch (error) {
      throw new RpcException({
        status: 500,
        message: 'Error al generar el diagnóstico',
      })
    }
  }
}
