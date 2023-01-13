SearchPhrase.g4 file contains the grammar for the search phrase expression.

How to generate a parser:

1. Install ANTLR tools prerequiresites: usually you only need Python,
   which is already should be installed (including Windows machines,
   if you selected "Install Windows build tools" at Node.js installation
   or manually installed "windows-build-tools" package)

2. Install ANTLR tools (you may need to run it as Administrator on Windows):
   pip install antlr4-tools

2. Run antlr4 first time to install dependencies:
   antlr4

3. Generate search phrase parser
   antlr4 -Dlanguage=JavaScript client-app/core/utilities/search/search-phrase/SearchPhrase.g4 -o client-app/core/utilities/search/search-phrase

4. Upgrade antlr4 javascript runtime if needed
   (DO NOT upgrade runtime from current 4.12.0-beta3 until ANTLR 4.12 itself will be released)
