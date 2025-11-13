
import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './Icons';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-brand-green-light/50 rounded-lg relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-white/50 rounded-md text-slate-500 hover:bg-white transition opacity-0 group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <CheckIcon /> : <ClipboardIcon />}
      </button>
      <pre className="p-4 text-sm text-brand-green-dark overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
