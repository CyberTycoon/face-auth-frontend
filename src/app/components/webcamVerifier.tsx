'use client';
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";

/**
 * Simple webcam verifier UI component.
 * Place in your page (pages/index.js or app/page.js depending on Next.js router).
 *
 * Props:
 *  - apiUrl: string -> e.g., http://localhost:8000/verify
 */

export default function WebcamVerifier({ apiUrl }: { apiUrl: string }) {
    const webcamRef = useRef<Webcam>(null);
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [message, setMessage] = useState("");
    const [score, setScore] = useState(null);
    const [userId, setUserId] = useState("demo-user");

    const captureAndSend = async () => {
        setStatus("loading");
        setMessage("Capturing...");
        try {
            const screenshot = webcamRef.current?.getScreenshot({ width: 640, height: 480 });
            if (!screenshot) throw new Error("Cannot access camera or permission denied");

            // Convert base64 to blob
            const res = await fetch(screenshot);
            const blob = await res.blob();
            const fd = new FormData();
            fd.append("file", blob, "capture.jpg");
            // user_id param appended in querystring
            const url = `${apiUrl}?user_id=${encodeURIComponent(userId)}`;
            const r = await fetch(url, { method: "POST", body: fd });
            const j = await r.json();

            if (r.ok) {
                setScore(j.score ?? null);
                setMessage(j.message ?? "");
                setStatus(j.access ? "success" : "error");
            } else {
                setStatus("error");
                setMessage(j.detail ?? j.message ?? "Unknown error");
            }
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message || "Capture failed");
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-2 sm:p-4">
            {/* Mobile Layout (Portrait) */}
            <div className="w-full max-w-sm mx-auto bg-white/90 backdrop-blur rounded-3xl shadow-2xl shadow-blue-100 border border-slate-100 overflow-hidden flex flex-col h-full max-h-[95vh] sm:hidden">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <motion.div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </motion.div>
                        <motion.div>
                            <h2 className="text-xl font-semibold text-slate-800">FaceVerify Demo</h2>
                            <p className="text-slate-500 text-xs">Identity verification</p>
                        </motion.div>
                    </div>
                </div>

                {/* Camera */}
                <div className="px-6 flex-1 flex flex-col justify-center">
                    <div className="relative aspect-[4/3] w-full bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
                            className="w-full h-full object-cover"
                            mirrored={false}
                        />
                        {/* Corner guides */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-white/80 rounded-tl-lg"></div>
                            <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-white/80 rounded-tr-lg"></div>
                            <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-white/80 rounded-bl-lg"></div>
                            <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-white/80 rounded-br-lg"></div>
                        </div>
                        {/* Status badge */}
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {status === "loading" ? "Processing…" : "Live"}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="px-6 pb-6 flex-shrink-0 space-y-3">
                    {/* User ID Input */}
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">User ID (demo)</label>
                        <input
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="w-full px-3 py-2 rounded border bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={captureAndSend}
                            className="flex-1 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors font-medium text-sm"
                        >
                            Capture & Verify
                        </button>
                        <button
                            onClick={() => { setStatus("idle"); setMessage(""); setScore(null); }}
                            className="px-3 py-2 border rounded hover:bg-slate-50 transition-colors text-sm"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Status */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="min-h-[48px] text-sm flex items-center"
                    >
                        {status === "success" && <div className="text-green-600 bg-green-50 px-3 py-2 rounded-lg w-full">✔ Verified • score: {score}</div>}
                        {status === "error" && <div className="text-red-600 bg-red-50 px-3 py-2 rounded-lg w-full">✖ {message}</div>}
                        {status === "loading" && <div className="text-blue-600 bg-blue-50 px-3 py-2 rounded-lg w-full">{message}</div>}
                        {status === "idle" && <div className="text-slate-500 bg-slate-50 px-3 py-2 rounded-lg w-full">Ready to capture</div>}
                    </motion.div>
                </div>
            </div>

            {/* Desktop/Tablet Layout (Landscape) */}
            <div className="hidden sm:flex w-full max-w-4xl mx-auto bg-white/90 backdrop-blur rounded-3xl shadow-2xl shadow-blue-100 border border-slate-100 overflow-hidden h-full max-h-[95vh]">
                {/* Left Side - Camera */}
                <div className="flex-1 p-8 flex flex-col justify-center">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800">FaceVerify Demo</h2>
                                <p className="text-slate-500 text-sm">Identity verification system</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full max-w-lg mx-auto aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
                            className="w-full h-full object-cover"
                        />
                        {/* Corner guides */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white/80 rounded-tl-lg"></div>
                            <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white/80 rounded-tr-lg"></div>
                            <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white/80 rounded-bl-lg"></div>
                            <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white/80 rounded-br-lg"></div>
                        </div>
                        {/* Status badge */}
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {status === "loading" ? "Processing…" : "Live"}
                        </div>
                    </div>
                </div>

                {/* Right Side - Controls */}
                <div className="w-80 bg-slate-50/50 p-8 flex flex-col justify-center">
                    <div className="space-y-6">
                        {/* User ID Input */}
                        <div>
                            <label className="block text-sm text-slate-600 mb-2">User ID (demo)</label>
                            <input
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full px-3 py-2 rounded border bg-white border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={captureAndSend}
                                className="w-full px-4 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Capture & Verify
                            </button>
                            <button
                                onClick={() => { setStatus("idle"); setMessage(""); setScore(null); }}
                                className="w-full px-3 py-2 border rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Status */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="min-h-[48px] text-sm"
                        >
                            {status === "success" && (
                                <div className="text-green-600 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
                                    <div className="font-medium">✔ Verified</div>
                                    <div className="text-xs mt-1">Score: {score}</div>
                                </div>
                            )}
                            {status === "error" && (
                                <div className="text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                                    <div className="font-medium">✖ Error</div>
                                    <div className="text-xs mt-1">{message}</div>
                                </div>
                            )}
                            {status === "loading" && (
                                <div className="text-blue-600 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
                                    <div className="font-medium flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        Processing
                                    </div>
                                    <div className="text-xs mt-1">{message}</div>
                                </div>
                            )}
                            {status === "idle" && (
                                <div className="text-slate-500 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                                    <div className="font-medium">Ready to capture</div>
                                    <div className="text-xs mt-1">Position your face in the frame</div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
