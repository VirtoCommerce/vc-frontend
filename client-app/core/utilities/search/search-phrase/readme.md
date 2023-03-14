SearchPhrase.g4 file contains the grammar for the search phrase expression.

# How to generate a parser

1. Install prerequiresites: usually you only need Python,
   which is usually already installed (including Windows machines,
   if you selected `Install Windows build tools` at Node.js installation
   or manually installed `windows-build-tools` package)

2. Install `ANTLR` tools (you may need to run it as Administrator on Windows):
```
   pip install antlr4-tools
```

3. Run antlr4 first time to install dependencies:
```
   antlr4
```

4. Generate search phrase parser
```
   antlr4 -Dlanguage=JavaScript client-app/core/utilities/search/search-phrase/SearchPhrase.g4 -o client-app/core/utilities/search/search-phrase/generated
```
