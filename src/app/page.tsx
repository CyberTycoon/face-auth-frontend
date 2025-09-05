'use client';
import dynamic from "next/dynamic";
const WebcamVerifier = dynamic(() => import("./components/webcamVerifier"), { ssr: false });

export default function Home() {
  const apiUrl = process.env.API_URL || "http://localhost:8000/verify";
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white">
      <WebcamVerifier apiUrl={apiUrl} />
    </main>
  );
}
