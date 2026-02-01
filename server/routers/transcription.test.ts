import { describe, expect, it, vi } from 'vitest';
import { transcriptionRouter } from './transcription';

// Mock the dependencies
vi.mock('../_core/voiceTranscription', () => ({
  transcribeAudio: vi.fn(),
}));

vi.mock('../_core/llm', () => ({
  invokeLLM: vi.fn(),
}));

vi.mock('../storage', () => ({
  storagePut: vi.fn(),
}));

import { transcribeAudio } from '../_core/voiceTranscription';
import { invokeLLM } from '../_core/llm';
import { storagePut } from '../storage';

describe('transcriptionRouter', () => {
  describe('uploadAudio', () => {
    it('should upload audio to S3 and return URL', async () => {
      const mockUrl = 'https://s3.example.com/audio/test.webm';
      const mockFileKey = 'audio/test-key.webm';

      vi.mocked(storagePut).mockResolvedValue({
        url: mockUrl,
        key: mockFileKey,
      });

      const caller = transcriptionRouter.createCaller({});

      const result = await caller.uploadAudio({
        audioData: 'SGVsbG8gV29ybGQ=', // Base64 "Hello World"
        filename: 'test.webm',
      });

      expect(result.success).toBe(true);
      expect(result.url).toBe(mockUrl);
      expect(result.fileKey).toBe(mockFileKey);
      expect(storagePut).toHaveBeenCalled();
    });

    it('should handle upload errors gracefully', async () => {
      vi.mocked(storagePut).mockRejectedValue(new Error('Upload failed'));

      const caller = transcriptionRouter.createCaller({});

      try {
        await caller.uploadAudio({
          audioData: 'SGVsbG8gV29ybGQ=',
          filename: 'test.webm',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('transcribeAudio', () => {
    it('should transcribe audio successfully', async () => {
      const mockTranscription = {
        text: 'Hello, this is a test transcription',
        language: 'en',
        segments: [{ start: 0, end: 5, text: 'Hello' }],
      };

      vi.mocked(transcribeAudio).mockResolvedValue(mockTranscription);

      const caller = transcriptionRouter.createCaller({});

      const result = await caller.transcribeAudio({
        audioUrl: 'https://s3.example.com/audio/test.webm',
      });

      expect(result.success).toBe(true);
      expect(result.text).toBe(mockTranscription.text);
      expect(result.language).toBe('en');
      expect(transcribeAudio).toHaveBeenCalledWith({
        audioUrl: 'https://s3.example.com/audio/test.webm',
        language: undefined,
      });
    });

    it('should handle transcription errors', async () => {
      vi.mocked(transcribeAudio).mockRejectedValue(new Error('Transcription failed'));

      const caller = transcriptionRouter.createCaller({});

      try {
        await caller.transcribeAudio({
          audioUrl: 'https://s3.example.com/audio/test.webm',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('enrichTranscription', () => {
    it('should enrich transcription with summary mode', async () => {
      const mockEnrichedText = 'This is a summary of the transcription.';

      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [
          {
            message: {
              content: mockEnrichedText,
            },
          },
        ],
      });

      const caller = transcriptionRouter.createCaller({});

      const result = await caller.enrichTranscription({
        text: 'This is a long transcription that needs to be summarized.',
        mode: 'summary',
      });

      expect(result.success).toBe(true);
      expect(result.enrichedText).toBe(mockEnrichedText);
      expect(result.mode).toBe('summary');
      expect(invokeLLM).toHaveBeenCalled();
    });

    it('should enrich transcription with structure mode', async () => {
      const mockStructuredText = '# Main Topic\n- Point 1\n- Point 2';

      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [
          {
            message: {
              content: mockStructuredText,
            },
          },
        ],
      });

      const caller = transcriptionRouter.createCaller({});

      const result = await caller.enrichTranscription({
        text: 'This is a transcription with multiple topics.',
        mode: 'structure',
      });

      expect(result.success).toBe(true);
      expect(result.enrichedText).toBe(mockStructuredText);
      expect(result.mode).toBe('structure');
    });

    it('should enrich transcription with context mode', async () => {
      const mockContextText = 'In the context of project management, this means...';

      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [
          {
            message: {
              content: mockContextText,
            },
          },
        ],
      });

      const caller = transcriptionRouter.createCaller({});

      const result = await caller.enrichTranscription({
        text: 'We need to allocate resources and set timelines.',
        mode: 'context',
        context: 'Project Management',
      });

      expect(result.success).toBe(true);
      expect(result.enrichedText).toBe(mockContextText);
      expect(result.mode).toBe('context');
    });

    it('should handle enrichment errors', async () => {
      vi.mocked(invokeLLM).mockRejectedValue(new Error('LLM error'));

      const caller = transcriptionRouter.createCaller({});

      try {
        await caller.enrichTranscription({
          text: 'Test transcription',
          mode: 'summary',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
