import React, { useState, useRef, useEffect } from 'react';

function WasteSortAI() {
  const [result, setResult] = useState('');
  const [points, setPoints] = useState(() => parseInt(localStorage.getItem("points")) || 0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    }).then(stream => {
      videoRef.current.srcObject = stream;
    }).catch(err => console.error("Camera error:", err));
  }, []);

  const captureAndClassify = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
    const apiKey = 'YOUR_API_KEY_HERE';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: 'ภาพนี้คือขยะประเภทใด (อินทรีย์, รีไซเคิล, อันตราย, ทั่วไป)?' },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64,
                  }
                }
              ]
            }
          ]
        })
      }
    );
    const data = await response.json();
    const message = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'ไม่พบผลลัพธ์';
    setResult(message);

    if (message.includes("รีไซเคิล") || message.includes("อินทรีย์") || message.includes("อันตราย") || message.includes("ทั่วไป")) {
      const newPoints = points + 10;
      setPoints(newPoints);
      localStorage.setItem("points", newPoints);
    }
  };

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>📷 WasteSortAI</h1>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: 400, borderRadius: 10 }} />
      <br/>
      <button onClick={captureAndClassify} style={{ marginTop: 10, padding: '10px 20px', fontSize: 16 }}>ถ่ายภาพ</button>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <p style={{ marginTop: 20 }}>ผลลัพธ์: <strong>{result}</strong></p>
      <p>แต้มของคุณ: <strong>{points}</strong></p>
    </div>
  );
}

export default WasteSortAI;
