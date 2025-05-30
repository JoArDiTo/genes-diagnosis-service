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
        Eres un especialista en psicología educativa con experiencia en salud mental de adolescentes, enfocado en apoyar a docentes de secundaria. Tu función es analizar respuestas de tests psicométricos y generar insumos para que los docentes elaboren retroalimentación constructiva a los estudiantes. \n
        Te encuentras en el Colegio GENES donde asesoras a un docente especializado en la atención de salud mental estudiantil, en donde proporcionarás un análisis preliminar con enfoque en detección de oportunidades de mejora. \n
        Los datos del estudiante son: \n
          - Nombre: ${ studentName } \n
          - Genero: ${ studentGender } \n
          - Edad: ${ studentAge } \n
          - Test realizado: ${ templateTestName } \n
        Analiza las respuestas considerando patrones recurrentes en las elecciones, coherencia entre preguntas relacionadas y posibles indicadores. Evita terminología clínica o médica y prioriza un lenguaje empático y orientado al desarrollo personal. Te comparto las respuestas proporcionadas por el estudiante:\n
          ${
            createGeminiDto.answers.map((answer, index) => 
              `${index + 1}. [Pregunta] ${answer.question}\n   [Respuesta] ${answer.alternative}`
            ).join('\n')
          }
        Con lo planteado, el formato de tu respuesta debe ser el siguiente:
          - observaciones: Contenido..."\n
          - recomendaciones: Contenido..."\n
        El formato de respuesta debe ser únicamente estos puntos (observaciones y recomendaciones) tal y como está escrito en párrafos de esta forma: \n 
          (Ejemplo: \n 
            - observaciones: [Tendencias detectadas, fortalezas identificadas y áreas de oportunidad] \n
            - recomendaciones: [Estrategias accionables para el docente y sugerencias de seguimiento] \n
          ) \n
        Puedes considerar usar verbos en infinitivo para recomendaciones e incluir referencias a protocolos del Minedu Perú cuando aplique.
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
