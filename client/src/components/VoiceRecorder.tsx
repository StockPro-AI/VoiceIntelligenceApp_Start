import React, { useState } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Mic, Square, Copy, Download } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onTranscriptionComplete?: (text: string) => void;
}

export function VoiceRecorder({ onTranscriptionComplete }: VoiceRecorderProps) {
  const { isRecording, duration, startRecording, stopRecording, cancelRecording, error } =
    useAudioRecorder();

  const [transcription, setTranscription] = useState<string>('');
  const [enrichedText, setEnrichedText] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'summary' | 'structure' | 'format' | 'context'>(
    'summary'
  );

  const uploadAudioMutation = trpc.transcription.uploadAudio.useMutation();
  const transcribeMutation = trpc.transcription.transcribeAudio.useMutation();
  const enrichMutation = trpc.transcription.enrichTranscription.useMutation();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
      toast.success('Recording started');
    } catch (err) {
      toast.error('Failed to start recording');
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsTranscribing(true);
      const audioBlob = await stopRecording();

      if (!audioBlob) {
        toast.error('No audio recorded');
        return;
      }

      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        // Upload audio
        const uploadResult = await uploadAudioMutation.mutateAsync({
          audioData: base64Audio,
          filename: `recording-${Date.now()}.webm`,
        });

        // Transcribe audio
        const transcriptionResult = await transcribeMutation.mutateAsync({
          audioUrl: uploadResult.url,
        });

        const transcribedText = typeof transcriptionResult.text === 'string' 
          ? transcriptionResult.text 
          : JSON.stringify(transcriptionResult.text);
        
        setTranscription(transcribedText);
        onTranscriptionComplete?.(transcriptionResult.text);
        toast.success('Transcription complete');
      };

      reader.readAsDataURL(audioBlob);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transcription failed';
      toast.error(message);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleEnrich = async () => {
    if (!transcription) {
      toast.error('No transcription to enrich');
      return;
    }

    try {
      setIsEnriching(true);
      const result = await enrichMutation.mutateAsync({
        text: transcription,
        mode: selectedMode,
      });

        const enrichedContent = typeof result.enrichedText === 'string'
          ? result.enrichedText
          : JSON.stringify(result.enrichedText);
        
        setEnrichedText(enrichedContent);
      toast.success(`Enrichment complete (${selectedMode})`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Enrichment failed';
      toast.error(message);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleCopyToClipboard = async () => {
    const textToCopy = enrichedText || transcription;
    if (!textToCopy) {
      toast.error('Nothing to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Recording Section */}
      <Card className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-0 shadow-lg">
        <div className="flex flex-col items-center space-y-6">
          {/* Mic Icon with Animation */}
          <div
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording
                ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-110'
                : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg'
            }`}
          >
            <Mic className="w-12 h-12 text-white" />
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-pulse" />
            )}
          </div>

          {/* Duration Display */}
          <div className="text-center">
            <p className="text-4xl font-bold text-slate-900 dark:text-white font-mono">
              {formatDuration(duration)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {isRecording ? 'Recording...' : 'Ready to record'}
            </p>
          </div>

          {/* Error Display */}
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          {/* Control Buttons */}
          <div className="flex gap-4 pt-4">
            {!isRecording ? (
              <Button
                onClick={handleStartRecording}
                disabled={isTranscribing}
                className="px-8 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleStopRecording}
                  disabled={isTranscribing}
                  className="px-8 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
                <Button
                  onClick={cancelRecording}
                  variant="outline"
                  className="px-8 py-2"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>

          {isTranscribing && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Transcribing...
            </div>
          )}
        </div>
      </Card>

      {/* Transcription Display */}
      {transcription && (
        <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Transcription
          </h3>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {transcription}
          </p>
        </Card>
      )}

      {/* Enrichment Section */}
      {transcription && (
        <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Enrichment Options
          </h3>

          <div className="space-y-4">
            {/* Mode Selection */}
            <div className="grid grid-cols-2 gap-3">
              {(['summary', 'structure', 'format', 'context'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedMode === mode
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Enrich Button */}
            <Button
              onClick={handleEnrich}
              disabled={isEnriching}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition-all"
            >
              {isEnriching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enriching...
                </>
              ) : (
                'Enrich Transcription'
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Enriched Result Display */}
      {enrichedText && (
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Enriched Result
            </h3>
            <Button
              onClick={handleCopyToClipboard}
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {enrichedText}
          </p>
        </Card>
      )}
    </div>
  );
}
