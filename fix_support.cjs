const fs = require('fs');
let code = fs.readFileSync('src/components/Support.tsx', 'utf-8');
code = code.replace("import { useState, useRef, useEffect } from 'react';", "import { useState, useRef, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';");
code = code.replace("export default function Support({ onBack }: { onBack: () => void }) {", "export default function Support() {\n  const navigate = useNavigate();\n  const onBack = () => navigate('/');");
fs.writeFileSync('src/components/Support.tsx', code, 'utf-8');
console.log("Fixed Support");
