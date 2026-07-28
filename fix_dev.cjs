const fs = require('fs');
let code = fs.readFileSync('src/components/DevPage.tsx', 'utf-8');
code = code.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';");
code = code.replace("export default function DevPage({ onNavigate }: { onNavigate: (page: 'home' | 'booking' | 'trails' | 'dev' | 'support') => void }) {", "export default function DevPage() {\n  const navigate = useNavigate();\n  const onNavigate = (page) => navigate(page === 'home' ? '/' : `/${page}`);");
fs.writeFileSync('src/components/DevPage.tsx', code, 'utf-8');
console.log("Fixed DevPage");
