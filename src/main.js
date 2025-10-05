// ✅ Auto-import all JS files from /assets/scripts
import.meta.glob(["./assets/scripts/**/*.js", "./assets/styles/**/*.css"], {
    eager: true,
});
