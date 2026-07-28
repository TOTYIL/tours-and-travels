const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf-8');
code = code.replace("import { Compass, Menu, X } from 'lucide-react';", "import { Compass, Menu, X } from 'lucide-react';\nimport { useNavigate, useLocation } from 'react-router-dom';");
code = code.replace("export default function Header({ onNavigate, currentPage }: { onNavigate: (page: 'home' | 'booking' | 'trails' | 'dev' | 'support') => void, currentPage: string }) {", "export default function Header() {\n  const navigate = useNavigate();\n  const location = useLocation();\n  const currentPage = location.pathname.substring(1) || 'home';\n  const onNavigate = (page) => navigate(page === 'home' ? '/' : `/${page}`);");
fs.writeFileSync('src/components/Header.tsx', code, 'utf-8');
console.log("Fixed Header");
