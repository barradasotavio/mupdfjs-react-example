import React, { useEffect, useState } from "react";
import { useMupdf } from "./hooks/useMupdf";

const App: React.FC = () => {
  const { workerInitialized, loadDocument, renderPage } = useMupdf();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndRenderPDF = async () => {
      if (workerInitialized) {
        const response = await fetch("/test.pdf");
        const arrayBuffer = await response.arrayBuffer();
        await loadDocument(arrayBuffer);
        const pngData = await renderPage(0);
        const url = URL.createObjectURL(
          new Blob([pngData], { type: "image/png" })
        );
        setPdfUrl(url);
      }
    };

    fetchAndRenderPDF();
  }, [workerInitialized, loadDocument, renderPage]);

  return (
    <div>
      {pdfUrl ? <img src={pdfUrl} alt="PDF page" /> : <p>Loading PDF...</p>}
    </div>
  );
};

export default App;
