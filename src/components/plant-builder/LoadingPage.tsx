const LoadingPage = () => {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 max-w-lg px-6">
        <h2 className="text-xl font-semibold text-gray-900">Preparing Your Plant Model</h2>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-400 to-blue-600 h-full progress-bar"
            style={{
              width: "100%",
            }}
          />
        </div>
        <p className="text-gray-600 text-sm">
          We’re setting up your digital twin. To achieve the best results, please ensure your plant
          representation is built with precise component details and connections for accurate
          compliance checks and performance analysis.
        </p>
      </div>
      <style>{`
        .progress-bar {
          animation: progress 3s ease-in-out infinite;
        }
        @keyframes progress {
          0% {
            width: 0%;
            opacity: 0.6;
          }
          50% {
            width: 100%;
            opacity: 1;
          }
          100% {
            width: 0%;
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingPage;