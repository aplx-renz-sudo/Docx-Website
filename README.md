# VileDocx Web App.
Official

see a lil up and compare the files to see and use for yo OS lmao

then clone ts fr

ez use

see yo start. type of files down here lmao

mac- use the start.command (apple thingy)

windows- use start.bat (big blue windows haha)

linux- use start.sh (pengiun go brr)

boom you have viledocx

### The built-in model (Docx Macro 135M)

The 135M model ships inside this folder, so nobody has to install Ollama or anything
else to talk to an AI. It is SmolLM-135M-Instruct, running in the browser through
llama.cpp compiled to WebAssembly.

What lives where:

- `public/models/docx-macro-135m.gguf` - the weights (about 88 MB), served to the browser
- `public/wllama/wllama.wasm` - the normal runtime, used when the browser has memory64 + JSPI
- the compat runtime is emitted into `dist/assets/` at build time and is picked
automatically on browsers that lack those features (Safari, older Chrome, Electron)

Pick it in the model list as `Docx Macro 135M`. First message loads the weights into that
tab (a few seconds on localhost); after that it answers with no internet at all.

To swap in another GGUF: drop it in `public/models/` and point `MODEL_URL` in
`src/providers/docx-macro.ts` at it. Keep it quantized (Q4/Q5/Q6) and small - the browser
has to hold the whole thing in memory.

Note for git users: that GGUF is a big binary. Git LFS or shipping the folder zipped
is friendlier than committing 88 MB of weights.
