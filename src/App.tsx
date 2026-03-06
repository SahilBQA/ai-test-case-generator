import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardCheck, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Download,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  Github,
  Linkedin,
  FileJson,
  FileDown
} from 'lucide-react';
import { generateTestCases, TestCase } from './services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsPDF } from 'jspdf';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [requirement, setRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleGenerate = async () => {
    if (!requirement.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const results = await generateTestCases(requirement);
      setTestCases(results);
      if (results.length > 0) {
        setExpandedId(results[0].id);
      }
    } catch (err) {
      setError('Failed to generate test cases. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTestCasesAsText = () => {
    return testCases.map(tc => (
      `Test Case ${tc.id}: ${tc.title}\n` +
      `Priority: ${tc.priority} | Type: ${tc.type}\n` +
      `Preconditions:\n${tc.preconditions.map(p => `- ${p}`).join('\n')}\n` +
      `Steps:\n${tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n` +
      `Expected Result: ${tc.expectedResult}\n` +
      `-------------------------------------------\n`
    )).join('\n');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadAsText = () => {
    const element = document.createElement("a");
    const file = new Blob([formatTestCasesAsText()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "test_cases.txt";
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  const downloadAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(testCases, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "test_cases.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadAsWord = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Test Cases</title></head>
      <body>
        <h1>Generated Test Cases</h1>
        <p>Requirement: ${requirement}</p>
        <hr/>
        ${testCases.map(tc => `
          <div style="margin-bottom: 20px;">
            <h3>${tc.id}: ${tc.title}</h3>
            <p><strong>Priority:</strong> ${tc.priority} | <strong>Type:</strong> ${tc.type}</p>
            <p><strong>Preconditions:</strong></p>
            <ul>${tc.preconditions.map(p => `<li>${p}</li>`).join('')}</ul>
            <p><strong>Steps:</strong></p>
            <ol>${tc.steps.map(s => `<li>${s}</li>`).join('')}</ol>
            <p><strong>Expected Result:</strong> ${tc.expectedResult}</p>
          </div>
          <hr/>
        `).join('')}
      </body>
      </html>
    `;
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'test_cases.doc';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    
    doc.setFontSize(18);
    doc.text("Generated Test Cases", 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.text(`Requirement: ${requirement.substring(0, 80)}${requirement.length > 80 ? '...' : ''}`, 20, y);
    y += 15;

    testCases.forEach((tc) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${tc.id}: ${tc.title}`, 20, y);
      y += 7;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Priority: ${tc.priority} | Type: ${tc.type}`, 20, y);
      y += 7;
      
      doc.text("Steps:", 20, y);
      y += 5;
      tc.steps.forEach((step, i) => {
        const splitStep = doc.splitTextToSize(`${i+1}. ${step}`, 170);
        doc.text(splitStep, 25, y);
        y += (splitStep.length * 5);
      });
      
      y += 5;
      const splitExpected = doc.splitTextToSize(`Expected: ${tc.expectedResult}`, 170);
      doc.text(splitExpected, 20, y);
      y += (splitExpected.length * 5) + 10;
    });

    doc.save("test_cases.pdf");
  };

  const samples = [
    "User login with email and password, including password reset functionality.",
    "A shopping cart where users can add items, change quantities, and see the subtotal.",
    "A search bar that filters a list of products by name and category in real-time.",
    "User profile page where users can upload an avatar and update their bio."
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ClipboardCheck className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">AI Test Case Generator</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Developed by Sahil Bhatt</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.linkedin.com/in/sahilit/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a 
              href="https://github.com/SahilBQA" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-600">
              <FileText className="w-4 h-4" />
              <h2 className="font-medium">Requirements</h2>
            </div>
            <div className="relative">
              <textarea
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="Paste your software requirements here... (e.g., 'User should be able to login with email and password, with validation for empty fields.')"
                className="w-full h-64 p-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none bg-white shadow-sm"
              />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <label className="cursor-pointer p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Upload Requirement File">
                  <Plus className="w-4 h-4" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".txt,.doc,.docx,.pdf,.xlsx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (re) => {
                          setRequirement(re.target?.result as string);
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
                <span className="text-xs text-zinc-400">
                  {requirement.length} characters
                </span>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !requirement.trim()}
              className={cn(
                "w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-sm",
                loading || !requirement.trim() 
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Test Cases
                </>
              )}
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-700 text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-3">
            <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Try a Sample
            </h3>
            <div className="flex flex-wrap gap-2">
              {samples.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => setRequirement(sample)}
                  className="text-xs bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  {sample.split(' ').slice(0, 3).join(' ')}...
                </button>
              ))}
            </div>
            <p className="text-xs text-indigo-800/70 leading-relaxed pt-2">
              Be specific about edge cases and user roles in your requirements to get more detailed test scenarios.
            </p>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-600">
              <CheckCircle2 className="w-4 h-4" />
              <h2 className="font-medium">
                Generated Scenarios {testCases.length > 0 && `(${testCases.length})`}
              </h2>
            </div>
            {testCases.length > 0 && (
              <div className="flex items-center gap-2 relative">
                <button 
                  onClick={() => copyToClipboard(formatTestCasesAsText())}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                  title="Copy as Text"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Text
                </button>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </button>
                  
                  <AnimatePresence>
                    {showExportMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-20" 
                          onClick={() => setShowExportMenu(false)} 
                        />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-xl z-30 py-2"
                        >
                          <button 
                            onClick={() => { downloadAsPDF(); setShowExportMenu(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                          >
                            <FileDown className="w-4 h-4" />
                            Download PDF
                          </button>
                          <button 
                            onClick={() => { downloadAsWord(); setShowExportMenu(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Download Word (.doc)
                          </button>
                          <button 
                            onClick={() => { downloadAsText(); setShowExportMenu(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Download Text
                          </button>
                          <button 
                            onClick={() => { downloadAsJSON(); setShowExportMenu(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                          >
                            <FileJson className="w-4 h-4" />
                            Download JSON
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {testCases.length === 0 && !loading && (
              <div className="h-64 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-zinc-400 space-y-2">
                <ClipboardCheck className="w-8 h-8 opacity-20" />
                <p className="text-sm">Generated test cases will appear here</p>
              </div>
            )}

            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-zinc-100 animate-pulse rounded-xl" />
                ))}
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {testCases.map((tc) => (
                <motion.div
                  key={tc.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "border rounded-xl overflow-hidden transition-all",
                    expandedId === tc.id ? "border-indigo-200 ring-1 ring-indigo-100 shadow-md" : "border-zinc-200 bg-white hover:border-zinc-300"
                  )}
                >
                  <button
                    onClick={() => setExpandedId(expandedId === tc.id ? null : tc.id)}
                    className="w-full p-4 flex items-start justify-between text-left"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {tc.id}
                        </span>
                        <span className={cn(
                          "text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded",
                          tc.priority === 'High' ? 'bg-red-50 text-red-600' : 
                          tc.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 
                          'bg-emerald-50 text-emerald-600'
                        )}>
                          {tc.priority}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                          {tc.type}
                        </span>
                      </div>
                      <h3 className="font-medium text-zinc-900 leading-tight">{tc.title}</h3>
                    </div>
                    {expandedId === tc.id ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                  </button>

                  <AnimatePresence>
                    {expandedId === tc.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-zinc-100 bg-zinc-50/50"
                      >
                        <div className="p-4 space-y-4 text-sm">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-zinc-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                              Preconditions
                            </h4>
                            <ul className="list-disc list-inside text-zinc-600 pl-2 space-y-1">
                              {tc.preconditions.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold text-zinc-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                              Steps
                            </h4>
                            <ol className="list-decimal list-inside text-zinc-600 pl-2 space-y-1">
                              {tc.steps.map((s, i) => <li key={i}>{s}</li>)}
                            </ol>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold text-zinc-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                              Expected Result
                            </h4>
                            <p className="text-zinc-600 pl-3.5 border-l-2 border-indigo-100 italic">
                              {tc.expectedResult}
                            </p>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(`Test Case ${tc.id}: ${tc.title}\n\nPreconditions:\n${tc.preconditions.join('\n')}\n\nSteps:\n${tc.steps.join('\n')}\n\nExpected Result: ${tc.expectedResult}`);
                              }}
                              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Copy Details
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="space-y-1">
            <p className="font-semibold text-zinc-900">AI Test Case Generator</p>
            <p>© 2026 Developed by Sahil Bhatt. Built for QA Professionals.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a 
              href="https://github.com/SahilBQA" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all flex items-center gap-2 font-medium shadow-sm"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a 
              href="https://www.linkedin.com/in/sahilit/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#0077b5] text-white rounded-lg hover:bg-[#006396] transition-all flex items-center gap-2 font-medium shadow-sm"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
            <a 
              href="https://github.com/SahilBQA/ai-test-case-generator" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-zinc-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              Project Repo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
