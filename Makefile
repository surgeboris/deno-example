IMPORT_MAP=--import-map=import_map.json
PERMISSIONS=--allow-net --allow-read=. --allow-write=.

all:
	deno run --unstable --no-check ${IMPORT_MAP} ${PERMISSIONS} app.ts
build_linux:
	deno compile --target x86_64-unknown-linux-gnu --unstable ${IMPORT_MAP} ${PERMISSIONS} app.ts
build_windows:
	deno compile --target x86_64-pc-windows-msvc --unstable ${IMPORT_MAP} ${PERMISSIONS} app.ts
