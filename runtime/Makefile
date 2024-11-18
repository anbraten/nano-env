get-busybox:
	wget https://busybox.net/downloads/busybox-1.37.0.tar.bz2 -O source/busybox.tar.bz2

busybox:
	mkdir -p build/native
	tar -xf source/busybox.tar.bz2 --strip-components=1 --directory=build/native
#	cp nanozip.c build/native/archival && unzip -d build/native/archival -o source/miniz.zip miniz.h miniz.c
#	cat diff3.h > build/native/editors/diff3.c && echo '#define fgetln(F, ptr) (fscanf(F, "%*[^\\n]\\n", NULL))' >> build/native/editors/diff3.c && sed 's/main/diff3_main/g' source/diff3prog.c >> build/native/editors/diff3.c
	cp .config build/native
	$(MAKE) -C build/native

busybox-wasm:
	mkdir -p build/wasm/arch/em
	tar -xf source/busybox.tar.bz2 --strip-components=1 --directory=build/wasm
#	cp nanozip.c build/wasm/archival && unzip -d build/wasm/archival -o source/miniz.zip miniz.h miniz.c
#	cat diff3.h > build/wasm/editors/diff3.c && echo '#define reallocarray(optr,nmemb,size) (realloc(optr, size * nmemb))' >> build/wasm/editors/diff3.c && sed 's/main/diff3_main/g' source/diff3prog.c >> build/wasm/editors/diff3.c
	cp .config build/wasm
	echo 'cmd_busybox__ = $$(CC) -o $$@.js -Wl,--start-group -s MODULARIZE=1 -s EXPORT_ES6 -s 'EXTRA_EXPORTED_RUNTIME_METHODS=["FS"]' -s ERROR_ON_UNDEFINED_SYMBOLS=0 -O2 $(CURDIR)/em-shell.c -include $(CURDIR)/em-shell.h --js-library $(CURDIR)/em-shell.js $$(CFLAGS) $$(CFLAGS_busybox) $$(LDFLAGS) $$(EM_LDFLAGS) $$(EXTRA_LDFLAGS) $$(core-y) $$(libs-y) $$(patsubst %,-l%,$$(subst :, ,$$(LDLIBS))) -Wl,--end-group && cp $$@.js $$@' > build/wasm/arch/em/Makefile
	cp emgcc build/wasm/emgcc
	chmod +x build/wasm/emgcc
	PATH=$(CURDIR)/build/wasm:$$PATH $(MAKE) -C build/wasm ARCH=em CROSS_COMPILE=em SKIP_STRIP=y

runtime: busybox-wasm
	cp build/wasm/busybox_unstripped.js ../src/assets/
	cp build/wasm/busybox_unstripped.wasm ../src/assets/
