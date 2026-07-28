const fs = require('fs');
let code = fs.readFileSync('src/components/Home.tsx', 'utf-8');
code = code.replace("import { useEffect, useState } from 'react';", "import { useEffect, useState } from 'react';\nimport { useNavigate } from 'react-router-dom';");
code = code.replace("export default function Home({ onBookNow }: { onBookNow: () => void }) {", "export default function Home() {\n  const navigate = useNavigate();\n  const onBookNow = () => navigate('/booking');");
fs.writeFileSync('src/components/Home.tsx', code, 'utf-8');
console.log("Fixed Home");
