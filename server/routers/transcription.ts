import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { transcribeAudio } from '../_core/voiceTranscription';
import { invokeLLM } from '../_core/llm';
import { storagePut } from '../storage';
import { nanoid } from 'nanoid';
import type { TRPCError } from '@trpc/server';

export const transcriptionRouter = router({
  transcribeAudio: publicProcedure
    .input(
      z.object({
        audioUrl: z.string().url(),
        language: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await transcribeAudio({
          audioUrl: input.audioUrl,
          language: input.language,
        });

        if ('error' in result) {
          throw new Error(result.error);
        }

        return {
          success: true,
          text: result.text,
          language: result.language || 'unknown',
          segments: result.segments || [],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Transcription failed';
        throw new Error(`Transcription error: ${message}`);
      }
    }),

  enrichTranscription: publicProcedure
    .input(
      z.object({
        text: z.string(),
        mode: z.enum(['summary', 'structure', 'format', 'context']),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const prompts = {
          summary: `Erstelle eine prägnante Zusammenfassung des folgenden Textes in 2-3 Sätzen:\n\n${input.text}`,
          structure: `Strukturiere den folgenden Text mit Überschriften und Aufzählungspunkten:\n\n${input.text}`,
          format: `Formatiere den folgenden Text als strukturierte Notiz mit klaren Abschnitten:\n\n${input.text}`,
          context: `Analysiere den folgenden Text im Kontext von: ${input.context}\n\nText:\n${input.text}`,
        };

        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'Du bist ein hilfreicher Assistent, der Transkripte intelligent aufbereitet.',
            },
            {
              role: 'user',
              content: prompts[input.mode],
            },
          ],
        });

        const enrichedText =
          response.choices[0]?.message.content || 'Enrichment failed';

        return {
          success: true,
          enrichedText,
          mode: input.mode,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Enrichment failed';
        throw new Error(`Enrichment error: ${message}`);
      }
    }),

  uploadAudio: publicProcedure
    .input(
      z.object({
        audioData: z.string(), // Base64 encoded
        filename: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const buffer = Buffer.from(input.audioData, 'base64');
        const fileKey = `audio/${nanoid()}-${input.filename}`;

        const { url } = await storagePut(fileKey, buffer, 'audio/webm');

        return {
          success: true,
          url,
          fileKey,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        throw new Error(`Upload error: ${message}`);
      }
    }),
});
