const fs = require('fs');
let code = fs.readFileSync('src/components/DevPage.tsx', 'utf-8');
const replacement = `        </AnimatePresence>
      </div>
    </div>
    </div>
  );
}`;
code = code.replace(/        <\/AnimatePresence>\n      <\/div>\n    <\/div>\n  \);\n}/, replacement);
fs.writeFileSync('src/components/DevPage.tsx', code, 'utf-8');
console.log("Fixed end 2");
