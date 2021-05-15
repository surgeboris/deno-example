IMPORT_MAP=--import-map=import_map.json
PERMISSIONS=--allow-net --allow-read=. --allow-write=.

all:
	deno run --unstable --no-check ${IMPORT_MAP} ${PERMISSIONS} app.ts
