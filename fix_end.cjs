const fs = require('fs');
let code = fs.readFileSync('src/components/DevPage.tsx', 'utf-8');

if (code.endsWith('      </div>\n    </div>\n  );\n}\n') || code.endsWith('      </div>\n    </div>\n  );\n}')) {
  console.log("Already fixed");
} else {
  code = code.replace(/      <\/div>\n    <\/div>\n  \);\n}$/, '      </div>\n    </div>\n    </div>\n  );\n}');
  fs.writeFileSync('src/components/DevPage.tsx', code, 'utf-8');
  console.log("Fixed end");
}
