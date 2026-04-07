const fs = require('fs');
const path = require('path');

const filePaths = [
    'c:/Users/walte/Desktop/proyectos/Nutria/frontend/src/app/page.tsx',
    'c:/Users/walte/Desktop/proyectos/Nutria/frontend/src/app/login/page.tsx',
    'c:/Users/walte/Desktop/proyectos/Nutria/frontend/src/app/components/PatientSummaryModal.tsx'
];

// Tailwind mappings for dark/light
const changes = [
    { from: /\bNutria/g, to: 'Alpamed' },
    { from: /\bemerald-400\b/g, to: 'primary' },
    { from: /\bemerald-500\b/g, to: 'primary' },
    { from: /\bemerald-600\b/g, to: 'primary' },
    { from: /\bteal-400\b/g, to: 'primary' },
    { from: /\bteal-500\b/g, to: 'primary' },
    { from: /\bteal-600\b/g, to: 'primary' },
    { from: /#10b981/g, to: '#2CB7B3' },
    
    // Add dark variants where they were explicitly dark colors
    // Only apply if 'dark:' is not already present to avoid dark:dark:
    { from: /(?<!dark:)\bbg-slate-900\b/g, to: 'bg-white dark:bg-slate-900' },
    { from: /(?<!dark:)\bbg-slate-950\b/g, to: 'bg-slate-50 dark:bg-slate-950' },
    { from: /(?<!dark:)\bbg-slate-800\b/g, to: 'bg-slate-50 dark:bg-slate-800' },
    { from: /(?<!dark:)\btext-white\b/g, to: 'text-slate-900 dark:text-white' },
    { from: /(?<!dark:)\btext-slate-400\b/g, to: 'text-slate-600 dark:text-slate-400' },
    { from: /(?<!dark:)\btext-slate-300\b/g, to: 'text-slate-700 dark:text-slate-300' },
    { from: /(?<!dark:)\bborder-slate-800\b/g, to: 'border-slate-200 dark:border-slate-800' },
    { from: /(?<!dark:)\bborder-slate-700\b/g, to: 'border-slate-300 dark:border-slate-700' },

    // Special logo replacement (avocado -> img)
    { 
        from: /<span className="text-white text-sm">🥑<\/span>/g, 
        to: '<img src="/ALPAMED-nobg.png" alt="Alpamed" className="w-5 h-5 object-contain" />' 
    },
    { 
        from: /<span className="text-white text-xl">🥑<\/span>/g, 
        to: '<img src="/ALPAMED-nobg.png" alt="Alpamed" className="w-7 h-7 object-contain" />' 
    }
];

filePaths.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        changes.forEach(change => {
            content = content.replace(change.from, change.to);
        });
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    } else {
        console.log(`File not found: ${file}`);
    }
});
