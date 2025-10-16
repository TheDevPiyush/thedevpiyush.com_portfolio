'use client';
import { useEffect, useState } from 'react';
import { Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResumePage() {
  const [downloadStatus, setDownloadStatus] = useState<'downloading' | 'success' | 'error'>('downloading');
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Automatically start download
    const startDownload = async () => {
      try {
        window.location.href = '/api/resume';
        setDownloadStatus('success');
        
        // Show fallback option after 3 seconds
        setTimeout(() => {
          setShowFallback(true);
        }, 3000);
      } catch (error) {
        setDownloadStatus('error');
        setShowFallback(true);
      }
    };

    startDownload();
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-700 p-8 text-center">
          {/* Icon Container */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border border-violet-400/30">
              {downloadStatus === 'downloading' && (
                <Download className="w-8 h-8 text-white animate-bounce" />
              )}
              {downloadStatus === 'success' && (
                <CheckCircle className="w-8 h-8 text-green-400" />
              )}
              {downloadStatus === 'error' && (
                <AlertCircle className="w-8 h-8 text-red-400" />
              )}
            </div>
            
            {/* Animated Ring */}
            {downloadStatus === 'downloading' && (
              <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-violet-400/50 rounded-full animate-ping"></div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-green-400">
              {downloadStatus === 'downloading' && 'Downloading Resume'}
              {downloadStatus === 'success' && 'Download Started!'}
              {downloadStatus === 'error' && 'Download Issue'}
            </h1>
            
            <p className="text-slate-300 leading-relaxed">
              {downloadStatus === 'downloading' && 'Resume is being prepared for download...'}
              {downloadStatus === 'success' && 'Your resume download has started successfully.'}
              {downloadStatus === 'error' && 'There was an issue starting the download.'}
            </p>

            {/* Progress Bar */}
            {downloadStatus === 'downloading' && (
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full animate-pulse"></div>
              </div>
            )}

            {/* Fallback Download Button */}
            {showFallback && (
              <div className="pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-400 mb-4">
                  Download didn't start automatically?
                </p>
                <a
                  href="/api/resume"
                  className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden"
                >
                  {/* Moving border animation */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-400 via-purple-500 via-violet-500 to-purple-400 bg-[length:200%_100%] animate-[border-flow_2s_ease-in-out_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-[1px] rounded-lg bg-gradient-to-r from-violet-500 to-purple-600"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Download Resume
                  </div>
                </a>
              </div>
            )}

            {/* Success Message */}
            {downloadStatus === 'success' && !showFallback && (
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-400/10 text-green-400 rounded-lg text-sm font-medium border border-green-400/30">
                  <CheckCircle className="w-4 h-4" />
                  Download in progress
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Having trouble? Check your browser's download settings or try the manual download above.
          </p>
        </div>
      </div>
    </div>
  );
}
