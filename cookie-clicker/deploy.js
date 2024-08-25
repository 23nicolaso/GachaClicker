import { execSync } from 'child_process';

try {
  // Build the project
  execSync('npm run build');

  // Navigate to the build output directory
  process.chdir('dist');

  // Initialize Git repository
  execSync('git init');

  // Add all files
  execSync('git add -A');

  // Commit changes
  execSync('git commit -m "Deploy to GitHub Pages"');

  // Push to the gh-pages branch
  execSync('git push -f https://github.com/23nicolaso/GachaClicker.git main:gh-pages');

  console.log('Successfully deployed');
} catch (error) {
  console.error('An error occurred:', error);
}