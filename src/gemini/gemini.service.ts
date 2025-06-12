import { Injectable } from '@nestjs/common';
import { CreateGeminiDto } from './dto/create-gemini.dto';
import { ChatSession, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { envs } from 'src/config/envs';
import { RpcException } from '@nestjs/microservices';
import { CreateValidationDto } from './dto/create-validation';

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
      
      const prompt = 
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
          - observaciones: Contenido en párrafos..."\n
        El formato de respuesta debe tener exclusivamente el punto de observaciones, tal y como está escrito en párrafos de esta forma: \n 
          (Ejemplo: \n 
            - observaciones: [Fortalezas y Debilidades identificadas, áreas de oportunidad, estrategias accionables para el docente, y sugerencias de seguimiento] \n
          ) \n
        Puedes considerar usar verbos en infinitivo para recomendaciones e incluir referencias a protocolos del Ministerio de educación del Perú cuando aplique.
      `;
      
      const result = await chat.sendMessage(prompt);
      const text = result.response.text();
      
      // Procesar el texto para extraer observaciones y recomendaciones
      const observationsMatch = text.match(/- observaciones:\s*([\s\S]*)/);

      const observations = observationsMatch ? observationsMatch[1].trim() : 'No se encontraron observaciones.';

      return {
        sessionId,
        observations,
      };
    } catch (error) {
      throw new RpcException({
        status: 500,
        message: 'Error al generar el diagnóstico',
      })
    }
  }

  async getContentValidation(createValidationDto: CreateValidationDto) {
    const { sessionId, chat } = await this.getChatSession(createValidationDto.sessionId ?? '');

    const { studentName, templateTestName, content } = createValidationDto;
    // Con el sesiónId, continua la conversación con el modelo
    const prompt = 
    `
      Continuamos la asesoría en el Colegio GENES, enfocados en la salud mental y el desarrollo personal de estudiantes de secundaria. Esta sesión corresponde a la revisión y validación del análisis preliminar generado previamente, utilizando la siguiente información de contexto: \n
        - Nombre del estudiante: ${studentName} \n
        - Test realizado: ${templateTestName} \n
      A continuación, el docente especialista ha proporcionado su análisis desde el sistema con el siguiente contenido: \n
      ${content} \n
      Tu función es: \n
        1. Validar la coherencia entre el análisis inicial que realizaste y las observaciones del docente. \n
        2. Identificar coincidencias, diferencias o aportes relevantes en la retroalimentación del docente. \n
        3. Proponer ajustes o recomendaciones adicionales si se detectan oportunidades de mejora en el análisis o en la intervención sugerida. \n
      El formato de tu respuesta debe tener exclusivamente el siguiente punto: \n
        - validacion: [Síntesis de coincidencias y diferencias entre el análisis inicial y los comentarios del docente, Sugerencias de ajuste o profundización en la retroalimentación, si corresponde, en caso de estar correcto y sintetizado, puedes indicar que no hay mejoras.] \n
      Un ejemplo de respuesta sería: \n
       - validacion: Se encontraron coincidencias en las áreas de oportunidad identificadas en el análisis inicial y los comentarios del docente.

    Utiliza un lenguaje empático, orientado al desarrollo personal y evita terminología clínica. Si es pertinente, menciona protocolos del Ministerio de Educación del Perú. Responde únicamente en el formato solicitado.
    `

    const result = await chat.sendMessage(prompt);
    const text = result.response.text();

    // Expresion regular para extraer la validación
    const validationMatch = text.match(/- validaci[oó]n:\s*([\s\S]*)/i);
    const validation = validationMatch ? validationMatch[1].trim() : 'No se encontró validación.';

    return {
      sessionId,
      validation,
    };
  }
}
