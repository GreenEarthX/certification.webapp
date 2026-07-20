import Image from "next/image";

const PlantBuilderWelcomeLoader = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="text-center space-y-6 px-6">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center">
          <Image
            src="/logoGEX.png"
            alt="Green Fuel Compliance"
            width={56}
            height={56}
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome to Plant Builder</h1>
          <p className="text-sm text-slate-500">
            Preparing your workspace. Please wait a moment.
          </p>
        </div>
        <div className="w-56 h-1.5 mx-auto rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full w-1/2 bg-blue-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default PlantBuilderWelcomeLoader;
