// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register(
  "https://deno.land/std@0.63.0/fs/exists",
  [],
  function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    async function exists(filePath) {
      try {
        await Deno.lstat(filePath);
        return true;
      } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
          return false;
        }
        throw err;
      }
    }
    exports_1("exists", exists);
    function existsSync(filePath) {
      try {
        Deno.lstatSync(filePath);
        return true;
      } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
          return false;
        }
        throw err;
      }
    }
    exports_1("existsSync", existsSync);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/log/levels",
  [],
  function (exports_2, context_2) {
    "use strict";
    var LogLevels, LogLevelNames, byLevel;
    var __moduleName = context_2 && context_2.id;
    function getLevelByName(name) {
      switch (name) {
        case "NOTSET":
          return LogLevels.NOTSET;
        case "DEBUG":
          return LogLevels.DEBUG;
        case "INFO":
          return LogLevels.INFO;
        case "WARNING":
          return LogLevels.WARNING;
        case "ERROR":
          return LogLevels.ERROR;
        case "CRITICAL":
          return LogLevels.CRITICAL;
        default:
          throw new Error(`no log level found for "${name}"`);
      }
    }
    exports_2("getLevelByName", getLevelByName);
    function getLevelName(level) {
      const levelName = byLevel[level];
      if (levelName) {
        return levelName;
      }
      throw new Error(`no level name found for level: ${level}`);
    }
    exports_2("getLevelName", getLevelName);
    return {
      setters: [],
      execute: function () {
        (function (LogLevels) {
          LogLevels[LogLevels["NOTSET"] = 0] = "NOTSET";
          LogLevels[LogLevels["DEBUG"] = 10] = "DEBUG";
          LogLevels[LogLevels["INFO"] = 20] = "INFO";
          LogLevels[LogLevels["WARNING"] = 30] = "WARNING";
          LogLevels[LogLevels["ERROR"] = 40] = "ERROR";
          LogLevels[LogLevels["CRITICAL"] = 50] = "CRITICAL";
        })(LogLevels || (LogLevels = {}));
        exports_2("LogLevels", LogLevels);
        exports_2(
          "LogLevelNames",
          LogLevelNames = Object.keys(LogLevels).filter((key) =>
            isNaN(Number(key))
          ),
        );
        byLevel = {
          [String(LogLevels.NOTSET)]: "NOTSET",
          [String(LogLevels.DEBUG)]: "DEBUG",
          [String(LogLevels.INFO)]: "INFO",
          [String(LogLevels.WARNING)]: "WARNING",
          [String(LogLevels.ERROR)]: "ERROR",
          [String(LogLevels.CRITICAL)]: "CRITICAL",
        };
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/fmt/colors",
  [],
  function (exports_3, context_3) {
    "use strict";
    var noColor, enabled, ANSI_PATTERN;
    var __moduleName = context_3 && context_3.id;
    function setColorEnabled(value) {
      if (noColor) {
        return;
      }
      enabled = value;
    }
    exports_3("setColorEnabled", setColorEnabled);
    function getColorEnabled() {
      return enabled;
    }
    exports_3("getColorEnabled", getColorEnabled);
    function code(open, close) {
      return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g"),
      };
    }
    function run(str, code) {
      return enabled
        ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}`
        : str;
    }
    function reset(str) {
      return run(str, code([0], 0));
    }
    exports_3("reset", reset);
    function bold(str) {
      return run(str, code([1], 22));
    }
    exports_3("bold", bold);
    function dim(str) {
      return run(str, code([2], 22));
    }
    exports_3("dim", dim);
    function italic(str) {
      return run(str, code([3], 23));
    }
    exports_3("italic", italic);
    function underline(str) {
      return run(str, code([4], 24));
    }
    exports_3("underline", underline);
    function inverse(str) {
      return run(str, code([7], 27));
    }
    exports_3("inverse", inverse);
    function hidden(str) {
      return run(str, code([8], 28));
    }
    exports_3("hidden", hidden);
    function strikethrough(str) {
      return run(str, code([9], 29));
    }
    exports_3("strikethrough", strikethrough);
    function black(str) {
      return run(str, code([30], 39));
    }
    exports_3("black", black);
    function red(str) {
      return run(str, code([31], 39));
    }
    exports_3("red", red);
    function green(str) {
      return run(str, code([32], 39));
    }
    exports_3("green", green);
    function yellow(str) {
      return run(str, code([33], 39));
    }
    exports_3("yellow", yellow);
    function blue(str) {
      return run(str, code([34], 39));
    }
    exports_3("blue", blue);
    function magenta(str) {
      return run(str, code([35], 39));
    }
    exports_3("magenta", magenta);
    function cyan(str) {
      return run(str, code([36], 39));
    }
    exports_3("cyan", cyan);
    function white(str) {
      return run(str, code([37], 39));
    }
    exports_3("white", white);
    function gray(str) {
      return run(str, code([90], 39));
    }
    exports_3("gray", gray);
    function bgBlack(str) {
      return run(str, code([40], 49));
    }
    exports_3("bgBlack", bgBlack);
    function bgRed(str) {
      return run(str, code([41], 49));
    }
    exports_3("bgRed", bgRed);
    function bgGreen(str) {
      return run(str, code([42], 49));
    }
    exports_3("bgGreen", bgGreen);
    function bgYellow(str) {
      return run(str, code([43], 49));
    }
    exports_3("bgYellow", bgYellow);
    function bgBlue(str) {
      return run(str, code([44], 49));
    }
    exports_3("bgBlue", bgBlue);
    function bgMagenta(str) {
      return run(str, code([45], 49));
    }
    exports_3("bgMagenta", bgMagenta);
    function bgCyan(str) {
      return run(str, code([46], 49));
    }
    exports_3("bgCyan", bgCyan);
    function bgWhite(str) {
      return run(str, code([47], 49));
    }
    exports_3("bgWhite", bgWhite);
    function clampAndTruncate(n, max = 255, min = 0) {
      return Math.trunc(Math.max(Math.min(n, max), min));
    }
    function rgb8(str, color) {
      return run(str, code([38, 5, clampAndTruncate(color)], 39));
    }
    exports_3("rgb8", rgb8);
    function bgRgb8(str, color) {
      return run(str, code([48, 5, clampAndTruncate(color)], 49));
    }
    exports_3("bgRgb8", bgRgb8);
    function rgb24(str, color) {
      if (typeof color === "number") {
        return run(
          str,
          code(
            [38, 2, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff],
            39,
          ),
        );
      }
      return run(
        str,
        code([
          38,
          2,
          clampAndTruncate(color.r),
          clampAndTruncate(color.g),
          clampAndTruncate(color.b),
        ], 39),
      );
    }
    exports_3("rgb24", rgb24);
    function bgRgb24(str, color) {
      if (typeof color === "number") {
        return run(
          str,
          code(
            [48, 2, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff],
            49,
          ),
        );
      }
      return run(
        str,
        code([
          48,
          2,
          clampAndTruncate(color.r),
          clampAndTruncate(color.g),
          clampAndTruncate(color.b),
        ], 49),
      );
    }
    exports_3("bgRgb24", bgRgb24);
    function stripColor(string) {
      return string.replace(ANSI_PATTERN, "");
    }
    exports_3("stripColor", stripColor);
    return {
      setters: [],
      execute: function () {
        noColor = globalThis.Deno?.noColor ?? true;
        enabled = !noColor;
        ANSI_PATTERN = new RegExp(
          [
            "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
            "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))",
          ].join("|"),
          "g",
        );
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/bytes/mod",
  [],
  function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    function findIndex(source, pat) {
      const s = pat[0];
      for (let i = 0; i < source.length; i++) {
        if (source[i] !== s) {
          continue;
        }
        const pin = i;
        let matched = 1;
        let j = i;
        while (matched < pat.length) {
          j++;
          if (source[j] !== pat[j - pin]) {
            break;
          }
          matched++;
        }
        if (matched === pat.length) {
          return pin;
        }
      }
      return -1;
    }
    exports_4("findIndex", findIndex);
    function findLastIndex(source, pat) {
      const e = pat[pat.length - 1];
      for (let i = source.length - 1; i >= 0; i--) {
        if (source[i] !== e) {
          continue;
        }
        const pin = i;
        let matched = 1;
        let j = i;
        while (matched < pat.length) {
          j--;
          if (source[j] !== pat[pat.length - 1 - (pin - j)]) {
            break;
          }
          matched++;
        }
        if (matched === pat.length) {
          return pin - pat.length + 1;
        }
      }
      return -1;
    }
    exports_4("findLastIndex", findLastIndex);
    function equal(source, match) {
      if (source.length !== match.length) {
        return false;
      }
      for (let i = 0; i < match.length; i++) {
        if (source[i] !== match[i]) {
          return false;
        }
      }
      return true;
    }
    exports_4("equal", equal);
    function hasPrefix(source, prefix) {
      for (let i = 0, max = prefix.length; i < max; i++) {
        if (source[i] !== prefix[i]) {
          return false;
        }
      }
      return true;
    }
    exports_4("hasPrefix", hasPrefix);
    function hasSuffix(source, suffix) {
      for (
        let srci = source.length - 1, sfxi = suffix.length - 1;
        sfxi >= 0;
        srci--, sfxi--
      ) {
        if (source[srci] !== suffix[sfxi]) {
          return false;
        }
      }
      return true;
    }
    exports_4("hasSuffix", hasSuffix);
    function repeat(origin, count) {
      if (count === 0) {
        return new Uint8Array();
      }
      if (count < 0) {
        throw new Error("bytes: negative repeat count");
      } else if ((origin.length * count) / count !== origin.length) {
        throw new Error("bytes: repeat count causes overflow");
      }
      const int = Math.floor(count);
      if (int !== count) {
        throw new Error("bytes: repeat count must be an integer");
      }
      const nb = new Uint8Array(origin.length * count);
      let bp = copyBytes(origin, nb);
      for (; bp < nb.length; bp *= 2) {
        copyBytes(nb.slice(0, bp), nb, bp);
      }
      return nb;
    }
    exports_4("repeat", repeat);
    function concat(origin, b) {
      const output = new Uint8Array(origin.length + b.length);
      output.set(origin, 0);
      output.set(b, origin.length);
      return output;
    }
    exports_4("concat", concat);
    function contains(source, pat) {
      return findIndex(source, pat) != -1;
    }
    exports_4("contains", contains);
    function copyBytes(src, dst, off = 0) {
      off = Math.max(0, Math.min(off, dst.byteLength));
      const dstBytesAvailable = dst.byteLength - off;
      if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
      }
      dst.set(src, off);
      return src.byteLength;
    }
    exports_4("copyBytes", copyBytes);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/_util/assert",
  [],
  function (exports_5, context_5) {
    "use strict";
    var DenoStdInternalError;
    var __moduleName = context_5 && context_5.id;
    function assert(expr, msg = "") {
      if (!expr) {
        throw new DenoStdInternalError(msg);
      }
    }
    exports_5("assert", assert);
    return {
      setters: [],
      execute: function () {
        DenoStdInternalError = class DenoStdInternalError extends Error {
          constructor(message) {
            super(message);
            this.name = "DenoStdInternalError";
          }
        };
        exports_5("DenoStdInternalError", DenoStdInternalError);
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/io/bufio",
  [
    "https://deno.land/std@0.63.0/bytes/mod",
    "https://deno.land/std@0.63.0/_util/assert",
  ],
  function (exports_6, context_6) {
    "use strict";
    var mod_ts_1,
      assert_ts_1,
      DEFAULT_BUF_SIZE,
      MIN_BUF_SIZE,
      MAX_CONSECUTIVE_EMPTY_READS,
      CR,
      LF,
      BufferFullError,
      PartialReadError,
      BufReader,
      AbstractBufBase,
      BufWriter,
      BufWriterSync;
    var __moduleName = context_6 && context_6.id;
    function createLPS(pat) {
      const lps = new Uint8Array(pat.length);
      lps[0] = 0;
      let prefixEnd = 0;
      let i = 1;
      while (i < lps.length) {
        if (pat[i] == pat[prefixEnd]) {
          prefixEnd++;
          lps[i] = prefixEnd;
          i++;
        } else if (prefixEnd === 0) {
          lps[i] = 0;
          i++;
        } else {
          prefixEnd = pat[prefixEnd - 1];
        }
      }
      return lps;
    }
    async function* readDelim(reader, delim) {
      const delimLen = delim.length;
      const delimLPS = createLPS(delim);
      let inputBuffer = new Deno.Buffer();
      const inspectArr = new Uint8Array(Math.max(1024, delimLen + 1));
      let inspectIndex = 0;
      let matchIndex = 0;
      while (true) {
        const result = await reader.read(inspectArr);
        if (result === null) {
          yield inputBuffer.bytes();
          return;
        }
        if (result < 0) {
          return;
        }
        const sliceRead = inspectArr.subarray(0, result);
        await Deno.writeAll(inputBuffer, sliceRead);
        let sliceToProcess = inputBuffer.bytes();
        while (inspectIndex < sliceToProcess.length) {
          if (sliceToProcess[inspectIndex] === delim[matchIndex]) {
            inspectIndex++;
            matchIndex++;
            if (matchIndex === delimLen) {
              const matchEnd = inspectIndex - delimLen;
              const readyBytes = sliceToProcess.subarray(0, matchEnd);
              const pendingBytes = sliceToProcess.slice(inspectIndex);
              yield readyBytes;
              sliceToProcess = pendingBytes;
              inspectIndex = 0;
              matchIndex = 0;
            }
          } else {
            if (matchIndex === 0) {
              inspectIndex++;
            } else {
              matchIndex = delimLPS[matchIndex - 1];
            }
          }
        }
        inputBuffer = new Deno.Buffer(sliceToProcess);
      }
    }
    exports_6("readDelim", readDelim);
    async function* readStringDelim(reader, delim) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      for await (const chunk of readDelim(reader, encoder.encode(delim))) {
        yield decoder.decode(chunk);
      }
    }
    exports_6("readStringDelim", readStringDelim);
    async function* readLines(reader) {
      yield* readStringDelim(reader, "\n");
    }
    exports_6("readLines", readLines);
    return {
      setters: [
        function (mod_ts_1_1) {
          mod_ts_1 = mod_ts_1_1;
        },
        function (assert_ts_1_1) {
          assert_ts_1 = assert_ts_1_1;
        },
      ],
      execute: function () {
        DEFAULT_BUF_SIZE = 4096;
        MIN_BUF_SIZE = 16;
        MAX_CONSECUTIVE_EMPTY_READS = 100;
        CR = "\r".charCodeAt(0);
        LF = "\n".charCodeAt(0);
        BufferFullError = class BufferFullError extends Error {
          constructor(partial) {
            super("Buffer full");
            this.partial = partial;
            this.name = "BufferFullError";
          }
        };
        exports_6("BufferFullError", BufferFullError);
        PartialReadError = class PartialReadError
          extends Deno.errors.UnexpectedEof {
          constructor() {
            super("Encountered UnexpectedEof, data only partially read");
            this.name = "PartialReadError";
          }
        };
        exports_6("PartialReadError", PartialReadError);
        BufReader = class BufReader {
          constructor(rd, size = DEFAULT_BUF_SIZE) {
            this.r = 0;
            this.w = 0;
            this.eof = false;
            if (size < MIN_BUF_SIZE) {
              size = MIN_BUF_SIZE;
            }
            this._reset(new Uint8Array(size), rd);
          }
          static create(r, size = DEFAULT_BUF_SIZE) {
            return r instanceof BufReader ? r : new BufReader(r, size);
          }
          size() {
            return this.buf.byteLength;
          }
          buffered() {
            return this.w - this.r;
          }
          async _fill() {
            if (this.r > 0) {
              this.buf.copyWithin(0, this.r, this.w);
              this.w -= this.r;
              this.r = 0;
            }
            if (this.w >= this.buf.byteLength) {
              throw Error("bufio: tried to fill full buffer");
            }
            for (let i = MAX_CONSECUTIVE_EMPTY_READS; i > 0; i--) {
              const rr = await this.rd.read(this.buf.subarray(this.w));
              if (rr === null) {
                this.eof = true;
                return;
              }
              assert_ts_1.assert(rr >= 0, "negative read");
              this.w += rr;
              if (rr > 0) {
                return;
              }
            }
            throw new Error(
              `No progress after ${MAX_CONSECUTIVE_EMPTY_READS} read() calls`,
            );
          }
          reset(r) {
            this._reset(this.buf, r);
          }
          _reset(buf, rd) {
            this.buf = buf;
            this.rd = rd;
            this.eof = false;
          }
          async read(p) {
            let rr = p.byteLength;
            if (p.byteLength === 0) {
              return rr;
            }
            if (this.r === this.w) {
              if (p.byteLength >= this.buf.byteLength) {
                const rr = await this.rd.read(p);
                const nread = rr ?? 0;
                assert_ts_1.assert(nread >= 0, "negative read");
                return rr;
              }
              this.r = 0;
              this.w = 0;
              rr = await this.rd.read(this.buf);
              if (rr === 0 || rr === null) {
                return rr;
              }
              assert_ts_1.assert(rr >= 0, "negative read");
              this.w += rr;
            }
            const copied = mod_ts_1.copyBytes(
              this.buf.subarray(this.r, this.w),
              p,
              0,
            );
            this.r += copied;
            return copied;
          }
          async readFull(p) {
            let bytesRead = 0;
            while (bytesRead < p.length) {
              try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                  if (bytesRead === 0) {
                    return null;
                  } else {
                    throw new PartialReadError();
                  }
                }
                bytesRead += rr;
              } catch (err) {
                err.partial = p.subarray(0, bytesRead);
                throw err;
              }
            }
            return p;
          }
          async readByte() {
            while (this.r === this.w) {
              if (this.eof) {
                return null;
              }
              await this._fill();
            }
            const c = this.buf[this.r];
            this.r++;
            return c;
          }
          async readString(delim) {
            if (delim.length !== 1) {
              throw new Error("Delimiter should be a single character");
            }
            const buffer = await this.readSlice(delim.charCodeAt(0));
            if (buffer === null) {
              return null;
            }
            return new TextDecoder().decode(buffer);
          }
          async readLine() {
            let line;
            try {
              line = await this.readSlice(LF);
            } catch (err) {
              let { partial } = err;
              assert_ts_1.assert(
                partial instanceof Uint8Array,
                "bufio: caught error from `readSlice()` without `partial` property",
              );
              if (!(err instanceof BufferFullError)) {
                throw err;
              }
              if (
                !this.eof &&
                partial.byteLength > 0 &&
                partial[partial.byteLength - 1] === CR
              ) {
                assert_ts_1.assert(
                  this.r > 0,
                  "bufio: tried to rewind past start of buffer",
                );
                this.r--;
                partial = partial.subarray(0, partial.byteLength - 1);
              }
              return { line: partial, more: !this.eof };
            }
            if (line === null) {
              return null;
            }
            if (line.byteLength === 0) {
              return { line, more: false };
            }
            if (line[line.byteLength - 1] == LF) {
              let drop = 1;
              if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                drop = 2;
              }
              line = line.subarray(0, line.byteLength - drop);
            }
            return { line, more: false };
          }
          async readSlice(delim) {
            let s = 0;
            let slice;
            while (true) {
              let i = this.buf.subarray(this.r + s, this.w).indexOf(delim);
              if (i >= 0) {
                i += s;
                slice = this.buf.subarray(this.r, this.r + i + 1);
                this.r += i + 1;
                break;
              }
              if (this.eof) {
                if (this.r === this.w) {
                  return null;
                }
                slice = this.buf.subarray(this.r, this.w);
                this.r = this.w;
                break;
              }
              if (this.buffered() >= this.buf.byteLength) {
                this.r = this.w;
                const oldbuf = this.buf;
                const newbuf = this.buf.slice(0);
                this.buf = newbuf;
                throw new BufferFullError(oldbuf);
              }
              s = this.w - this.r;
              try {
                await this._fill();
              } catch (err) {
                err.partial = slice;
                throw err;
              }
            }
            return slice;
          }
          async peek(n) {
            if (n < 0) {
              throw Error("negative count");
            }
            let avail = this.w - this.r;
            while (avail < n && avail < this.buf.byteLength && !this.eof) {
              try {
                await this._fill();
              } catch (err) {
                err.partial = this.buf.subarray(this.r, this.w);
                throw err;
              }
              avail = this.w - this.r;
            }
            if (avail === 0 && this.eof) {
              return null;
            } else if (avail < n && this.eof) {
              return this.buf.subarray(this.r, this.r + avail);
            } else if (avail < n) {
              throw new BufferFullError(this.buf.subarray(this.r, this.w));
            }
            return this.buf.subarray(this.r, this.r + n);
          }
        };
        exports_6("BufReader", BufReader);
        AbstractBufBase = class AbstractBufBase {
          constructor() {
            this.usedBufferBytes = 0;
            this.err = null;
          }
          size() {
            return this.buf.byteLength;
          }
          available() {
            return this.buf.byteLength - this.usedBufferBytes;
          }
          buffered() {
            return this.usedBufferBytes;
          }
        };
        BufWriter = class BufWriter extends AbstractBufBase {
          constructor(writer, size = DEFAULT_BUF_SIZE) {
            super();
            this.writer = writer;
            if (size <= 0) {
              size = DEFAULT_BUF_SIZE;
            }
            this.buf = new Uint8Array(size);
          }
          static create(writer, size = DEFAULT_BUF_SIZE) {
            return writer instanceof BufWriter
              ? writer
              : new BufWriter(writer, size);
          }
          reset(w) {
            this.err = null;
            this.usedBufferBytes = 0;
            this.writer = w;
          }
          async flush() {
            if (this.err !== null) {
              throw this.err;
            }
            if (this.usedBufferBytes === 0) {
              return;
            }
            try {
              await Deno.writeAll(
                this.writer,
                this.buf.subarray(0, this.usedBufferBytes),
              );
            } catch (e) {
              this.err = e;
              throw e;
            }
            this.buf = new Uint8Array(this.buf.length);
            this.usedBufferBytes = 0;
          }
          async write(data) {
            if (this.err !== null) {
              throw this.err;
            }
            if (data.length === 0) {
              return 0;
            }
            let totalBytesWritten = 0;
            let numBytesWritten = 0;
            while (data.byteLength > this.available()) {
              if (this.buffered() === 0) {
                try {
                  numBytesWritten = await this.writer.write(data);
                } catch (e) {
                  this.err = e;
                  throw e;
                }
              } else {
                numBytesWritten = mod_ts_1.copyBytes(
                  data,
                  this.buf,
                  this.usedBufferBytes,
                );
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
              }
              totalBytesWritten += numBytesWritten;
              data = data.subarray(numBytesWritten);
            }
            numBytesWritten = mod_ts_1.copyBytes(
              data,
              this.buf,
              this.usedBufferBytes,
            );
            this.usedBufferBytes += numBytesWritten;
            totalBytesWritten += numBytesWritten;
            return totalBytesWritten;
          }
        };
        exports_6("BufWriter", BufWriter);
        BufWriterSync = class BufWriterSync extends AbstractBufBase {
          constructor(writer, size = DEFAULT_BUF_SIZE) {
            super();
            this.writer = writer;
            if (size <= 0) {
              size = DEFAULT_BUF_SIZE;
            }
            this.buf = new Uint8Array(size);
          }
          static create(writer, size = DEFAULT_BUF_SIZE) {
            return writer instanceof BufWriterSync
              ? writer
              : new BufWriterSync(writer, size);
          }
          reset(w) {
            this.err = null;
            this.usedBufferBytes = 0;
            this.writer = w;
          }
          flush() {
            if (this.err !== null) {
              throw this.err;
            }
            if (this.usedBufferBytes === 0) {
              return;
            }
            try {
              Deno.writeAllSync(
                this.writer,
                this.buf.subarray(0, this.usedBufferBytes),
              );
            } catch (e) {
              this.err = e;
              throw e;
            }
            this.buf = new Uint8Array(this.buf.length);
            this.usedBufferBytes = 0;
          }
          writeSync(data) {
            if (this.err !== null) {
              throw this.err;
            }
            if (data.length === 0) {
              return 0;
            }
            let totalBytesWritten = 0;
            let numBytesWritten = 0;
            while (data.byteLength > this.available()) {
              if (this.buffered() === 0) {
                try {
                  numBytesWritten = this.writer.writeSync(data);
                } catch (e) {
                  this.err = e;
                  throw e;
                }
              } else {
                numBytesWritten = mod_ts_1.copyBytes(
                  data,
                  this.buf,
                  this.usedBufferBytes,
                );
                this.usedBufferBytes += numBytesWritten;
                this.flush();
              }
              totalBytesWritten += numBytesWritten;
              data = data.subarray(numBytesWritten);
            }
            numBytesWritten = mod_ts_1.copyBytes(
              data,
              this.buf,
              this.usedBufferBytes,
            );
            this.usedBufferBytes += numBytesWritten;
            totalBytesWritten += numBytesWritten;
            return totalBytesWritten;
          }
        };
        exports_6("BufWriterSync", BufWriterSync);
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/log/handlers",
  [
    "https://deno.land/std@0.63.0/log/levels",
    "https://deno.land/std@0.63.0/fmt/colors",
    "https://deno.land/std@0.63.0/fs/exists",
    "https://deno.land/std@0.63.0/io/bufio",
  ],
  function (exports_7, context_7) {
    "use strict";
    var levels_ts_1,
      colors_ts_1,
      exists_ts_1,
      bufio_ts_1,
      DEFAULT_FORMATTER,
      BaseHandler,
      ConsoleHandler,
      WriterHandler,
      FileHandler,
      RotatingFileHandler;
    var __moduleName = context_7 && context_7.id;
    return {
      setters: [
        function (levels_ts_1_1) {
          levels_ts_1 = levels_ts_1_1;
        },
        function (colors_ts_1_1) {
          colors_ts_1 = colors_ts_1_1;
        },
        function (exists_ts_1_1) {
          exists_ts_1 = exists_ts_1_1;
        },
        function (bufio_ts_1_1) {
          bufio_ts_1 = bufio_ts_1_1;
        },
      ],
      execute: function () {
        DEFAULT_FORMATTER = "{levelName} {msg}";
        BaseHandler = class BaseHandler {
          constructor(levelName, options = {}) {
            this.level = levels_ts_1.getLevelByName(levelName);
            this.levelName = levelName;
            this.formatter = options.formatter || DEFAULT_FORMATTER;
          }
          handle(logRecord) {
            if (this.level > logRecord.level) {
              return;
            }
            const msg = this.format(logRecord);
            return this.log(msg);
          }
          format(logRecord) {
            if (this.formatter instanceof Function) {
              return this.formatter(logRecord);
            }
            return this.formatter.replace(/{(\S+)}/g, (match, p1) => {
              const value = logRecord[p1];
              if (value == null) {
                return match;
              }
              return String(value);
            });
          }
          log(_msg) {}
          async setup() {}
          async destroy() {}
        };
        exports_7("BaseHandler", BaseHandler);
        ConsoleHandler = class ConsoleHandler extends BaseHandler {
          format(logRecord) {
            let msg = super.format(logRecord);
            switch (logRecord.level) {
              case levels_ts_1.LogLevels.INFO:
                msg = colors_ts_1.blue(msg);
                break;
              case levels_ts_1.LogLevels.WARNING:
                msg = colors_ts_1.yellow(msg);
                break;
              case levels_ts_1.LogLevels.ERROR:
                msg = colors_ts_1.red(msg);
                break;
              case levels_ts_1.LogLevels.CRITICAL:
                msg = colors_ts_1.bold(colors_ts_1.red(msg));
                break;
              default:
                break;
            }
            return msg;
          }
          log(msg) {
            console.log(msg);
          }
        };
        exports_7("ConsoleHandler", ConsoleHandler);
        WriterHandler = class WriterHandler extends BaseHandler {
          constructor() {
            super(...arguments);
            this.#encoder = new TextEncoder();
          }
          #encoder;
        };
        exports_7("WriterHandler", WriterHandler);
        FileHandler = class FileHandler extends WriterHandler {
          constructor(levelName, options) {
            super(levelName, options);
            this._encoder = new TextEncoder();
            this.#unloadCallback = () => this.destroy();
            this._filename = options.filename;
            this._mode = options.mode ? options.mode : "a";
            this._openOptions = {
              createNew: this._mode === "x",
              create: this._mode !== "x",
              append: this._mode === "a",
              truncate: this._mode !== "a",
              write: true,
            };
          }
          #unloadCallback;
          async setup() {
            this._file = await Deno.open(this._filename, this._openOptions);
            this._writer = this._file;
            this._buf = new bufio_ts_1.BufWriterSync(this._file);
            addEventListener("unload", this.#unloadCallback);
          }
          handle(logRecord) {
            super.handle(logRecord);
            if (logRecord.level > levels_ts_1.LogLevels.ERROR) {
              this.flush();
            }
          }
          log(msg) {
            this._buf.writeSync(this._encoder.encode(msg + "\n"));
          }
          flush() {
            if (this._buf?.buffered() > 0) {
              this._buf.flush();
            }
          }
          destroy() {
            this.flush();
            this._file?.close();
            this._file = undefined;
            removeEventListener("unload", this.#unloadCallback);
            return Promise.resolve();
          }
        };
        exports_7("FileHandler", FileHandler);
        RotatingFileHandler = class RotatingFileHandler extends FileHandler {
          constructor(levelName, options) {
            super(levelName, options);
            this.#currentFileSize = 0;
            this.#maxBytes = options.maxBytes;
            this.#maxBackupCount = options.maxBackupCount;
          }
          #maxBytes;
          #maxBackupCount;
          #currentFileSize;
          async setup() {
            if (this.#maxBytes < 1) {
              this.destroy();
              throw new Error("maxBytes cannot be less than 1");
            }
            if (this.#maxBackupCount < 1) {
              this.destroy();
              throw new Error("maxBackupCount cannot be less than 1");
            }
            await super.setup();
            if (this._mode === "w") {
              for (let i = 1; i <= this.#maxBackupCount; i++) {
                if (await exists_ts_1.exists(this._filename + "." + i)) {
                  await Deno.remove(this._filename + "." + i);
                }
              }
            } else if (this._mode === "x") {
              for (let i = 1; i <= this.#maxBackupCount; i++) {
                if (await exists_ts_1.exists(this._filename + "." + i)) {
                  this.destroy();
                  throw new Deno.errors.AlreadyExists(
                    "Backup log file " + this._filename + "." + i +
                      " already exists",
                  );
                }
              }
            } else {
              this.#currentFileSize = (await Deno.stat(this._filename)).size;
            }
          }
          log(msg) {
            const msgByteLength = this._encoder.encode(msg).byteLength + 1;
            if (this.#currentFileSize + msgByteLength > this.#maxBytes) {
              this.rotateLogFiles();
              this.#currentFileSize = 0;
            }
            this._buf.writeSync(this._encoder.encode(msg + "\n"));
            this.#currentFileSize += msgByteLength;
          }
          rotateLogFiles() {
            this._buf.flush();
            Deno.close(this._file.rid);
            for (let i = this.#maxBackupCount - 1; i >= 0; i--) {
              const source = this._filename + (i === 0 ? "" : "." + i);
              const dest = this._filename + "." + (i + 1);
              if (exists_ts_1.existsSync(source)) {
                Deno.renameSync(source, dest);
              }
            }
            this._file = Deno.openSync(this._filename, this._openOptions);
            this._writer = this._file;
            this._buf = new bufio_ts_1.BufWriterSync(this._file);
          }
        };
        exports_7("RotatingFileHandler", RotatingFileHandler);
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/log/logger",
  ["https://deno.land/std@0.63.0/log/levels"],
  function (exports_8, context_8) {
    "use strict";
    var levels_ts_2, LogRecord, Logger;
    var __moduleName = context_8 && context_8.id;
    return {
      setters: [
        function (levels_ts_2_1) {
          levels_ts_2 = levels_ts_2_1;
        },
      ],
      execute: function () {
        LogRecord = class LogRecord {
          constructor(options) {
            this.msg = options.msg;
            this.#args = [...options.args];
            this.level = options.level;
            this.loggerName = options.loggerName;
            this.#datetime = new Date();
            this.levelName = levels_ts_2.getLevelName(options.level);
          }
          #args;
          #datetime;
          get args() {
            return [...this.#args];
          }
          get datetime() {
            return new Date(this.#datetime.getTime());
          }
        };
        exports_8("LogRecord", LogRecord);
        Logger = class Logger {
          constructor(loggerName, levelName, options = {}) {
            this.#loggerName = loggerName;
            this.#level = levels_ts_2.getLevelByName(levelName);
            this.#handlers = options.handlers || [];
          }
          #level;
          #handlers;
          #loggerName;
          get level() {
            return this.#level;
          }
          set level(level) {
            this.#level = level;
          }
          get levelName() {
            return levels_ts_2.getLevelName(this.#level);
          }
          set levelName(levelName) {
            this.#level = levels_ts_2.getLevelByName(levelName);
          }
          get loggerName() {
            return this.#loggerName;
          }
          set handlers(hndls) {
            this.#handlers = hndls;
          }
          get handlers() {
            return this.#handlers;
          }
          _log(level, msg, ...args) {
            if (this.level > level) {
              return msg instanceof Function ? undefined : msg;
            }
            let fnResult;
            let logMessage;
            if (msg instanceof Function) {
              fnResult = msg();
              logMessage = this.asString(fnResult);
            } else {
              logMessage = this.asString(msg);
            }
            const record = new LogRecord({
              msg: logMessage,
              args: args,
              level: level,
              loggerName: this.loggerName,
            });
            this.#handlers.forEach((handler) => {
              handler.handle(record);
            });
            return msg instanceof Function ? fnResult : msg;
          }
          asString(data) {
            if (typeof data === "string") {
              return data;
            } else if (
              data === null ||
              typeof data === "number" ||
              typeof data === "bigint" ||
              typeof data === "boolean" ||
              typeof data === "undefined" ||
              typeof data === "symbol"
            ) {
              return String(data);
            } else if (typeof data === "object") {
              return JSON.stringify(data);
            }
            return "undefined";
          }
          debug(msg, ...args) {
            return this._log(levels_ts_2.LogLevels.DEBUG, msg, ...args);
          }
          info(msg, ...args) {
            return this._log(levels_ts_2.LogLevels.INFO, msg, ...args);
          }
          warning(msg, ...args) {
            return this._log(levels_ts_2.LogLevels.WARNING, msg, ...args);
          }
          error(msg, ...args) {
            return this._log(levels_ts_2.LogLevels.ERROR, msg, ...args);
          }
          critical(msg, ...args) {
            return this._log(levels_ts_2.LogLevels.CRITICAL, msg, ...args);
          }
        };
        exports_8("Logger", Logger);
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/log/mod",
  [
    "https://deno.land/std@0.63.0/log/logger",
    "https://deno.land/std@0.63.0/log/handlers",
    "https://deno.land/std@0.63.0/_util/assert",
    "https://deno.land/std@0.63.0/log/levels",
  ],
  function (exports_9, context_9) {
    "use strict";
    var logger_ts_1,
      handlers_ts_1,
      assert_ts_2,
      LoggerConfig,
      DEFAULT_LEVEL,
      DEFAULT_CONFIG,
      state,
      handlers;
    var __moduleName = context_9 && context_9.id;
    function getLogger(name) {
      if (!name) {
        const d = state.loggers.get("default");
        assert_ts_2.assert(
          d != null,
          `"default" logger must be set for getting logger without name`,
        );
        return d;
      }
      const result = state.loggers.get(name);
      if (!result) {
        const logger = new logger_ts_1.Logger(name, "NOTSET", { handlers: [] });
        state.loggers.set(name, logger);
        return logger;
      }
      return result;
    }
    exports_9("getLogger", getLogger);
    function debug(msg, ...args) {
      if (msg instanceof Function) {
        return getLogger("default").debug(msg, ...args);
      }
      return getLogger("default").debug(msg, ...args);
    }
    exports_9("debug", debug);
    function info(msg, ...args) {
      if (msg instanceof Function) {
        return getLogger("default").info(msg, ...args);
      }
      return getLogger("default").info(msg, ...args);
    }
    exports_9("info", info);
    function warning(msg, ...args) {
      if (msg instanceof Function) {
        return getLogger("default").warning(msg, ...args);
      }
      return getLogger("default").warning(msg, ...args);
    }
    exports_9("warning", warning);
    function error(msg, ...args) {
      if (msg instanceof Function) {
        return getLogger("default").error(msg, ...args);
      }
      return getLogger("default").error(msg, ...args);
    }
    exports_9("error", error);
    function critical(msg, ...args) {
      if (msg instanceof Function) {
        return getLogger("default").critical(msg, ...args);
      }
      return getLogger("default").critical(msg, ...args);
    }
    exports_9("critical", critical);
    async function setup(config) {
      state.config = {
        handlers: { ...DEFAULT_CONFIG.handlers, ...config.handlers },
        loggers: { ...DEFAULT_CONFIG.loggers, ...config.loggers },
      };
      state.handlers.forEach((handler) => {
        handler.destroy();
      });
      state.handlers.clear();
      const handlers = state.config.handlers || {};
      for (const handlerName in handlers) {
        const handler = handlers[handlerName];
        await handler.setup();
        state.handlers.set(handlerName, handler);
      }
      state.loggers.clear();
      const loggers = state.config.loggers || {};
      for (const loggerName in loggers) {
        const loggerConfig = loggers[loggerName];
        const handlerNames = loggerConfig.handlers || [];
        const handlers = [];
        handlerNames.forEach((handlerName) => {
          const handler = state.handlers.get(handlerName);
          if (handler) {
            handlers.push(handler);
          }
        });
        const levelName = loggerConfig.level || DEFAULT_LEVEL;
        const logger = new logger_ts_1.Logger(
          loggerName,
          levelName,
          { handlers: handlers },
        );
        state.loggers.set(loggerName, logger);
      }
    }
    exports_9("setup", setup);
    return {
      setters: [
        function (logger_ts_1_1) {
          logger_ts_1 = logger_ts_1_1;
          exports_9({
            "Logger": logger_ts_1_1["Logger"],
          });
        },
        function (handlers_ts_1_1) {
          handlers_ts_1 = handlers_ts_1_1;
        },
        function (assert_ts_2_1) {
          assert_ts_2 = assert_ts_2_1;
        },
        function (levels_ts_3_1) {
          exports_9({
            "LogLevels": levels_ts_3_1["LogLevels"],
          });
        },
      ],
      execute: async function () {
        LoggerConfig = class LoggerConfig {
        };
        exports_9("LoggerConfig", LoggerConfig);
        DEFAULT_LEVEL = "INFO";
        DEFAULT_CONFIG = {
          handlers: {
            default: new handlers_ts_1.ConsoleHandler(DEFAULT_LEVEL),
          },
          loggers: {
            default: {
              level: DEFAULT_LEVEL,
              handlers: ["default"],
            },
          },
        };
        state = {
          handlers: new Map(),
          loggers: new Map(),
          config: DEFAULT_CONFIG,
        };
        exports_9(
          "handlers",
          handlers = {
            BaseHandler: handlers_ts_1.BaseHandler,
            ConsoleHandler: handlers_ts_1.ConsoleHandler,
            WriterHandler: handlers_ts_1.WriterHandler,
            FileHandler: handlers_ts_1.FileHandler,
            RotatingFileHandler: handlers_ts_1.RotatingFileHandler,
          },
        );
        await setup(DEFAULT_CONFIG);
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/path/_constants",
  [],
  function (exports_10, context_10) {
    "use strict";
    var CHAR_UPPERCASE_A,
      CHAR_LOWERCASE_A,
      CHAR_UPPERCASE_Z,
      CHAR_LOWERCASE_Z,
      CHAR_DOT,
      CHAR_FORWARD_SLASH,
      CHAR_BACKWARD_SLASH,
      CHAR_VERTICAL_LINE,
      CHAR_COLON,
      CHAR_QUESTION_MARK,
      CHAR_UNDERSCORE,
      CHAR_LINE_FEED,
      CHAR_CARRIAGE_RETURN,
      CHAR_TAB,
      CHAR_FORM_FEED,
      CHAR_EXCLAMATION_MARK,
      CHAR_HASH,
      CHAR_SPACE,
      CHAR_NO_BREAK_SPACE,
      CHAR_ZERO_WIDTH_NOBREAK_SPACE,
      CHAR_LEFT_SQUARE_BRACKET,
      CHAR_RIGHT_SQUARE_BRACKET,
      CHAR_LEFT_ANGLE_BRACKET,
      CHAR_RIGHT_ANGLE_BRACKET,
      CHAR_LEFT_CURLY_BRACKET,
      CHAR_RIGHT_CURLY_BRACKET,
      CHAR_HYPHEN_MINUS,
      CHAR_PLUS,
      CHAR_DOUBLE_QUOTE,
      CHAR_SINGLE_QUOTE,
      CHAR_PERCENT,
      CHAR_SEMICOLON,
      CHAR_CIRCUMFLEX_ACCENT,
      CHAR_GRAVE_ACCENT,
      CHAR_AT,
      CHAR_AMPERSAND,
      CHAR_EQUAL,
      CHAR_0,
      CHAR_9,
      navigator,
      isWindows;
    var __moduleName = context_10 && context_10.id;
    return {
      setters: [],
      execute: function () {
        exports_10("CHAR_UPPERCASE_A", CHAR_UPPERCASE_A = 65);
        exports_10("CHAR_LOWERCASE_A", CHAR_LOWERCASE_A = 97);
        exports_10("CHAR_UPPERCASE_Z", CHAR_UPPERCASE_Z = 90);
        exports_10("CHAR_LOWERCASE_Z", CHAR_LOWERCASE_Z = 122);
        exports_10("CHAR_DOT", CHAR_DOT = 46);
        exports_10("CHAR_FORWARD_SLASH", CHAR_FORWARD_SLASH = 47);
        exports_10("CHAR_BACKWARD_SLASH", CHAR_BACKWARD_SLASH = 92);
        exports_10("CHAR_VERTICAL_LINE", CHAR_VERTICAL_LINE = 124);
        exports_10("CHAR_COLON", CHAR_COLON = 58);
        exports_10("CHAR_QUESTION_MARK", CHAR_QUESTION_MARK = 63);
        exports_10("CHAR_UNDERSCORE", CHAR_UNDERSCORE = 95);
        exports_10("CHAR_LINE_FEED", CHAR_LINE_FEED = 10);
        exports_10("CHAR_CARRIAGE_RETURN", CHAR_CARRIAGE_RETURN = 13);
        exports_10("CHAR_TAB", CHAR_TAB = 9);
        exports_10("CHAR_FORM_FEED", CHAR_FORM_FEED = 12);
        exports_10("CHAR_EXCLAMATION_MARK", CHAR_EXCLAMATION_MARK = 33);
        exports_10("CHAR_HASH", CHAR_HASH = 35);
        exports_10("CHAR_SPACE", CHAR_SPACE = 32);
        exports_10("CHAR_NO_BREAK_SPACE", CHAR_NO_BREAK_SPACE = 160);
        exports_10(
          "CHAR_ZERO_WIDTH_NOBREAK_SPACE",
          CHAR_ZERO_WIDTH_NOBREAK_SPACE = 65279,
        );
        exports_10("CHAR_LEFT_SQUARE_BRACKET", CHAR_LEFT_SQUARE_BRACKET = 91);
        exports_10("CHAR_RIGHT_SQUARE_BRACKET", CHAR_RIGHT_SQUARE_BRACKET = 93);
        exports_10("CHAR_LEFT_ANGLE_BRACKET", CHAR_LEFT_ANGLE_BRACKET = 60);
        exports_10("CHAR_RIGHT_ANGLE_BRACKET", CHAR_RIGHT_ANGLE_BRACKET = 62);
        exports_10("CHAR_LEFT_CURLY_BRACKET", CHAR_LEFT_CURLY_BRACKET = 123);
        exports_10("CHAR_RIGHT_CURLY_BRACKET", CHAR_RIGHT_CURLY_BRACKET = 125);
        exports_10("CHAR_HYPHEN_MINUS", CHAR_HYPHEN_MINUS = 45);
        exports_10("CHAR_PLUS", CHAR_PLUS = 43);
        exports_10("CHAR_DOUBLE_QUOTE", CHAR_DOUBLE_QUOTE = 34);
        exports_10("CHAR_SINGLE_QUOTE", CHAR_SINGLE_QUOTE = 39);
        exports_10("CHAR_PERCENT", CHAR_PERCENT = 37);
        exports_10("CHAR_SEMICOLON", CHAR_SEMICOLON = 59);
        exports_10("CHAR_CIRCUMFLEX_ACCENT", CHAR_CIRCUMFLEX_ACCENT = 94);
        exports_10("CHAR_GRAVE_ACCENT", CHAR_GRAVE_ACCENT = 96);
        exports_10("CHAR_AT", CHAR_AT = 64);
        exports_10("CHAR_AMPERSAND", CHAR_AMPERSAND = 38);
        exports_10("CHAR_EQUAL", CHAR_EQUAL = 61);
        exports_10("CHAR_0", CHAR_0 = 48);
        exports_10("CHAR_9", CHAR_9 = 57);
        navigator = globalThis.navigator;
        isWindows = false;
        exports_10("isWindows", isWindows);
        if (globalThis.Deno != null) {
          exports_10("isWindows", isWindows = Deno.build.os == "windows");
        } else if (navigator?.appVersion != null) {
          exports_10(
            "isWindows",
            isWindows = navigator.appVersion.includes("Win"),
          );
        }
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/path/_interface",
  [],
  function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/path/_util",
  ["https://deno.land/std@0.63.0/path/_constants"],
  function (exports_12, context_12) {
    "use strict";
    var _constants_ts_1;
    var __moduleName = context_12 && context_12.id;
    function assertPath(path) {
      if (typeof path !== "string") {
        throw new TypeError(
          `Path must be a string. Received ${JSON.stringify(path)}`,
        );
      }
    }
    exports_12("assertPath", assertPath);
    function isPosixPathSeparator(code) {
      return code === _constants_ts_1.CHAR_FORWARD_SLASH;
    }
    exports_12("isPosixPathSeparator", isPosixPathSeparator);
    function isPathSeparator(code) {
      return isPosixPathSeparator(code) ||
        code === _constants_ts_1.CHAR_BACKWARD_SLASH;
    }
    exports_12("isPathSeparator", isPathSeparator);
    function isWindowsDeviceRoot(code) {
      return ((code >= _constants_ts_1.CHAR_LOWERCASE_A &&
        code <= _constants_ts_1.CHAR_LOWERCASE_Z) ||
        (code >= _constants_ts_1.CHAR_UPPERCASE_A &&
          code <= _constants_ts_1.CHAR_UPPERCASE_Z));
    }
    exports_12("isWindowsDeviceRoot", isWindowsDeviceRoot);
    function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
      let res = "";
      let lastSegmentLength = 0;
      let lastSlash = -1;
      let dots = 0;
      let code;
      for (let i = 0, len = path.length; i <= len; ++i) {
        if (i < len) {
          code = path.charCodeAt(i);
        } else if (isPathSeparator(code)) {
          break;
        } else {
          code = _constants_ts_1.CHAR_FORWARD_SLASH;
        }
        if (isPathSeparator(code)) {
          if (lastSlash === i - 1 || dots === 1) {
          } else if (lastSlash !== i - 1 && dots === 2) {
            if (
              res.length < 2 ||
              lastSegmentLength !== 2 ||
              res.charCodeAt(res.length - 1) !== _constants_ts_1.CHAR_DOT ||
              res.charCodeAt(res.length - 2) !== _constants_ts_1.CHAR_DOT
            ) {
              if (res.length > 2) {
                const lastSlashIndex = res.lastIndexOf(separator);
                if (lastSlashIndex === -1) {
                  res = "";
                  lastSegmentLength = 0;
                } else {
                  res = res.slice(0, lastSlashIndex);
                  lastSegmentLength = res.length - 1 -
                    res.lastIndexOf(separator);
                }
                lastSlash = i;
                dots = 0;
                continue;
              } else if (res.length === 2 || res.length === 1) {
                res = "";
                lastSegmentLength = 0;
                lastSlash = i;
                dots = 0;
                continue;
              }
            }
            if (allowAboveRoot) {
              if (res.length > 0) {
                res += `${separator}..`;
              } else {
                res = "..";
              }
              lastSegmentLength = 2;
            }
          } else {
            if (res.length > 0) {
              res += separator + path.slice(lastSlash + 1, i);
            } else {
              res = path.slice(lastSlash + 1, i);
            }
            lastSegmentLength = i - lastSlash - 1;
          }
          lastSlash = i;
          dots = 0;
        } else if (code === _constants_ts_1.CHAR_DOT && dots !== -1) {
          ++dots;
        } else {
          dots = -1;
        }
      }
      return res;
    }
    exports_12("normalizeString", normalizeString);
    function _format(sep, pathObject) {
      const dir = pathObject.dir || pathObject.root;
      const base = pathObject.base ||
        (pathObject.name || "") + (pathObject.ext || "");
      if (!dir) {
        return base;
      }
      if (dir === pathObject.root) {
        return dir + base;
      }
      return dir + sep + base;
    }
    exports_12("_format", _format);
    return {
      setters: [
        function (_constants_ts_1_1) {
          _constants_ts_1 = _constants_ts_1_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/path/win32",
  [
    "https://deno.land/std@0.63.0/path/_constants",
    "https://deno.land/std@0.63.0/path/_util",
    "https://deno.land/std@0.63.0/_util/assert",
  ],
  function (exports_13, context_13) {
    "use strict";
    var _constants_ts_2, _util_ts_1, assert_ts_3, sep, delimiter;
    var __moduleName = context_13 && context_13.id;
    function resolve(...pathSegments) {
      let resolvedDevice = "";
      let resolvedTail = "";
      let resolvedAbsolute = false;
      for (let i = pathSegments.length - 1; i >= -1; i--) {
        let path;
        if (i >= 0) {
          path = pathSegments[i];
        } else if (!resolvedDevice) {
          if (globalThis.Deno == null) {
            throw new TypeError(
              "Resolved a drive-letter-less path without a CWD.",
            );
          }
          path = Deno.cwd();
        } else {
          if (globalThis.Deno == null) {
            throw new TypeError("Resolved a relative path without a CWD.");
          }
          path = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
          if (
            path === undefined ||
            path.slice(0, 3).toLowerCase() !==
              `${resolvedDevice.toLowerCase()}\\`
          ) {
            path = `${resolvedDevice}\\`;
          }
        }
        _util_ts_1.assertPath(path);
        const len = path.length;
        if (len === 0) {
          continue;
        }
        let rootEnd = 0;
        let device = "";
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        if (len > 1) {
          if (_util_ts_1.isPathSeparator(code)) {
            isAbsolute = true;
            if (_util_ts_1.isPathSeparator(path.charCodeAt(1))) {
              let j = 2;
              let last = j;
              for (; j < len; ++j) {
                if (_util_ts_1.isPathSeparator(path.charCodeAt(j))) {
                  break;
                }
              }
              if (j < len && j !== last) {
                const firstPart = path.slice(last, j);
                last = j;
                for (; j < len; ++j) {
                  if (!_util_ts_1.isPathSeparator(path.charCodeAt(j))) {
                    break;
                  }
                }
                if (j < len && j !== last) {
                  last = j;
                  for (; j < len; ++j) {
                    if (_util_ts_1.isPathSeparator(path.charCodeAt(j))) {
                      break;
                    }
                  }
                  if (j === len) {
                    device = `\\\\${firstPart}\\${path.slice(last)}`;
                    rootEnd = j;
                  } else if (j !== last) {
                    device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                    rootEnd = j;
                  }
                }
              }
            } else {
              rootEnd = 1;
            }
          } else if (_util_ts_1.isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
              device = path.slice(0, 2);
              rootEnd = 2;
              if (len > 2) {
                if (_util_ts_1.isPathSeparator(path.charCodeAt(2))) {
                  isAbsolute = true;
                  rootEnd = 3;
                }
              }
            }
          }
        } else if (_util_ts_1.isPathSeparator(code)) {
          rootEnd = 1;
          isAbsolute = true;
        }
        if (
          device.length > 0 &&
          resolvedDevice.length > 0 &&
          device.toLowerCase() !== resolvedDevice.toLowerCase()
        ) {
          continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
          resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
          resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
          resolvedAbsolute = isAbsolute;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) {
          break;
        }
      }
      resolvedTail = _util_ts_1.normalizeString(
        resolvedTail,
        !resolvedAbsolute,
        "\\",
        _util_ts_1.isPathSeparator,
      );
      return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail ||
        ".";
    }
    exports_13("resolve", resolve);
    function normalize(path) {
      _util_ts_1.assertPath(path);
      const len = path.length;
      if (len === 0) {
        return ".";
      }
      let rootEnd = 0;
      let device;
      let isAbsolute = false;
      const code = path.charCodeAt(0);
      if (len > 1) {
        if (_util_ts_1.isPathSeparator(code)) {
          isAbsolute = true;
          if (_util_ts_1.isPathSeparator(path.charCodeAt(1))) {
            let j = 2;
            let last = j;
            for (; j < len; ++j) {
              if (_util_ts_1.isPathSeparator(path.charCodeAt(j))) {
                break;
              }
            }
            if (j < len && j !== last) {
              const firstPart = path.slice(last, j);
              last = j;
              for (; j < len; ++j) {
                if (!_util_ts_1.isPathSeparator(path.charCodeAt(j))) {
                  break;
                }
              }
              if (j < len && j !== last) {
                last = j;
                for (; j < len; ++j) {
                  if (_util_ts_1.isPathSeparator(path.charCodeAt(j))) {
                    break;
                  }
                }
                if (j === len) {
                  return `\\\\${firstPart}\\${path.slice(last)}\\`;
                } else if (j !== last) {
                  device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                  rootEnd = j;
                }
              }
            }
          } else {
            rootEnd = 1;
          }
        } else if (_util_ts_1.isWindowsDeviceRoot(code)) {
          if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
            device = path.slice(0, 2);
            rootEnd = 2;
            if (len > 2) {
              if (_util_ts_1.isPathSeparator(path.charCodeAt(2))) {
                isAbsolute = true;
                rootEnd = 3;
              }
            }
          }
        }
      } else if (_util_ts_1.isPathSeparator(code)) {
        return "\\";
      }
      let tail;
      if (rootEnd < len) {
        tail = _util_ts_1.normalizeString(
          path.slice(rootEnd),
          !isAbsolute,
          "\\",
          _util_ts_1.isPathSeparator,
        );
      } else {
        tail = "";
      }
      if (tail.length === 0 && !isAbsolute) {
        tail = ".";
      }
      if (
        tail.length > 0 && _util_ts_1.isPathSeparator(path.charCodeAt(len - 1))
      ) {
        tail += "\\";
      }
      if (device === undefined) {
        if (isAbsolute) {
          if (tail.length > 0) {
            return `\\${tail}`;
          } else {
            return "\\";
          }
        } else if (tail.length > 0) {
          return tail;
        } else {
          return "";
        }
      } else if (isAbsolute) {
        if (tail.length > 0) {
          return `${device}\\${tail}`;
        } else {
          return `${device}\\`;
        }
      } else if (tail.length > 0) {
        return device + tail;
      } else {
        return device;
      }
    }
    exports_13("normalize", normalize);
    function isAbsolute(path) {
      _util_ts_1.assertPath(path);
      const len = path.length;
      if (len === 0) {
        return false;
      }
      const code = path.charCodeAt(0);
      if (_util_ts_1.isPathSeparator(code)) {
        return true;
      } else if (_util_ts_1.isWindowsDeviceRoot(code)) {
        if (len > 2 && path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
          if (_util_ts_1.isPathSeparator(path.charCodeAt(2))) {
            return true;
          }
        }
      }
      return false;
    }
    exports_13("isAbsolute", isAbsolute);
    function join(...paths) {
      const pathsCount = paths.length;
      if (pathsCount === 0) {
        return ".";
      }
      let joined;
      let firstPart = null;
      for (let i = 0; i < pathsCount; ++i) {
        const path = paths[i];
        _util_ts_1.assertPath(path);
        if (path.length > 0) {
          if (joined === undefined) {
            joined = firstPart = path;
          } else {
            joined += `\\${path}`;
          }
        }
      }
      if (joined === undefined) {
        return ".";
      }
      let needsReplace = true;
      let slashCount = 0;
      assert_ts_3.assert(firstPart != null);
      if (_util_ts_1.isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
          if (_util_ts_1.isPathSeparator(firstPart.charCodeAt(1))) {
            ++slashCount;
            if (firstLen > 2) {
              if (_util_ts_1.isPathSeparator(firstPart.charCodeAt(2))) {
                ++slashCount;
              } else {
                needsReplace = false;
              }
            }
          }
        }
      }
      if (needsReplace) {
        for (; slashCount < joined.length; ++slashCount) {
          if (!_util_ts_1.isPathSeparator(joined.charCodeAt(slashCount))) {
            break;
          }
        }
        if (slashCount >= 2) {
          joined = `\\${joined.slice(slashCount)}`;
        }
      }
      return normalize(joined);
    }
    exports_13("join", join);
    function relative(from, to) {
      _util_ts_1.assertPath(from);
      _util_ts_1.assertPath(to);
      if (from === to) {
        return "";
      }
      const fromOrig = resolve(from);
      const toOrig = resolve(to);
      if (fromOrig === toOrig) {
        return "";
      }
      from = fromOrig.toLowerCase();
      to = toOrig.toLowerCase();
      if (from === to) {
        return "";
      }
      let fromStart = 0;
      let fromEnd = from.length;
      for (; fromStart < fromEnd; ++fromStart) {
        if (
          from.charCodeAt(fromStart) !== _constants_ts_2.CHAR_BACKWARD_SLASH
        ) {
          break;
        }
      }
      for (; fromEnd - 1 > fromStart; --fromEnd) {
        if (
          from.charCodeAt(fromEnd - 1) !== _constants_ts_2.CHAR_BACKWARD_SLASH
        ) {
          break;
        }
      }
      const fromLen = fromEnd - fromStart;
      let toStart = 0;
      let toEnd = to.length;
      for (; toStart < toEnd; ++toStart) {
        if (to.charCodeAt(toStart) !== _constants_ts_2.CHAR_BACKWARD_SLASH) {
          break;
        }
      }
      for (; toEnd - 1 > toStart; --toEnd) {
        if (to.charCodeAt(toEnd - 1) !== _constants_ts_2.CHAR_BACKWARD_SLASH) {
          break;
        }
      }
      const toLen = toEnd - toStart;
      const length = fromLen < toLen ? fromLen : toLen;
      let lastCommonSep = -1;
      let i = 0;
      for (; i <= length; ++i) {
        if (i === length) {
          if (toLen > length) {
            if (
              to.charCodeAt(toStart + i) === _constants_ts_2.CHAR_BACKWARD_SLASH
            ) {
              return toOrig.slice(toStart + i + 1);
            } else if (i === 2) {
              return toOrig.slice(toStart + i);
            }
          }
          if (fromLen > length) {
            if (
              from.charCodeAt(fromStart + i) ===
                _constants_ts_2.CHAR_BACKWARD_SLASH
            ) {
              lastCommonSep = i;
            } else if (i === 2) {
              lastCommonSep = 3;
            }
          }
          break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) {
          break;
        } else if (fromCode === _constants_ts_2.CHAR_BACKWARD_SLASH) {
          lastCommonSep = i;
        }
      }
      if (i !== length && lastCommonSep === -1) {
        return toOrig;
      }
      let out = "";
      if (lastCommonSep === -1) {
        lastCommonSep = 0;
      }
      for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
        if (
          i === fromEnd ||
          from.charCodeAt(i) === _constants_ts_2.CHAR_BACKWARD_SLASH
        ) {
          if (out.length === 0) {
            out += "..";
          } else {
            out += "\\..";
          }
        }
      }
      if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
      } else {
        toStart += lastCommonSep;
        if (
          toOrig.charCodeAt(toStart) === _constants_ts_2.CHAR_BACKWARD_SLASH
        ) {
          ++toStart;
        }
        return toOrig.slice(toStart, toEnd);
      }
    }
    exports_13("relative", relative);
    function toNamespacedPath(path) {
      if (typeof path !== "string") {
        return path;
      }
      if (path.length === 0) {
        return "";
      }
      const resolvedPath = resolve(path);
      if (resolvedPath.length >= 3) {
        if (
          resolvedPath.charCodeAt(0) === _constants_ts_2.CHAR_BACKWARD_SLASH
        ) {
          if (
            resolvedPath.charCodeAt(1) === _constants_ts_2.CHAR_BACKWARD_SLASH
          ) {
            const code = resolvedPath.charCodeAt(2);
            if (
              code !== _constants_ts_2.CHAR_QUESTION_MARK &&
              code !== _constants_ts_2.CHAR_DOT
            ) {
              return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
            }
          }
        } else if (_util_ts_1.isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
          if (
            resolvedPath.charCodeAt(1) === _constants_ts_2.CHAR_COLON &&
            resolvedPath.charCodeAt(2) === _constants_ts_2.CHAR_BACKWARD_SLASH
          ) {
            return `\\\\?\\${resolvedPath}`;
          }
        }
      }
      return path;
    }
    exports_13("toNamespacedPath", toNamespacedPath);
    function dirname(path) {
      _util_ts_1.assertPath(path);
      const len = path.length;
      if (len === 0) {
        return ".";
      }
      let rootEnd = -1;
      let end = -1;
      let matchedSlash = true;
      let offset = 0;
      const code = path.charCodeAt(0);
      if (len > 1) {
        if (_util_ts_1.isPathSeparator(code)) {
          rootEnd = offset = 1;
          if (_util_ts_1.isPathSeparator(path.charCodeAt(1))) {
            let j = 2;
            let last = j;
            for (; j < len; ++j) {
              if (_util_ts_1.isPathSeparator(path.charCodeAt(j))) {
                break;
              }
            }
            if (j < len && j !== last) {
              last = j;
              for (; j < len; ++j) {
                if (!_util_ts_1.isPathSeparator(path.charCodeAt(j))) {
                  break;
                }
              }
              if (j < len && j !== last) {
                last = j;
                for (; j < len; ++j) {
                  if (_util_ts_1.isPathSeparator(path.charCodeAt(j))) {
                    break;
                  }
                }
                if (j === len) {
                  return path;
                }
                if (j !== last) {
                  rootEnd = offset = j + 1;
                }
              }
            }
          }
        } else if (_util_ts_1.isWindowsDeviceRoot(code)) {
          if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
            rootEnd = offset = 2;
            if (len > 2) {
              if (_util_ts_1.isPathSeparator(path.charCodeAt(2))) {
                rootEnd = offset = 3;
              }
            }
          }
        }
      } else if (_util_ts_1.isPathSeparator(code)) {
        return path;
      }
      for (let i = len - 1; i >= offset; --i) {
        if (_util_ts_1.isPathSeparator(path.charCodeAt(i))) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
          matchedSlash = false;
        }
      }
      if (end === -1) {
        if (rootEnd === -1) {
          return ".";
        } else {
          end = rootEnd;
        }
      }
      return path.slice(0, end);
    }
    exports_13("dirname", dirname);
    function basename(path, ext = "") {
      if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
      }
      _util_ts_1.assertPath(path);
      let start = 0;
      let end = -1;
      let matchedSlash = true;
      let i;
      if (path.length >= 2) {
        const drive = path.charCodeAt(0);
        if (_util_ts_1.isWindowsDeviceRoot(drive)) {
          if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
            start = 2;
          }
        }
      }
      if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) {
          return "";
        }
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for (i = path.length - 1; i >= start; --i) {
          const code = path.charCodeAt(i);
          if (_util_ts_1.isPathSeparator(code)) {
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
            if (firstNonSlashEnd === -1) {
              matchedSlash = false;
              firstNonSlashEnd = i + 1;
            }
            if (extIdx >= 0) {
              if (code === ext.charCodeAt(extIdx)) {
                if (--extIdx === -1) {
                  end = i;
                }
              } else {
                extIdx = -1;
                end = firstNonSlashEnd;
              }
            }
          }
        }
        if (start === end) {
          end = firstNonSlashEnd;
        } else if (end === -1) {
          end = path.length;
        }
        return path.slice(start, end);
      } else {
        for (i = path.length - 1; i >= start; --i) {
          if (_util_ts_1.isPathSeparator(path.charCodeAt(i))) {
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
        }
        if (end === -1) {
          return "";
        }
        return path.slice(start, end);
      }
    }
    exports_13("basename", basename);
    function extname(path) {
      _util_ts_1.assertPath(path);
      let start = 0;
      let startDot = -1;
      let startPart = 0;
      let end = -1;
      let matchedSlash = true;
      let preDotState = 0;
      if (
        path.length >= 2 &&
        path.charCodeAt(1) === _constants_ts_2.CHAR_COLON &&
        _util_ts_1.isWindowsDeviceRoot(path.charCodeAt(0))
      ) {
        start = startPart = 2;
      }
      for (let i = path.length - 1; i >= start; --i) {
        const code = path.charCodeAt(i);
        if (_util_ts_1.isPathSeparator(code)) {
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
        if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
        if (code === _constants_ts_2.CHAR_DOT) {
          if (startDot === -1) {
            startDot = i;
          } else if (preDotState !== 1) {
            preDotState = 1;
          }
        } else if (startDot !== -1) {
          preDotState = -1;
        }
      }
      if (
        startDot === -1 ||
        end === -1 ||
        preDotState === 0 ||
        (preDotState === 1 && startDot === end - 1 &&
          startDot === startPart + 1)
      ) {
        return "";
      }
      return path.slice(startDot, end);
    }
    exports_13("extname", extname);
    function format(pathObject) {
      if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(
          `The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`,
        );
      }
      return _util_ts_1._format("\\", pathObject);
    }
    exports_13("format", format);
    function parse(path) {
      _util_ts_1.assertPath(path);
      const ret = { root: "", dir: "", base: "", ext: "", name: "" };
      const len = path.length;
      if (len === 0) {
        return ret;
      }
      let rootEnd = 0;
      let code = path.charCodeAt(0);
      if (len > 1) {
        if (_util_ts_1.isPathSeparator(code)) {
          rootEnd = 1;
          if (_util_ts_1.isPathSeparator(path.charCodeAt(1))) {
            let j = 2;
            let last = j;
            for (; j < len; ++j) {
              if (_util_ts_1.isPathSeparator(path.charCodeAt(j))) {
                break;
              }
            }
            if (j < len && j !== last) {
              last = j;
              for (; j < len; ++j) {
                if (!_util_ts_1.isPathSeparator(path.charCodeAt(j))) {
                  break;
                }
              }
              if (j < len && j !== last) {
                last = j;
                for (; j < len; ++j) {
                  if (_util_ts_1.isPathSeparator(path.charCodeAt(j))) {
                    break;
                  }
                }
                if (j === len) {
                  rootEnd = j;
                } else if (j !== last) {
                  rootEnd = j + 1;
                }
              }
            }
          }
        } else if (_util_ts_1.isWindowsDeviceRoot(code)) {
          if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
            rootEnd = 2;
            if (len > 2) {
              if (_util_ts_1.isPathSeparator(path.charCodeAt(2))) {
                if (len === 3) {
                  ret.root = ret.dir = path;
                  return ret;
                }
                rootEnd = 3;
              }
            } else {
              ret.root = ret.dir = path;
              return ret;
            }
          }
        }
      } else if (_util_ts_1.isPathSeparator(code)) {
        ret.root = ret.dir = path;
        return ret;
      }
      if (rootEnd > 0) {
        ret.root = path.slice(0, rootEnd);
      }
      let startDot = -1;
      let startPart = rootEnd;
      let end = -1;
      let matchedSlash = true;
      let i = path.length - 1;
      let preDotState = 0;
      for (; i >= rootEnd; --i) {
        code = path.charCodeAt(i);
        if (_util_ts_1.isPathSeparator(code)) {
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
        if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
        if (code === _constants_ts_2.CHAR_DOT) {
          if (startDot === -1) {
            startDot = i;
          } else if (preDotState !== 1) {
            preDotState = 1;
          }
        } else if (startDot !== -1) {
          preDotState = -1;
        }
      }
      if (
        startDot === -1 ||
        end === -1 ||
        preDotState === 0 ||
        (preDotState === 1 && startDot === end - 1 &&
          startDot === startPart + 1)
      ) {
        if (end !== -1) {
          ret.base = ret.name = path.slice(startPart, end);
        }
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
        ret.ext = path.slice(startDot, end);
      }
      if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path.slice(0, startPart - 1);
      } else {
        ret.dir = ret.root;
      }
      return ret;
    }
    exports_13("parse", parse);
    function fromFileUrl(url) {
      url = url instanceof URL ? url : new URL(url);
      if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
      }
      let path = decodeURIComponent(
        url.pathname
          .replace(/^\/*([A-Za-z]:)(\/|$)/, "$1/")
          .replace(/\//g, "\\"),
      );
      if (url.hostname != "") {
        path = `\\\\${url.hostname}${path}`;
      }
      return path;
    }
    exports_13("fromFileUrl", fromFileUrl);
    return {
      setters: [
        function (_constants_ts_2_1) {
          _constants_ts_2 = _constants_ts_2_1;
        },
        function (_util_ts_1_1) {
          _util_ts_1 = _util_ts_1_1;
        },
        function (assert_ts_3_1) {
          assert_ts_3 = assert_ts_3_1;
        },
      ],
      execute: function () {
        exports_13("sep", sep = "\\");
        exports_13("delimiter", delimiter = ";");
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/path/posix",
  [
    "https://deno.land/std@0.63.0/path/_constants",
    "https://deno.land/std@0.63.0/path/_util",
  ],
  function (exports_14, context_14) {
    "use strict";
    var _constants_ts_3, _util_ts_2, sep, delimiter;
    var __moduleName = context_14 && context_14.id;
    function resolve(...pathSegments) {
      let resolvedPath = "";
      let resolvedAbsolute = false;
      for (let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        let path;
        if (i >= 0) {
          path = pathSegments[i];
        } else {
          if (globalThis.Deno == null) {
            throw new TypeError("Resolved a relative path without a CWD.");
          }
          path = Deno.cwd();
        }
        _util_ts_2.assertPath(path);
        if (path.length === 0) {
          continue;
        }
        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute =
          path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
      }
      resolvedPath = _util_ts_2.normalizeString(
        resolvedPath,
        !resolvedAbsolute,
        "/",
        _util_ts_2.isPosixPathSeparator,
      );
      if (resolvedAbsolute) {
        if (resolvedPath.length > 0) {
          return `/${resolvedPath}`;
        } else {
          return "/";
        }
      } else if (resolvedPath.length > 0) {
        return resolvedPath;
      } else {
        return ".";
      }
    }
    exports_14("resolve", resolve);
    function normalize(path) {
      _util_ts_2.assertPath(path);
      if (path.length === 0) {
        return ".";
      }
      const isAbsolute =
        path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
      const trailingSeparator =
        path.charCodeAt(path.length - 1) === _constants_ts_3.CHAR_FORWARD_SLASH;
      path = _util_ts_2.normalizeString(
        path,
        !isAbsolute,
        "/",
        _util_ts_2.isPosixPathSeparator,
      );
      if (path.length === 0 && !isAbsolute) {
        path = ".";
      }
      if (path.length > 0 && trailingSeparator) {
        path += "/";
      }
      if (isAbsolute) {
        return `/${path}`;
      }
      return path;
    }
    exports_14("normalize", normalize);
    function isAbsolute(path) {
      _util_ts_2.assertPath(path);
      return path.length > 0 &&
        path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
    }
    exports_14("isAbsolute", isAbsolute);
    function join(...paths) {
      if (paths.length === 0) {
        return ".";
      }
      let joined;
      for (let i = 0, len = paths.length; i < len; ++i) {
        const path = paths[i];
        _util_ts_2.assertPath(path);
        if (path.length > 0) {
          if (!joined) {
            joined = path;
          } else {
            joined += `/${path}`;
          }
        }
      }
      if (!joined) {
        return ".";
      }
      return normalize(joined);
    }
    exports_14("join", join);
    function relative(from, to) {
      _util_ts_2.assertPath(from);
      _util_ts_2.assertPath(to);
      if (from === to) {
        return "";
      }
      from = resolve(from);
      to = resolve(to);
      if (from === to) {
        return "";
      }
      let fromStart = 1;
      const fromEnd = from.length;
      for (; fromStart < fromEnd; ++fromStart) {
        if (from.charCodeAt(fromStart) !== _constants_ts_3.CHAR_FORWARD_SLASH) {
          break;
        }
      }
      const fromLen = fromEnd - fromStart;
      let toStart = 1;
      const toEnd = to.length;
      for (; toStart < toEnd; ++toStart) {
        if (to.charCodeAt(toStart) !== _constants_ts_3.CHAR_FORWARD_SLASH) {
          break;
        }
      }
      const toLen = toEnd - toStart;
      const length = fromLen < toLen ? fromLen : toLen;
      let lastCommonSep = -1;
      let i = 0;
      for (; i <= length; ++i) {
        if (i === length) {
          if (toLen > length) {
            if (
              to.charCodeAt(toStart + i) === _constants_ts_3.CHAR_FORWARD_SLASH
            ) {
              return to.slice(toStart + i + 1);
            } else if (i === 0) {
              return to.slice(toStart + i);
            }
          } else if (fromLen > length) {
            if (
              from.charCodeAt(fromStart + i) ===
                _constants_ts_3.CHAR_FORWARD_SLASH
            ) {
              lastCommonSep = i;
            } else if (i === 0) {
              lastCommonSep = 0;
            }
          }
          break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) {
          break;
        } else if (fromCode === _constants_ts_3.CHAR_FORWARD_SLASH) {
          lastCommonSep = i;
        }
      }
      let out = "";
      for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
        if (
          i === fromEnd ||
          from.charCodeAt(i) === _constants_ts_3.CHAR_FORWARD_SLASH
        ) {
          if (out.length === 0) {
            out += "..";
          } else {
            out += "/..";
          }
        }
      }
      if (out.length > 0) {
        return out + to.slice(toStart + lastCommonSep);
      } else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === _constants_ts_3.CHAR_FORWARD_SLASH) {
          ++toStart;
        }
        return to.slice(toStart);
      }
    }
    exports_14("relative", relative);
    function toNamespacedPath(path) {
      return path;
    }
    exports_14("toNamespacedPath", toNamespacedPath);
    function dirname(path) {
      _util_ts_2.assertPath(path);
      if (path.length === 0) {
        return ".";
      }
      const hasRoot = path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
      let end = -1;
      let matchedSlash = true;
      for (let i = path.length - 1; i >= 1; --i) {
        if (path.charCodeAt(i) === _constants_ts_3.CHAR_FORWARD_SLASH) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
          matchedSlash = false;
        }
      }
      if (end === -1) {
        return hasRoot ? "/" : ".";
      }
      if (hasRoot && end === 1) {
        return "//";
      }
      return path.slice(0, end);
    }
    exports_14("dirname", dirname);
    function basename(path, ext = "") {
      if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
      }
      _util_ts_2.assertPath(path);
      let start = 0;
      let end = -1;
      let matchedSlash = true;
      let i;
      if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) {
          return "";
        }
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for (i = path.length - 1; i >= 0; --i) {
          const code = path.charCodeAt(i);
          if (code === _constants_ts_3.CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
            if (firstNonSlashEnd === -1) {
              matchedSlash = false;
              firstNonSlashEnd = i + 1;
            }
            if (extIdx >= 0) {
              if (code === ext.charCodeAt(extIdx)) {
                if (--extIdx === -1) {
                  end = i;
                }
              } else {
                extIdx = -1;
                end = firstNonSlashEnd;
              }
            }
          }
        }
        if (start === end) {
          end = firstNonSlashEnd;
        } else if (end === -1) {
          end = path.length;
        }
        return path.slice(start, end);
      } else {
        for (i = path.length - 1; i >= 0; --i) {
          if (path.charCodeAt(i) === _constants_ts_3.CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
        }
        if (end === -1) {
          return "";
        }
        return path.slice(start, end);
      }
    }
    exports_14("basename", basename);
    function extname(path) {
      _util_ts_2.assertPath(path);
      let startDot = -1;
      let startPart = 0;
      let end = -1;
      let matchedSlash = true;
      let preDotState = 0;
      for (let i = path.length - 1; i >= 0; --i) {
        const code = path.charCodeAt(i);
        if (code === _constants_ts_3.CHAR_FORWARD_SLASH) {
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
        if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
        if (code === _constants_ts_3.CHAR_DOT) {
          if (startDot === -1) {
            startDot = i;
          } else if (preDotState !== 1) {
            preDotState = 1;
          }
        } else if (startDot !== -1) {
          preDotState = -1;
        }
      }
      if (
        startDot === -1 ||
        end === -1 ||
        preDotState === 0 ||
        (preDotState === 1 && startDot === end - 1 &&
          startDot === startPart + 1)
      ) {
        return "";
      }
      return path.slice(startDot, end);
    }
    exports_14("extname", extname);
    function format(pathObject) {
      if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(
          `The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`,
        );
      }
      return _util_ts_2._format("/", pathObject);
    }
    exports_14("format", format);
    function parse(path) {
      _util_ts_2.assertPath(path);
      const ret = { root: "", dir: "", base: "", ext: "", name: "" };
      if (path.length === 0) {
        return ret;
      }
      const isAbsolute =
        path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
      let start;
      if (isAbsolute) {
        ret.root = "/";
        start = 1;
      } else {
        start = 0;
      }
      let startDot = -1;
      let startPart = 0;
      let end = -1;
      let matchedSlash = true;
      let i = path.length - 1;
      let preDotState = 0;
      for (; i >= start; --i) {
        const code = path.charCodeAt(i);
        if (code === _constants_ts_3.CHAR_FORWARD_SLASH) {
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
        if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
        if (code === _constants_ts_3.CHAR_DOT) {
          if (startDot === -1) {
            startDot = i;
          } else if (preDotState !== 1) {
            preDotState = 1;
          }
        } else if (startDot !== -1) {
          preDotState = -1;
        }
      }
      if (
        startDot === -1 ||
        end === -1 ||
        preDotState === 0 ||
        (preDotState === 1 && startDot === end - 1 &&
          startDot === startPart + 1)
      ) {
        if (end !== -1) {
          if (startPart === 0 && isAbsolute) {
            ret.base = ret.name = path.slice(1, end);
          } else {
            ret.base = ret.name = path.slice(startPart, end);
          }
        }
      } else {
        if (startPart === 0 && isAbsolute) {
          ret.name = path.slice(1, startDot);
          ret.base = path.slice(1, end);
        } else {
          ret.name = path.slice(startPart, startDot);
          ret.base = path.slice(startPart, end);
        }
        ret.ext = path.slice(startDot, end);
      }
      if (startPart > 0) {
        ret.dir = path.slice(0, startPart - 1);
      } else if (isAbsolute) {
        ret.dir = "/";
      }
      return ret;
    }
    exports_14("parse", parse);
    function fromFileUrl(url) {
      url = url instanceof URL ? url : new URL(url);
      if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
      }
      return decodeURIComponent(url.pathname);
    }
    exports_14("fromFileUrl", fromFileUrl);
    return {
      setters: [
        function (_constants_ts_3_1) {
          _constants_ts_3 = _constants_ts_3_1;
        },
        function (_util_ts_2_1) {
          _util_ts_2 = _util_ts_2_1;
        },
      ],
      execute: function () {
        exports_14("sep", sep = "/");
        exports_14("delimiter", delimiter = ":");
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/path/separator",
  ["https://deno.land/std@0.63.0/path/_constants"],
  function (exports_15, context_15) {
    "use strict";
    var _constants_ts_4, SEP, SEP_PATTERN;
    var __moduleName = context_15 && context_15.id;
    return {
      setters: [
        function (_constants_ts_4_1) {
          _constants_ts_4 = _constants_ts_4_1;
        },
      ],
      execute: function () {
        exports_15("SEP", SEP = _constants_ts_4.isWindows ? "\\" : "/");
        exports_15(
          "SEP_PATTERN",
          SEP_PATTERN = _constants_ts_4.isWindows ? /[\\/]+/ : /\/+/,
        );
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/path/common",
  ["https://deno.land/std@0.63.0/path/separator"],
  function (exports_16, context_16) {
    "use strict";
    var separator_ts_1;
    var __moduleName = context_16 && context_16.id;
    function common(paths, sep = separator_ts_1.SEP) {
      const [first = "", ...remaining] = paths;
      if (first === "" || remaining.length === 0) {
        return first.substring(0, first.lastIndexOf(sep) + 1);
      }
      const parts = first.split(sep);
      let endOfPrefix = parts.length;
      for (const path of remaining) {
        const compare = path.split(sep);
        for (let i = 0; i < endOfPrefix; i++) {
          if (compare[i] !== parts[i]) {
            endOfPrefix = i;
          }
        }
        if (endOfPrefix === 0) {
          return "";
        }
      }
      const prefix = parts.slice(0, endOfPrefix).join(sep);
      return prefix.endsWith(sep) ? prefix : `${prefix}${sep}`;
    }
    exports_16("common", common);
    return {
      setters: [
        function (separator_ts_1_1) {
          separator_ts_1 = separator_ts_1_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/path/_globrex",
  ["https://deno.land/std@0.63.0/path/_constants"],
  function (exports_17, context_17) {
    "use strict";
    var _constants_ts_5,
      SEP,
      SEP_ESC,
      SEP_RAW,
      GLOBSTAR,
      WILDCARD,
      GLOBSTAR_SEGMENT,
      WILDCARD_SEGMENT;
    var __moduleName = context_17 && context_17.id;
    function globrex(
      glob,
      {
        extended = false,
        globstar = false,
        strict = false,
        filepath = false,
        flags = "",
      } = {},
    ) {
      const sepPattern = new RegExp(`^${SEP}${strict ? "" : "+"}$`);
      let regex = "";
      let segment = "";
      let pathRegexStr = "";
      const pathSegments = [];
      let inGroup = false;
      let inRange = false;
      const ext = [];
      function add(str, options = { split: false, last: false, only: "" }) {
        const { split, last, only } = options;
        if (only !== "path") {
          regex += str;
        }
        if (filepath && only !== "regex") {
          pathRegexStr += str.match(sepPattern) ? SEP : str;
          if (split) {
            if (last) {
              segment += str;
            }
            if (segment !== "") {
              if (!flags.includes("g")) {
                segment = `^${segment}$`;
              }
              pathSegments.push(new RegExp(segment, flags));
            }
            segment = "";
          } else {
            segment += str;
          }
        }
      }
      let c, n;
      for (let i = 0; i < glob.length; i++) {
        c = glob[i];
        n = glob[i + 1];
        if (["\\", "$", "^", ".", "="].includes(c)) {
          add(`\\${c}`);
          continue;
        }
        if (c.match(sepPattern)) {
          add(SEP, { split: true });
          if (n != null && n.match(sepPattern) && !strict) {
            regex += "?";
          }
          continue;
        }
        if (c === "(") {
          if (ext.length) {
            add(`${c}?:`);
            continue;
          }
          add(`\\${c}`);
          continue;
        }
        if (c === ")") {
          if (ext.length) {
            add(c);
            const type = ext.pop();
            if (type === "@") {
              add("{1}");
            } else if (type === "!") {
              add(WILDCARD);
            } else {
              add(type);
            }
            continue;
          }
          add(`\\${c}`);
          continue;
        }
        if (c === "|") {
          if (ext.length) {
            add(c);
            continue;
          }
          add(`\\${c}`);
          continue;
        }
        if (c === "+") {
          if (n === "(" && extended) {
            ext.push(c);
            continue;
          }
          add(`\\${c}`);
          continue;
        }
        if (c === "@" && extended) {
          if (n === "(") {
            ext.push(c);
            continue;
          }
        }
        if (c === "!") {
          if (extended) {
            if (inRange) {
              add("^");
              continue;
            }
            if (n === "(") {
              ext.push(c);
              add("(?!");
              i++;
              continue;
            }
            add(`\\${c}`);
            continue;
          }
          add(`\\${c}`);
          continue;
        }
        if (c === "?") {
          if (extended) {
            if (n === "(") {
              ext.push(c);
            } else {
              add(".");
            }
            continue;
          }
          add(`\\${c}`);
          continue;
        }
        if (c === "[") {
          if (inRange && n === ":") {
            i++;
            let value = "";
            while (glob[++i] !== ":") {
              value += glob[i];
            }
            if (value === "alnum") {
              add("(?:\\w|\\d)");
            } else if (value === "space") {
              add("\\s");
            } else if (value === "digit") {
              add("\\d");
            }
            i++;
            continue;
          }
          if (extended) {
            inRange = true;
            add(c);
            continue;
          }
          add(`\\${c}`);
          continue;
        }
        if (c === "]") {
          if (extended) {
            inRange = false;
            add(c);
            continue;
          }
          add(`\\${c}`);
          continue;
        }
        if (c === "{") {
          if (extended) {
            inGroup = true;
            add("(?:");
            continue;
          }
          add(`\\${c}`);
          continue;
        }
        if (c === "}") {
          if (extended) {
            inGroup = false;
            add(")");
            continue;
          }
          add(`\\${c}`);
          continue;
        }
        if (c === ",") {
          if (inGroup) {
            add("|");
            continue;
          }
          add(`\\${c}`);
          continue;
        }
        if (c === "*") {
          if (n === "(" && extended) {
            ext.push(c);
            continue;
          }
          const prevChar = glob[i - 1];
          let starCount = 1;
          while (glob[i + 1] === "*") {
            starCount++;
            i++;
          }
          const nextChar = glob[i + 1];
          if (!globstar) {
            add(".*");
          } else {
            const isGlobstar = starCount > 1 &&
              [SEP_RAW, "/", undefined].includes(prevChar) &&
              [SEP_RAW, "/", undefined].includes(nextChar);
            if (isGlobstar) {
              add(GLOBSTAR, { only: "regex" });
              add(GLOBSTAR_SEGMENT, { only: "path", last: true, split: true });
              i++;
            } else {
              add(WILDCARD, { only: "regex" });
              add(WILDCARD_SEGMENT, { only: "path" });
            }
          }
          continue;
        }
        add(c);
      }
      if (!flags.includes("g")) {
        regex = `^${regex}$`;
        segment = `^${segment}$`;
        if (filepath) {
          pathRegexStr = `^${pathRegexStr}$`;
        }
      }
      const result = { regex: new RegExp(regex, flags) };
      if (filepath) {
        pathSegments.push(new RegExp(segment, flags));
        result.path = {
          regex: new RegExp(pathRegexStr, flags),
          segments: pathSegments,
          globstar: new RegExp(
            !flags.includes("g") ? `^${GLOBSTAR_SEGMENT}$` : GLOBSTAR_SEGMENT,
            flags,
          ),
        };
      }
      return result;
    }
    exports_17("globrex", globrex);
    return {
      setters: [
        function (_constants_ts_5_1) {
          _constants_ts_5 = _constants_ts_5_1;
        },
      ],
      execute: function () {
        SEP = _constants_ts_5.isWindows ? `(?:\\\\|\\/)` : `\\/`;
        SEP_ESC = _constants_ts_5.isWindows ? `\\\\` : `/`;
        SEP_RAW = _constants_ts_5.isWindows ? `\\` : `/`;
        GLOBSTAR = `(?:(?:[^${SEP_ESC}/]*(?:${SEP_ESC}|\/|$))*)`;
        WILDCARD = `(?:[^${SEP_ESC}/]*)`;
        GLOBSTAR_SEGMENT = `((?:[^${SEP_ESC}/]*(?:${SEP_ESC}|\/|$))*)`;
        WILDCARD_SEGMENT = `(?:[^${SEP_ESC}/]*)`;
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/path/glob",
  [
    "https://deno.land/std@0.63.0/path/separator",
    "https://deno.land/std@0.63.0/path/_globrex",
    "https://deno.land/std@0.63.0/path/mod",
    "https://deno.land/std@0.63.0/_util/assert",
  ],
  function (exports_18, context_18) {
    "use strict";
    var separator_ts_2, _globrex_ts_1, mod_ts_2, assert_ts_4;
    var __moduleName = context_18 && context_18.id;
    function globToRegExp(glob, { extended = false, globstar = true } = {}) {
      const result = _globrex_ts_1.globrex(glob, {
        extended,
        globstar,
        strict: false,
        filepath: true,
      });
      assert_ts_4.assert(result.path != null);
      return result.path.regex;
    }
    exports_18("globToRegExp", globToRegExp);
    function isGlob(str) {
      const chars = { "{": "}", "(": ")", "[": "]" };
      const regex =
        /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
      if (str === "") {
        return false;
      }
      let match;
      while ((match = regex.exec(str))) {
        if (match[2]) {
          return true;
        }
        let idx = match.index + match[0].length;
        const open = match[1];
        const close = open ? chars[open] : null;
        if (open && close) {
          const n = str.indexOf(close, idx);
          if (n !== -1) {
            idx = n + 1;
          }
        }
        str = str.slice(idx);
      }
      return false;
    }
    exports_18("isGlob", isGlob);
    function normalizeGlob(glob, { globstar = false } = {}) {
      if (glob.match(/\0/g)) {
        throw new Error(`Glob contains invalid characters: "${glob}"`);
      }
      if (!globstar) {
        return mod_ts_2.normalize(glob);
      }
      const s = separator_ts_2.SEP_PATTERN.source;
      const badParentPattern = new RegExp(
        `(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`,
        "g",
      );
      return mod_ts_2.normalize(glob.replace(badParentPattern, "\0")).replace(
        /\0/g,
        "..",
      );
    }
    exports_18("normalizeGlob", normalizeGlob);
    function joinGlobs(globs, { extended = false, globstar = false } = {}) {
      if (!globstar || globs.length == 0) {
        return mod_ts_2.join(...globs);
      }
      if (globs.length === 0) {
        return ".";
      }
      let joined;
      for (const glob of globs) {
        const path = glob;
        if (path.length > 0) {
          if (!joined) {
            joined = path;
          } else {
            joined += `${separator_ts_2.SEP}${path}`;
          }
        }
      }
      if (!joined) {
        return ".";
      }
      return normalizeGlob(joined, { extended, globstar });
    }
    exports_18("joinGlobs", joinGlobs);
    return {
      setters: [
        function (separator_ts_2_1) {
          separator_ts_2 = separator_ts_2_1;
        },
        function (_globrex_ts_1_1) {
          _globrex_ts_1 = _globrex_ts_1_1;
        },
        function (mod_ts_2_1) {
          mod_ts_2 = mod_ts_2_1;
        },
        function (assert_ts_4_1) {
          assert_ts_4 = assert_ts_4_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.63.0/path/mod",
  [
    "https://deno.land/std@0.63.0/path/_constants",
    "https://deno.land/std@0.63.0/path/win32",
    "https://deno.land/std@0.63.0/path/posix",
    "https://deno.land/std@0.63.0/path/common",
    "https://deno.land/std@0.63.0/path/separator",
    "https://deno.land/std@0.63.0/path/_interface",
    "https://deno.land/std@0.63.0/path/glob",
  ],
  function (exports_19, context_19) {
    "use strict";
    var _constants_ts_6,
      _win32,
      _posix,
      path,
      win32,
      posix,
      basename,
      delimiter,
      dirname,
      extname,
      format,
      fromFileUrl,
      isAbsolute,
      join,
      normalize,
      parse,
      relative,
      resolve,
      sep,
      toNamespacedPath;
    var __moduleName = context_19 && context_19.id;
    var exportedNames_1 = {
      "win32": true,
      "posix": true,
      "basename": true,
      "delimiter": true,
      "dirname": true,
      "extname": true,
      "format": true,
      "fromFileUrl": true,
      "isAbsolute": true,
      "join": true,
      "normalize": true,
      "parse": true,
      "relative": true,
      "resolve": true,
      "sep": true,
      "toNamespacedPath": true,
      "SEP": true,
      "SEP_PATTERN": true,
    };
    function exportStar_1(m) {
      var exports = {};
      for (var n in m) {
        if (n !== "default" && !exportedNames_1.hasOwnProperty(n)) {
          exports[n] = m[n];
        }
      }
      exports_19(exports);
    }
    return {
      setters: [
        function (_constants_ts_6_1) {
          _constants_ts_6 = _constants_ts_6_1;
        },
        function (_win32_1) {
          _win32 = _win32_1;
        },
        function (_posix_1) {
          _posix = _posix_1;
        },
        function (common_ts_1_1) {
          exportStar_1(common_ts_1_1);
        },
        function (separator_ts_3_1) {
          exports_19({
            "SEP": separator_ts_3_1["SEP"],
            "SEP_PATTERN": separator_ts_3_1["SEP_PATTERN"],
          });
        },
        function (_interface_ts_1_1) {
          exportStar_1(_interface_ts_1_1);
        },
        function (glob_ts_1_1) {
          exportStar_1(glob_ts_1_1);
        },
      ],
      execute: function () {
        path = _constants_ts_6.isWindows ? _win32 : _posix;
        exports_19("win32", win32 = _win32);
        exports_19("posix", posix = _posix);
        exports_19("basename", basename = path.basename),
          exports_19("delimiter", delimiter = path.delimiter),
          exports_19("dirname", dirname = path.dirname),
          exports_19("extname", extname = path.extname),
          exports_19("format", format = path.format),
          exports_19("fromFileUrl", fromFileUrl = path.fromFileUrl),
          exports_19("isAbsolute", isAbsolute = path.isAbsolute),
          exports_19("join", join = path.join),
          exports_19("normalize", normalize = path.normalize),
          exports_19("parse", parse = path.parse),
          exports_19("relative", relative = path.relative),
          exports_19("resolve", resolve = path.resolve),
          exports_19("sep", sep = path.sep),
          exports_19(
            "toNamespacedPath",
            toNamespacedPath = path.toNamespacedPath,
          );
      },
    };
  },
);
System.register(
  "https://deno.land/x/checksum@1.4.0/sha1",
  [],
  function (exports_20, context_20) {
    "use strict";
    var Sha1Hash;
    var __moduleName = context_20 && context_20.id;
    function binb_sha1(x, len) {
      x[len >> 5] |= 0x80 << (24 - (len % 32));
      x[(((len + 64) >> 9) << 4) + 15] = len;
      const w = [];
      let a = 1732584193;
      let b = -271733879;
      let c = -1732584194;
      let d = 271733878;
      let e = -1009589776;
      for (let i = 0; i < x.length; i += 16) {
        const olda = a;
        const oldb = b;
        const oldc = c;
        const oldd = d;
        const olde = e;
        for (let j = 0; j < 80; j++) {
          if (j < 16) {
            w[j] = x[i + j];
          } else {
            w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
          }
          var t = safe_add(
            safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
            safe_add(safe_add(e, w[j]), sha1_kt(j)),
          );
          e = d;
          d = c;
          c = bit_rol(b, 30);
          b = a;
          a = t;
        }
        a = safe_add(a, olda);
        b = safe_add(b, oldb);
        c = safe_add(c, oldc);
        d = safe_add(d, oldd);
        e = safe_add(e, olde);
      }
      return [a, b, c, d, e];
    }
    function sha1_ft(t, b, c, d) {
      if (t < 20) {
        return (b & c) | (~b & d);
      }
      if (t < 40) {
        return b ^ c ^ d;
      }
      if (t < 60) {
        return (b & c) | (b & d) | (c & d);
      }
      return b ^ c ^ d;
    }
    function sha1_kt(t) {
      return t < 20
        ? 1518500249
        : t < 40
        ? 1859775393
        : t < 60
        ? -1894007588
        : -899497514;
    }
    function safe_add(x, y) {
      const lsw = (x & 0xffff) + (y & 0xffff);
      const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xffff);
    }
    function bit_rol(num, cnt) {
      return (num << cnt) | (num >>> (32 - cnt));
    }
    return {
      setters: [],
      execute: function () {
        Sha1Hash = class Sha1Hash {
          digest(bytes) {
            let data = [];
            for (var i = 0; i < bytes.length * 8; i += 8) {
              data[i >> 5] |= (bytes[i / 8] & 0xff) << (24 - (i % 32));
            }
            data = binb_sha1(data, bytes.length * 8);
            return this.toStrBytes(data);
          }
          toStrBytes(input) {
            let pos = 0;
            const data = new Uint8Array(input.length * 4);
            for (let i = 0; i < input.length * 32; i += 8) {
              data[pos++] = (input[i >> 5] >> (24 - (i % 32))) & 0xff;
            }
            return data;
          }
        };
        exports_20("Sha1Hash", Sha1Hash);
      },
    };
  },
);
System.register(
  "https://deno.land/x/checksum@1.4.0/md5",
  [],
  function (exports_21, context_21) {
    "use strict";
    var Md5Hash;
    var __moduleName = context_21 && context_21.id;
    function safeAdd(x, y) {
      const lsw = (x & 0xffff) + (y & 0xffff);
      const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xffff);
    }
    function bitRotateLeft(num, cnt) {
      return (num << cnt) | (num >>> (32 - cnt));
    }
    function md5cmn(q, a, b, x, s, t) {
      return safeAdd(
        bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s),
        b,
      );
    }
    function md5ff(a, b, c, d, x, s, t) {
      return md5cmn((b & c) | (~b & d), a, b, x, s, t);
    }
    function md5gg(a, b, c, d, x, s, t) {
      return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
    }
    function md5hh(a, b, c, d, x, s, t) {
      return md5cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5ii(a, b, c, d, x, s, t) {
      return md5cmn(c ^ (b | ~d), a, b, x, s, t);
    }
    function binlMD5(x, len) {
      x[len >> 5] |= 0x80 << len % 32;
      x[(((len + 64) >>> 9) << 4) + 14] = len;
      let olda, oldb, oldc, oldd;
      let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
      for (let i = 0; i < x.length; i += 16) {
        olda = a;
        oldb = b;
        oldc = c;
        oldd = d;
        a = md5ff(a, b, c, d, x[i], 7, -680876936);
        d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
        b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
        a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = md5gg(b, c, d, a, x[i], 20, -373897302);
        a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
        a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
        d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = md5hh(d, a, b, c, x[i], 11, -358537222);
        c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
        a = md5ii(a, b, c, d, x[i], 6, -198630844);
        d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
        a = safeAdd(a, olda);
        b = safeAdd(b, oldb);
        c = safeAdd(c, oldc);
        d = safeAdd(d, oldd);
      }
      return [a, b, c, d];
    }
    function md5(bytes) {
      let data = [];
      var length8 = bytes.length * 8;
      for (let i = 0; i < length8; i += 8) {
        data[i >> 5] |= (bytes[i / 8] & 0xff) << i % 32;
      }
      return binlMD5(data, bytes.length * 8);
    }
    return {
      setters: [],
      execute: function () {
        Md5Hash = class Md5Hash {
          digest(bytes) {
            const data = md5(bytes);
            return this.toStrBytes(data);
          }
          toStrBytes(input) {
            const buffer = new ArrayBuffer(16);
            new Uint32Array(buffer).set(input);
            return new Uint8Array(buffer);
          }
        };
        exports_21("Md5Hash", Md5Hash);
      },
    };
  },
);
System.register(
  "https://deno.land/x/checksum@1.4.0/hash",
  [
    "https://deno.land/x/checksum@1.4.0/sha1",
    "https://deno.land/x/checksum@1.4.0/md5",
  ],
  function (exports_22, context_22) {
    "use strict";
    var sha1_ts_1, md5_ts_1, encoder, Hash;
    var __moduleName = context_22 && context_22.id;
    function hex(bytes) {
      return Array.prototype.map
        .call(bytes, (x) => x.toString(16).padStart(2, "0"))
        .join("");
    }
    exports_22("hex", hex);
    function encode(str) {
      return encoder.encode(str);
    }
    exports_22("encode", encode);
    return {
      setters: [
        function (sha1_ts_1_1) {
          sha1_ts_1 = sha1_ts_1_1;
        },
        function (md5_ts_1_1) {
          md5_ts_1 = md5_ts_1_1;
        },
      ],
      execute: function () {
        encoder = new TextEncoder();
        Hash = class Hash {
          constructor(algorithm) {
            this.algorithm = algorithm;
            const algorithms = {
              sha1: sha1_ts_1.Sha1Hash,
              md5: md5_ts_1.Md5Hash,
            };
            this.instance = new algorithms[algorithm]();
          }
          digest(bytes) {
            bytes = this.instance.digest(bytes);
            return {
              data: bytes,
              hex: () => hex(bytes),
            };
          }
          digestString(string) {
            return this.digest(encode(string));
          }
        };
        exports_22("Hash", Hash);
      },
    };
  },
);
System.register(
  "https://deno.land/x/checksum@1.4.0/mod",
  ["https://deno.land/x/checksum@1.4.0/hash"],
  function (exports_23, context_23) {
    "use strict";
    var __moduleName = context_23 && context_23.id;
    return {
      setters: [
        function (hash_ts_1_1) {
          exports_23({
            "Hash": hash_ts_1_1["Hash"],
            "hex": hash_ts_1_1["hex"],
            "encode": hash_ts_1_1["encode"],
          });
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/x/plugin_prepare@v0.7.2/deps",
  [
    "https://deno.land/std@0.63.0/fs/exists",
    "https://deno.land/std@0.63.0/log/mod",
    "https://deno.land/std@0.63.0/path/mod",
    "https://deno.land/x/checksum@1.4.0/mod",
  ],
  function (exports_24, context_24) {
    "use strict";
    var __moduleName = context_24 && context_24.id;
    return {
      setters: [
        function (exists_ts_2_1) {
          exports_24({
            "exists": exists_ts_2_1["exists"],
          });
        },
        function (log_1) {
          exports_24("log", log_1);
        },
        function (path_1) {
          exports_24("path", path_1);
        },
        function (mod_ts_3_1) {
          exports_24({
            "Hash": mod_ts_3_1["Hash"],
          });
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/x/plugin_prepare@v0.7.2/mod",
  ["https://deno.land/x/plugin_prepare@v0.7.2/deps"],
  function (exports_25, context_25) {
    "use strict";
    var deps_ts_1, os, md5, PLUGIN_SUFFIX_MAP, pluginSuffix;
    var __moduleName = context_25 && context_25.id;
    async function download(options) {
      const { name, urls, checkCache = true } = options;
      const remoteUrl = urls[os];
      const remoteHash = md5.digestString(remoteUrl + pluginSuffix).hex();
      const cacheFileName = `${name}_${remoteHash}${pluginSuffix}`;
      const localPath = deps_ts_1.path.resolve(".deno_plugins", cacheFileName);
      await Deno.mkdir(".deno_plugins", { recursive: true });
      if (!(await deps_ts_1.exists(localPath)) || !checkCache) {
        if (!remoteUrl) {
          throw Error(
            `"${name}" plugin does not provide binaries suitable for the current system`,
          );
        }
        if (remoteUrl.startsWith("file://")) {
          const fromPath = deps_ts_1.path.resolve(remoteUrl.slice(7));
          await copyFromLocal(name, fromPath, localPath);
        } else {
          await downloadFromRemote(name, remoteUrl, localPath);
        }
      }
      return localPath;
    }
    exports_25("download", download);
    async function prepare(options) {
      const { name, printLog = true } = options;
      if (printLog) {
        await deps_ts_1.log.setup({});
      }
      const localPath = await download(options);
      deps_ts_1.log.info(
        `load deno plugin "${name}" from local "${localPath}"`,
      );
      return Deno.openPlugin(localPath);
    }
    exports_25("prepare", prepare);
    async function downloadFromRemote(name, remoteUrl, savePath) {
      deps_ts_1.log.info(
        `downloading deno plugin "${name}" from "${remoteUrl}"`,
      );
      const download = await fetch(remoteUrl);
      if (download.status !== 200) {
        throw Error(`downloading plugin "${name}" from "${remoteUrl}" failed.`);
      }
      const pluginFileData = await download.arrayBuffer();
      await Deno.writeFile(savePath, new Uint8Array(pluginFileData));
    }
    async function copyFromLocal(name, from, to) {
      deps_ts_1.log.info(`copy deno plugin "${name}" from "${from}"`);
      if (!(await deps_ts_1.exists(from))) {
        throw Error(
          `copy plugin "${name}" from "${from}" failed, ${from} does not exist.`,
        );
      }
      await Deno.copyFile(from, to);
    }
    return {
      setters: [
        function (deps_ts_1_1) {
          deps_ts_1 = deps_ts_1_1;
        },
      ],
      execute: function () {
        os = Deno.build.os;
        md5 = new deps_ts_1.Hash("md5");
        PLUGIN_SUFFIX_MAP = {
          darwin: ".dylib",
          linux: ".so",
          windows: ".dll",
        };
        pluginSuffix = PLUGIN_SUFFIX_MAP[os];
      },
    };
  },
);
System.register(
  "https://deno.land/x/mongo@v0.11.1/deps",
  ["https://deno.land/x/plugin_prepare@v0.7.2/mod"],
  function (exports_26, context_26) {
    "use strict";
    var __moduleName = context_26 && context_26.id;
    return {
      setters: [
        function (mod_ts_4_1) {
          exports_26({
            "prepare": mod_ts_4_1["prepare"],
          });
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/x/mongo@v0.11.1/ts/types",
  [],
  function (exports_27, context_27) {
    "use strict";
    var CommandType, ChainBuilderPromise;
    var __moduleName = context_27 && context_27.id;
    function ObjectId($oid) {
      const isLegal = /^[0-9a-fA-F]{24}$/.test($oid);
      if (!isLegal) {
        throw new Error(`ObjectId("${$oid}") is not legal.`);
      }
      return { $oid };
    }
    exports_27("ObjectId", ObjectId);
    return {
      setters: [],
      execute: function () {
        (function (CommandType) {
          CommandType["ConnectWithUri"] = "ConnectWithUri";
          CommandType["ConnectWithOptions"] = "ConnectWithOptions";
          CommandType["Close"] = "Close";
          CommandType["ListDatabases"] = "ListDatabases";
          CommandType["ListCollectionNames"] = "ListCollectionNames";
          CommandType["Find"] = "Find";
          CommandType["InsertOne"] = "InsertOne";
          CommandType["InsertMany"] = "InsertMany";
          CommandType["Delete"] = "Delete";
          CommandType["Update"] = "Update";
          CommandType["Aggregate"] = "Aggregate";
          CommandType["Count"] = "Count";
          CommandType["CreateIndexes"] = "CreateIndexes";
          CommandType["Distinct"] = "Distinct";
        })(CommandType || (CommandType = {}));
        exports_27("CommandType", CommandType);
        ChainBuilderPromise = class ChainBuilderPromise {
          #promise;
          getPromise() {
            if (!this.#promise) {
              this.#promise = this._excutor();
            }
            return this.#promise;
          }
          async then(callback) {
            return this.getPromise().then(callback);
          }
          async catch(callback) {
            return this.getPromise().catch(callback);
          }
          async finally(callback) {
            return this.getPromise().finally(callback);
          }
        };
        exports_27("ChainBuilderPromise", ChainBuilderPromise);
      },
    };
  },
);
System.register(
  "https://deno.land/x/mongo@v0.11.1/ts/util",
  ["https://deno.land/x/mongo@v0.11.1/deps"],
  function (exports_28, context_28) {
    "use strict";
    var deps_ts_2,
      DenoCore,
      PLUGIN_NAME,
      mongoPluginId,
      decoder,
      encoder,
      pendingCommands,
      nextCommandId;
    var __moduleName = context_28 && context_28.id;
    async function init(releaseUrl) {
      const options = {
        name: PLUGIN_NAME,
        urls: {
          darwin: `${releaseUrl}/lib${PLUGIN_NAME}.dylib`,
          windows: `${releaseUrl}/${PLUGIN_NAME}.dll`,
          linux: `${releaseUrl}/lib${PLUGIN_NAME}.so`,
        },
      };
      await deps_ts_2.prepare(options);
      mongoPluginId = DenoCore.ops()["mongo_command"];
      DenoCore.setAsyncHandler(mongoPluginId, (msg) => {
        const { command_id, data, error } = JSON.parse(decoder.decode(msg));
        const command = pendingCommands.get(command_id);
        if (command) {
          if (error) {
            command.reject(new Error(error));
          } else {
            command.resolve(data);
          }
        }
      });
    }
    exports_28("init", init);
    function encode(str) {
      return encoder.encode(str);
    }
    exports_28("encode", encode);
    function decode(data) {
      return decoder.decode(data);
    }
    exports_28("decode", decode);
    function dispatch(command, ...data) {
      const control = encoder.encode(JSON.stringify(command));
      if (!mongoPluginId) {
        throw new Error("The plugin must be initialized before use");
      }
      const msg = DenoCore.dispatch(mongoPluginId, control, ...data);
      const { data: res, error } = JSON.parse(decoder.decode(msg));
      if (error) {
        throw new Error(error);
      }
      return res;
    }
    exports_28("dispatch", dispatch);
    function dispatchAsync(command, ...data) {
      return new Promise((resolve, reject) => {
        const commandId = nextCommandId++;
        pendingCommands.set(commandId, { resolve, reject });
        const control = encoder.encode(JSON.stringify({
          ...command,
          command_id: commandId,
        }));
        if (!mongoPluginId) {
          throw new Error("The plugin must be initialized before use");
        }
        DenoCore.dispatch(mongoPluginId, control, ...data);
      });
    }
    exports_28("dispatchAsync", dispatchAsync);
    return {
      setters: [
        function (deps_ts_2_1) {
          deps_ts_2 = deps_ts_2_1;
        },
      ],
      execute: function () {
        DenoCore = Deno.core;
        PLUGIN_NAME = "deno_mongo";
        decoder = new TextDecoder();
        encoder = new TextEncoder();
        pendingCommands = new Map();
        nextCommandId = 0;
      },
    };
  },
);
System.register(
  "https://deno.land/x/mongo@v0.11.1/ts/result",
  [],
  function (exports_29, context_29) {
    "use strict";
    var __moduleName = context_29 && context_29.id;
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/x/mongo@v0.11.1/ts/type_convert",
  [],
  function (exports_30, context_30) {
    "use strict";
    var __moduleName = context_30 && context_30.id;
    function convert(data) {
      if (data instanceof Array) {
        return data.map((item) => convert(item));
      }
      if (data instanceof Date) {
        return { $date: { $numberLong: data.getTime() } };
      }
      if (data instanceof Map) {
        return convert(Object.fromEntries(data));
      }
      if (data instanceof Object) {
        Object.keys(data).forEach((key) => {
          data[key] = convert(data[key]);
        });
        return data;
      }
      return data;
    }
    exports_30("convert", convert);
    function parse(data) {
      if (data instanceof Array) {
        return data.map((item) => parse(item));
      }
      if (data && typeof data === "object") {
        if (data.$date && data.$date.$numberLong) {
          return new Date(data.$date.$numberLong);
        }
        Object.keys(data).forEach((key) => {
          data[key] = parse(data[key]);
        });
        return data;
      }
      return data;
    }
    exports_30("parse", parse);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/x/mongo@v0.11.1/ts/collection",
  [
    "https://deno.land/x/mongo@v0.11.1/ts/types",
    "https://deno.land/x/mongo@v0.11.1/ts/type_convert",
    "https://deno.land/x/mongo@v0.11.1/ts/util",
  ],
  function (exports_31, context_31) {
    "use strict";
    var types_ts_1, type_convert_ts_1, util_ts_1, BSONType, Collection;
    var __moduleName = context_31 && context_31.id;
    return {
      setters: [
        function (types_ts_1_1) {
          types_ts_1 = types_ts_1_1;
        },
        function (type_convert_ts_1_1) {
          type_convert_ts_1 = type_convert_ts_1_1;
        },
        function (util_ts_1_1) {
          util_ts_1 = util_ts_1_1;
        },
      ],
      execute: function () {
        (function (BSONType) {
          BSONType[BSONType["Double"] = 1] = "Double";
          BSONType[BSONType["String"] = 2] = "String";
          BSONType[BSONType["Object"] = 3] = "Object";
          BSONType[BSONType["Array"] = 4] = "Array";
          BSONType[BSONType["BinData"] = 5] = "BinData";
          BSONType[BSONType["Undefined"] = 6] = "Undefined";
          BSONType[BSONType["ObjectId"] = 7] = "ObjectId";
          BSONType[BSONType["Boolean"] = 8] = "Boolean";
          BSONType[BSONType["Date"] = 9] = "Date";
          BSONType[BSONType["Null"] = 10] = "Null";
          BSONType[BSONType["Regex"] = 11] = "Regex";
          BSONType[BSONType["DBPointer"] = 12] = "DBPointer";
          BSONType[BSONType["JavaScript"] = 13] = "JavaScript";
          BSONType[BSONType["Symbol"] = 14] = "Symbol";
          BSONType[BSONType["JavaScriptWithScope"] = 15] =
            "JavaScriptWithScope";
          BSONType[BSONType["Int"] = 16] = "Int";
          BSONType[BSONType["Timestamp"] = 17] = "Timestamp";
          BSONType[BSONType["Long"] = 18] = "Long";
          BSONType[BSONType["Decimal"] = 19] = "Decimal";
          BSONType[BSONType["MinKey"] = -1] = "MinKey";
          BSONType[BSONType["MaxKey"] = 127] = "MaxKey";
        })(BSONType || (BSONType = {}));
        exports_31("BSONType", BSONType);
        Collection = class Collection {
          constructor(client, dbName, collectionName) {
            this.client = client;
            this.dbName = dbName;
            this.collectionName = collectionName;
          }
          async _find(filter, options) {
            const doc = await util_ts_1.dispatchAsync(
              {
                command_type: types_ts_1.CommandType.Find,
                client_id: this.client.clientId,
              },
              util_ts_1.encode(JSON.stringify({
                dbName: this.dbName,
                collectionName: this.collectionName,
                filter,
                ...options,
              })),
            );
            return doc;
          }
          async count(filter) {
            const count = await util_ts_1.dispatchAsync(
              {
                command_type: types_ts_1.CommandType.Count,
                client_id: this.client.clientId,
              },
              util_ts_1.encode(JSON.stringify({
                dbName: this.dbName,
                collectionName: this.collectionName,
                filter,
              })),
            );
            return count;
          }
          async findOne(filter) {
            return type_convert_ts_1.parse(
              await this._find(filter, { findOne: true }),
            )[0] ?? null;
          }
          find(filter, options) {
            const self = this;
            return new (class extends types_ts_1.ChainBuilderPromise {
              async _excutor() {
                return type_convert_ts_1.parse(
                  await self._find(filter, {
                    findOne: false,
                    limit: this.maxQueryLimit,
                    skip: this.skipDocCount,
                    ...options,
                  }),
                );
              }
              skip(skipCount) {
                this.skipDocCount = skipCount;
                return this;
              }
              limit(limitCount) {
                this.maxQueryLimit = limitCount;
                return this;
              }
            })();
          }
          async insertOne(doc) {
            const _id = await util_ts_1.dispatchAsync(
              {
                command_type: types_ts_1.CommandType.InsertOne,
                client_id: this.client.clientId,
              },
              util_ts_1.encode(JSON.stringify({
                dbName: this.dbName,
                collectionName: this.collectionName,
                doc: type_convert_ts_1.convert(doc),
              })),
            );
            return _id;
          }
          async insertMany(docs) {
            const _ids = await util_ts_1.dispatchAsync(
              {
                command_type: types_ts_1.CommandType.InsertMany,
                client_id: this.client.clientId,
              },
              util_ts_1.encode(JSON.stringify({
                dbName: this.dbName,
                collectionName: this.collectionName,
                docs: type_convert_ts_1.convert(docs),
              })),
            );
            return _ids;
          }
          async _delete(query, deleteOne = false) {
            const deleteCount = await util_ts_1.dispatchAsync(
              {
                command_type: types_ts_1.CommandType.Delete,
                client_id: this.client.clientId,
              },
              util_ts_1.encode(JSON.stringify({
                dbName: this.dbName,
                collectionName: this.collectionName,
                query,
                deleteOne,
              })),
            );
            return deleteCount;
          }
          deleteOne(query) {
            return this._delete(query, true);
          }
          deleteMany(query) {
            return this._delete(query, false);
          }
          async _update(query, update, updateOne = false, options) {
            const result = await util_ts_1.dispatchAsync(
              {
                command_type: types_ts_1.CommandType.Update,
                client_id: this.client.clientId,
              },
              util_ts_1.encode(JSON.stringify({
                dbName: this.dbName,
                collectionName: this.collectionName,
                query: type_convert_ts_1.convert(query),
                update: type_convert_ts_1.convert(update),
                updateOne,
                options: options ?? null,
              })),
            );
            return result;
          }
          updateOne(query, update, options) {
            return this._update(query, update, true, options);
          }
          updateMany(query, update, options) {
            return this._update(query, update, false, options);
          }
          async aggregate(pipeline) {
            const docs = await util_ts_1.dispatchAsync(
              {
                command_type: types_ts_1.CommandType.Aggregate,
                client_id: this.client.clientId,
              },
              util_ts_1.encode(JSON.stringify({
                dbName: this.dbName,
                collectionName: this.collectionName,
                pipeline,
              })),
            );
            return type_convert_ts_1.parse(docs);
          }
          async createIndexes(models) {
            const docs = await util_ts_1.dispatchAsync(
              {
                command_type: types_ts_1.CommandType.CreateIndexes,
                client_id: this.client.clientId,
              },
              util_ts_1.encode(JSON.stringify({
                dbName: this.dbName,
                collectionName: this.collectionName,
                models,
              })),
            );
            return docs;
          }
          async distinct(fieldName, filter) {
            const docs = await util_ts_1.dispatchAsync(
              {
                command_type: types_ts_1.CommandType.Distinct,
                client_id: this.client.clientId,
              },
              util_ts_1.encode(JSON.stringify({
                dbName: this.dbName,
                collectionName: this.collectionName,
                fieldName,
              })),
            );
            return type_convert_ts_1.parse(docs);
          }
        };
        exports_31("Collection", Collection);
      },
    };
  },
);
System.register(
  "https://deno.land/x/mongo@v0.11.1/ts/database",
  [
    "https://deno.land/x/mongo@v0.11.1/ts/collection",
    "https://deno.land/x/mongo@v0.11.1/ts/types",
    "https://deno.land/x/mongo@v0.11.1/ts/util",
  ],
  function (exports_32, context_32) {
    "use strict";
    var collection_ts_1, types_ts_2, util_ts_2, Database;
    var __moduleName = context_32 && context_32.id;
    return {
      setters: [
        function (collection_ts_1_1) {
          collection_ts_1 = collection_ts_1_1;
        },
        function (types_ts_2_1) {
          types_ts_2 = types_ts_2_1;
        },
        function (util_ts_2_1) {
          util_ts_2 = util_ts_2_1;
        },
      ],
      execute: function () {
        Database = class Database {
          constructor(client, name) {
            this.client = client;
            this.name = name;
          }
          async listCollectionNames() {
            const names = await util_ts_2.dispatchAsync({
              command_type: types_ts_2.CommandType.ListCollectionNames,
              client_id: this.client.clientId,
            }, util_ts_2.encode(this.name));
            return names;
          }
          collection(name) {
            return new collection_ts_1.Collection(this.client, this.name, name);
          }
        };
        exports_32("Database", Database);
      },
    };
  },
);
System.register(
  "https://deno.land/x/mongo@v0.11.1/ts/client",
  [
    "https://deno.land/x/mongo@v0.11.1/ts/database",
    "https://deno.land/x/mongo@v0.11.1/ts/types",
    "https://deno.land/x/mongo@v0.11.1/ts/util",
  ],
  function (exports_33, context_33) {
    "use strict";
    var database_ts_1, types_ts_3, util_ts_3, MongoClient;
    var __moduleName = context_33 && context_33.id;
    return {
      setters: [
        function (database_ts_1_1) {
          database_ts_1 = database_ts_1_1;
        },
        function (types_ts_3_1) {
          types_ts_3 = types_ts_3_1;
        },
        function (util_ts_3_1) {
          util_ts_3 = util_ts_3_1;
        },
      ],
      execute: function () {
        MongoClient = class MongoClient {
          constructor() {
            this._clientId = 0;
          }
          get clientId() {
            return this._clientId;
          }
          connectWithUri(uri) {
            const data = util_ts_3.dispatch(
              { command_type: types_ts_3.CommandType.ConnectWithUri },
              util_ts_3.encode(uri),
            );
            this._clientId = data.clientId;
          }
          connectWithOptions(options) {
            const data = util_ts_3.dispatch(
              { command_type: types_ts_3.CommandType.ConnectWithOptions },
              util_ts_3.encode(JSON.stringify(options)),
            );
            this._clientId = data.clientId;
          }
          async listDatabases() {
            return (await util_ts_3.dispatchAsync({
              command_type: types_ts_3.CommandType.ListDatabases,
              client_id: this._clientId,
            }));
          }
          close() {
            return util_ts_3.dispatch({
              command_type: types_ts_3.CommandType.Close,
              client_id: this._clientId,
            });
          }
          database(name) {
            return new database_ts_1.Database(this, name);
          }
        };
        exports_33("MongoClient", MongoClient);
      },
    };
  },
);
System.register(
  "https://deno.land/x/mongo@v0.11.1/mod",
  [
    "https://deno.land/x/mongo@v0.11.1/ts/util",
    "https://deno.land/x/mongo@v0.11.1/ts/client",
    "https://deno.land/x/mongo@v0.11.1/ts/collection",
    "https://deno.land/x/mongo@v0.11.1/ts/database",
    "https://deno.land/x/mongo@v0.11.1/ts/result",
    "https://deno.land/x/mongo@v0.11.1/ts/types",
  ],
  function (exports_34, context_34) {
    "use strict";
    var util_ts_4, VERSION, RELEASE_URL;
    var __moduleName = context_34 && context_34.id;
    var exportedNames_2 = {
      "VERSION": true,
      "RELEASE_URL": true,
      "ObjectId": true,
    };
    function exportStar_2(m) {
      var exports = {};
      for (var n in m) {
        if (n !== "default" && !exportedNames_2.hasOwnProperty(n)) {
          exports[n] = m[n];
        }
      }
      exports_34(exports);
    }
    return {
      setters: [
        function (util_ts_4_1) {
          util_ts_4 = util_ts_4_1;
          exportStar_2(util_ts_4_1);
        },
        function (client_ts_1_1) {
          exportStar_2(client_ts_1_1);
        },
        function (collection_ts_2_1) {
          exportStar_2(collection_ts_2_1);
        },
        function (database_ts_2_1) {
          exportStar_2(database_ts_2_1);
        },
        function (result_ts_1_1) {
          exportStar_2(result_ts_1_1);
        },
        function (types_ts_4_1) {
          exports_34({
            "ObjectId": types_ts_4_1["ObjectId"],
          });
        },
      ],
      execute: async function () {
        exports_34("VERSION", VERSION = "v0.11.1");
        exports_34(
          "RELEASE_URL",
          RELEASE_URL =
            `https://github.com/manyuanrong/deno_mongo/releases/download/${VERSION}`,
        );
        await util_ts_4.init(RELEASE_URL);
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.62.0/encoding/utf8",
  [],
  function (exports_35, context_35) {
    "use strict";
    var encoder, decoder;
    var __moduleName = context_35 && context_35.id;
    function encode(input) {
      return encoder.encode(input);
    }
    exports_35("encode", encode);
    function decode(input) {
      return decoder.decode(input);
    }
    exports_35("decode", decode);
    return {
      setters: [],
      execute: function () {
        exports_35("encoder", encoder = new TextEncoder());
        exports_35("decoder", decoder = new TextDecoder());
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.62.0/bytes/mod",
  [],
  function (exports_36, context_36) {
    "use strict";
    var __moduleName = context_36 && context_36.id;
    function findIndex(source, pat) {
      const s = pat[0];
      for (let i = 0; i < source.length; i++) {
        if (source[i] !== s) {
          continue;
        }
        const pin = i;
        let matched = 1;
        let j = i;
        while (matched < pat.length) {
          j++;
          if (source[j] !== pat[j - pin]) {
            break;
          }
          matched++;
        }
        if (matched === pat.length) {
          return pin;
        }
      }
      return -1;
    }
    exports_36("findIndex", findIndex);
    function findLastIndex(source, pat) {
      const e = pat[pat.length - 1];
      for (let i = source.length - 1; i >= 0; i--) {
        if (source[i] !== e) {
          continue;
        }
        const pin = i;
        let matched = 1;
        let j = i;
        while (matched < pat.length) {
          j--;
          if (source[j] !== pat[pat.length - 1 - (pin - j)]) {
            break;
          }
          matched++;
        }
        if (matched === pat.length) {
          return pin - pat.length + 1;
        }
      }
      return -1;
    }
    exports_36("findLastIndex", findLastIndex);
    function equal(source, match) {
      if (source.length !== match.length) {
        return false;
      }
      for (let i = 0; i < match.length; i++) {
        if (source[i] !== match[i]) {
          return false;
        }
      }
      return true;
    }
    exports_36("equal", equal);
    function hasPrefix(source, prefix) {
      for (let i = 0, max = prefix.length; i < max; i++) {
        if (source[i] !== prefix[i]) {
          return false;
        }
      }
      return true;
    }
    exports_36("hasPrefix", hasPrefix);
    function hasSuffix(source, suffix) {
      for (
        let srci = source.length - 1, sfxi = suffix.length - 1;
        sfxi >= 0;
        srci--, sfxi--
      ) {
        if (source[srci] !== suffix[sfxi]) {
          return false;
        }
      }
      return true;
    }
    exports_36("hasSuffix", hasSuffix);
    function repeat(origin, count) {
      if (count === 0) {
        return new Uint8Array();
      }
      if (count < 0) {
        throw new Error("bytes: negative repeat count");
      } else if ((origin.length * count) / count !== origin.length) {
        throw new Error("bytes: repeat count causes overflow");
      }
      const int = Math.floor(count);
      if (int !== count) {
        throw new Error("bytes: repeat count must be an integer");
      }
      const nb = new Uint8Array(origin.length * count);
      let bp = copyBytes(origin, nb);
      for (; bp < nb.length; bp *= 2) {
        copyBytes(nb.slice(0, bp), nb, bp);
      }
      return nb;
    }
    exports_36("repeat", repeat);
    function concat(origin, b) {
      const output = new Uint8Array(origin.length + b.length);
      output.set(origin, 0);
      output.set(b, origin.length);
      return output;
    }
    exports_36("concat", concat);
    function contains(source, pat) {
      return findIndex(source, pat) != -1;
    }
    exports_36("contains", contains);
    function copyBytes(src, dst, off = 0) {
      off = Math.max(0, Math.min(off, dst.byteLength));
      const dstBytesAvailable = dst.byteLength - off;
      if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
      }
      dst.set(src, off);
      return src.byteLength;
    }
    exports_36("copyBytes", copyBytes);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.62.0/_util/assert",
  [],
  function (exports_37, context_37) {
    "use strict";
    var DenoStdInternalError;
    var __moduleName = context_37 && context_37.id;
    function assert(expr, msg = "") {
      if (!expr) {
        throw new DenoStdInternalError(msg);
      }
    }
    exports_37("assert", assert);
    return {
      setters: [],
      execute: function () {
        DenoStdInternalError = class DenoStdInternalError extends Error {
          constructor(message) {
            super(message);
            this.name = "DenoStdInternalError";
          }
        };
        exports_37("DenoStdInternalError", DenoStdInternalError);
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.62.0/io/bufio",
  [
    "https://deno.land/std@0.62.0/bytes/mod",
    "https://deno.land/std@0.62.0/_util/assert",
  ],
  function (exports_38, context_38) {
    "use strict";
    var mod_ts_5,
      assert_ts_5,
      DEFAULT_BUF_SIZE,
      MIN_BUF_SIZE,
      MAX_CONSECUTIVE_EMPTY_READS,
      CR,
      LF,
      BufferFullError,
      PartialReadError,
      BufReader,
      AbstractBufBase,
      BufWriter,
      BufWriterSync;
    var __moduleName = context_38 && context_38.id;
    function createLPS(pat) {
      const lps = new Uint8Array(pat.length);
      lps[0] = 0;
      let prefixEnd = 0;
      let i = 1;
      while (i < lps.length) {
        if (pat[i] == pat[prefixEnd]) {
          prefixEnd++;
          lps[i] = prefixEnd;
          i++;
        } else if (prefixEnd === 0) {
          lps[i] = 0;
          i++;
        } else {
          prefixEnd = pat[prefixEnd - 1];
        }
      }
      return lps;
    }
    async function* readDelim(reader, delim) {
      const delimLen = delim.length;
      const delimLPS = createLPS(delim);
      let inputBuffer = new Deno.Buffer();
      const inspectArr = new Uint8Array(Math.max(1024, delimLen + 1));
      let inspectIndex = 0;
      let matchIndex = 0;
      while (true) {
        const result = await reader.read(inspectArr);
        if (result === null) {
          yield inputBuffer.bytes();
          return;
        }
        if (result < 0) {
          return;
        }
        const sliceRead = inspectArr.subarray(0, result);
        await Deno.writeAll(inputBuffer, sliceRead);
        let sliceToProcess = inputBuffer.bytes();
        while (inspectIndex < sliceToProcess.length) {
          if (sliceToProcess[inspectIndex] === delim[matchIndex]) {
            inspectIndex++;
            matchIndex++;
            if (matchIndex === delimLen) {
              const matchEnd = inspectIndex - delimLen;
              const readyBytes = sliceToProcess.subarray(0, matchEnd);
              const pendingBytes = sliceToProcess.slice(inspectIndex);
              yield readyBytes;
              sliceToProcess = pendingBytes;
              inspectIndex = 0;
              matchIndex = 0;
            }
          } else {
            if (matchIndex === 0) {
              inspectIndex++;
            } else {
              matchIndex = delimLPS[matchIndex - 1];
            }
          }
        }
        inputBuffer = new Deno.Buffer(sliceToProcess);
      }
    }
    exports_38("readDelim", readDelim);
    async function* readStringDelim(reader, delim) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      for await (const chunk of readDelim(reader, encoder.encode(delim))) {
        yield decoder.decode(chunk);
      }
    }
    exports_38("readStringDelim", readStringDelim);
    async function* readLines(reader) {
      yield* readStringDelim(reader, "\n");
    }
    exports_38("readLines", readLines);
    return {
      setters: [
        function (mod_ts_5_1) {
          mod_ts_5 = mod_ts_5_1;
        },
        function (assert_ts_5_1) {
          assert_ts_5 = assert_ts_5_1;
        },
      ],
      execute: function () {
        DEFAULT_BUF_SIZE = 4096;
        MIN_BUF_SIZE = 16;
        MAX_CONSECUTIVE_EMPTY_READS = 100;
        CR = "\r".charCodeAt(0);
        LF = "\n".charCodeAt(0);
        BufferFullError = class BufferFullError extends Error {
          constructor(partial) {
            super("Buffer full");
            this.partial = partial;
            this.name = "BufferFullError";
          }
        };
        exports_38("BufferFullError", BufferFullError);
        PartialReadError = class PartialReadError
          extends Deno.errors.UnexpectedEof {
          constructor() {
            super("Encountered UnexpectedEof, data only partially read");
            this.name = "PartialReadError";
          }
        };
        exports_38("PartialReadError", PartialReadError);
        BufReader = class BufReader {
          constructor(rd, size = DEFAULT_BUF_SIZE) {
            this.r = 0;
            this.w = 0;
            this.eof = false;
            if (size < MIN_BUF_SIZE) {
              size = MIN_BUF_SIZE;
            }
            this._reset(new Uint8Array(size), rd);
          }
          static create(r, size = DEFAULT_BUF_SIZE) {
            return r instanceof BufReader ? r : new BufReader(r, size);
          }
          size() {
            return this.buf.byteLength;
          }
          buffered() {
            return this.w - this.r;
          }
          async _fill() {
            if (this.r > 0) {
              this.buf.copyWithin(0, this.r, this.w);
              this.w -= this.r;
              this.r = 0;
            }
            if (this.w >= this.buf.byteLength) {
              throw Error("bufio: tried to fill full buffer");
            }
            for (let i = MAX_CONSECUTIVE_EMPTY_READS; i > 0; i--) {
              const rr = await this.rd.read(this.buf.subarray(this.w));
              if (rr === null) {
                this.eof = true;
                return;
              }
              assert_ts_5.assert(rr >= 0, "negative read");
              this.w += rr;
              if (rr > 0) {
                return;
              }
            }
            throw new Error(
              `No progress after ${MAX_CONSECUTIVE_EMPTY_READS} read() calls`,
            );
          }
          reset(r) {
            this._reset(this.buf, r);
          }
          _reset(buf, rd) {
            this.buf = buf;
            this.rd = rd;
            this.eof = false;
          }
          async read(p) {
            let rr = p.byteLength;
            if (p.byteLength === 0) {
              return rr;
            }
            if (this.r === this.w) {
              if (p.byteLength >= this.buf.byteLength) {
                const rr = await this.rd.read(p);
                const nread = rr ?? 0;
                assert_ts_5.assert(nread >= 0, "negative read");
                return rr;
              }
              this.r = 0;
              this.w = 0;
              rr = await this.rd.read(this.buf);
              if (rr === 0 || rr === null) {
                return rr;
              }
              assert_ts_5.assert(rr >= 0, "negative read");
              this.w += rr;
            }
            const copied = mod_ts_5.copyBytes(
              this.buf.subarray(this.r, this.w),
              p,
              0,
            );
            this.r += copied;
            return copied;
          }
          async readFull(p) {
            let bytesRead = 0;
            while (bytesRead < p.length) {
              try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                  if (bytesRead === 0) {
                    return null;
                  } else {
                    throw new PartialReadError();
                  }
                }
                bytesRead += rr;
              } catch (err) {
                err.partial = p.subarray(0, bytesRead);
                throw err;
              }
            }
            return p;
          }
          async readByte() {
            while (this.r === this.w) {
              if (this.eof) {
                return null;
              }
              await this._fill();
            }
            const c = this.buf[this.r];
            this.r++;
            return c;
          }
          async readString(delim) {
            if (delim.length !== 1) {
              throw new Error("Delimiter should be a single character");
            }
            const buffer = await this.readSlice(delim.charCodeAt(0));
            if (buffer === null) {
              return null;
            }
            return new TextDecoder().decode(buffer);
          }
          async readLine() {
            let line;
            try {
              line = await this.readSlice(LF);
            } catch (err) {
              let { partial } = err;
              assert_ts_5.assert(
                partial instanceof Uint8Array,
                "bufio: caught error from `readSlice()` without `partial` property",
              );
              if (!(err instanceof BufferFullError)) {
                throw err;
              }
              if (
                !this.eof &&
                partial.byteLength > 0 &&
                partial[partial.byteLength - 1] === CR
              ) {
                assert_ts_5.assert(
                  this.r > 0,
                  "bufio: tried to rewind past start of buffer",
                );
                this.r--;
                partial = partial.subarray(0, partial.byteLength - 1);
              }
              return { line: partial, more: !this.eof };
            }
            if (line === null) {
              return null;
            }
            if (line.byteLength === 0) {
              return { line, more: false };
            }
            if (line[line.byteLength - 1] == LF) {
              let drop = 1;
              if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                drop = 2;
              }
              line = line.subarray(0, line.byteLength - drop);
            }
            return { line, more: false };
          }
          async readSlice(delim) {
            let s = 0;
            let slice;
            while (true) {
              let i = this.buf.subarray(this.r + s, this.w).indexOf(delim);
              if (i >= 0) {
                i += s;
                slice = this.buf.subarray(this.r, this.r + i + 1);
                this.r += i + 1;
                break;
              }
              if (this.eof) {
                if (this.r === this.w) {
                  return null;
                }
                slice = this.buf.subarray(this.r, this.w);
                this.r = this.w;
                break;
              }
              if (this.buffered() >= this.buf.byteLength) {
                this.r = this.w;
                const oldbuf = this.buf;
                const newbuf = this.buf.slice(0);
                this.buf = newbuf;
                throw new BufferFullError(oldbuf);
              }
              s = this.w - this.r;
              try {
                await this._fill();
              } catch (err) {
                err.partial = slice;
                throw err;
              }
            }
            return slice;
          }
          async peek(n) {
            if (n < 0) {
              throw Error("negative count");
            }
            let avail = this.w - this.r;
            while (avail < n && avail < this.buf.byteLength && !this.eof) {
              try {
                await this._fill();
              } catch (err) {
                err.partial = this.buf.subarray(this.r, this.w);
                throw err;
              }
              avail = this.w - this.r;
            }
            if (avail === 0 && this.eof) {
              return null;
            } else if (avail < n && this.eof) {
              return this.buf.subarray(this.r, this.r + avail);
            } else if (avail < n) {
              throw new BufferFullError(this.buf.subarray(this.r, this.w));
            }
            return this.buf.subarray(this.r, this.r + n);
          }
        };
        exports_38("BufReader", BufReader);
        AbstractBufBase = class AbstractBufBase {
          constructor() {
            this.usedBufferBytes = 0;
            this.err = null;
          }
          size() {
            return this.buf.byteLength;
          }
          available() {
            return this.buf.byteLength - this.usedBufferBytes;
          }
          buffered() {
            return this.usedBufferBytes;
          }
        };
        BufWriter = class BufWriter extends AbstractBufBase {
          constructor(writer, size = DEFAULT_BUF_SIZE) {
            super();
            this.writer = writer;
            if (size <= 0) {
              size = DEFAULT_BUF_SIZE;
            }
            this.buf = new Uint8Array(size);
          }
          static create(writer, size = DEFAULT_BUF_SIZE) {
            return writer instanceof BufWriter
              ? writer
              : new BufWriter(writer, size);
          }
          reset(w) {
            this.err = null;
            this.usedBufferBytes = 0;
            this.writer = w;
          }
          async flush() {
            if (this.err !== null) {
              throw this.err;
            }
            if (this.usedBufferBytes === 0) {
              return;
            }
            try {
              await Deno.writeAll(
                this.writer,
                this.buf.subarray(0, this.usedBufferBytes),
              );
            } catch (e) {
              this.err = e;
              throw e;
            }
            this.buf = new Uint8Array(this.buf.length);
            this.usedBufferBytes = 0;
          }
          async write(data) {
            if (this.err !== null) {
              throw this.err;
            }
            if (data.length === 0) {
              return 0;
            }
            let totalBytesWritten = 0;
            let numBytesWritten = 0;
            while (data.byteLength > this.available()) {
              if (this.buffered() === 0) {
                try {
                  numBytesWritten = await this.writer.write(data);
                } catch (e) {
                  this.err = e;
                  throw e;
                }
              } else {
                numBytesWritten = mod_ts_5.copyBytes(
                  data,
                  this.buf,
                  this.usedBufferBytes,
                );
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
              }
              totalBytesWritten += numBytesWritten;
              data = data.subarray(numBytesWritten);
            }
            numBytesWritten = mod_ts_5.copyBytes(
              data,
              this.buf,
              this.usedBufferBytes,
            );
            this.usedBufferBytes += numBytesWritten;
            totalBytesWritten += numBytesWritten;
            return totalBytesWritten;
          }
        };
        exports_38("BufWriter", BufWriter);
        BufWriterSync = class BufWriterSync extends AbstractBufBase {
          constructor(writer, size = DEFAULT_BUF_SIZE) {
            super();
            this.writer = writer;
            if (size <= 0) {
              size = DEFAULT_BUF_SIZE;
            }
            this.buf = new Uint8Array(size);
          }
          static create(writer, size = DEFAULT_BUF_SIZE) {
            return writer instanceof BufWriterSync
              ? writer
              : new BufWriterSync(writer, size);
          }
          reset(w) {
            this.err = null;
            this.usedBufferBytes = 0;
            this.writer = w;
          }
          flush() {
            if (this.err !== null) {
              throw this.err;
            }
            if (this.usedBufferBytes === 0) {
              return;
            }
            try {
              Deno.writeAllSync(
                this.writer,
                this.buf.subarray(0, this.usedBufferBytes),
              );
            } catch (e) {
              this.err = e;
              throw e;
            }
            this.buf = new Uint8Array(this.buf.length);
            this.usedBufferBytes = 0;
          }
          writeSync(data) {
            if (this.err !== null) {
              throw this.err;
            }
            if (data.length === 0) {
              return 0;
            }
            let totalBytesWritten = 0;
            let numBytesWritten = 0;
            while (data.byteLength > this.available()) {
              if (this.buffered() === 0) {
                try {
                  numBytesWritten = this.writer.writeSync(data);
                } catch (e) {
                  this.err = e;
                  throw e;
                }
              } else {
                numBytesWritten = mod_ts_5.copyBytes(
                  data,
                  this.buf,
                  this.usedBufferBytes,
                );
                this.usedBufferBytes += numBytesWritten;
                this.flush();
              }
              totalBytesWritten += numBytesWritten;
              data = data.subarray(numBytesWritten);
            }
            numBytesWritten = mod_ts_5.copyBytes(
              data,
              this.buf,
              this.usedBufferBytes,
            );
            this.usedBufferBytes += numBytesWritten;
            totalBytesWritten += numBytesWritten;
            return totalBytesWritten;
          }
        };
        exports_38("BufWriterSync", BufWriterSync);
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.62.0/async/deferred",
  [],
  function (exports_39, context_39) {
    "use strict";
    var __moduleName = context_39 && context_39.id;
    function deferred() {
      let methods;
      const promise = new Promise((resolve, reject) => {
        methods = { resolve, reject };
      });
      return Object.assign(promise, methods);
    }
    exports_39("deferred", deferred);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.62.0/async/delay",
  [],
  function (exports_40, context_40) {
    "use strict";
    var __moduleName = context_40 && context_40.id;
    function delay(ms) {
      return new Promise((res) =>
        setTimeout(() => {
          res();
        }, ms)
      );
    }
    exports_40("delay", delay);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.62.0/async/mux_async_iterator",
  ["https://deno.land/std@0.62.0/async/deferred"],
  function (exports_41, context_41) {
    "use strict";
    var deferred_ts_1, MuxAsyncIterator;
    var __moduleName = context_41 && context_41.id;
    return {
      setters: [
        function (deferred_ts_1_1) {
          deferred_ts_1 = deferred_ts_1_1;
        },
      ],
      execute: function () {
        MuxAsyncIterator = class MuxAsyncIterator {
          constructor() {
            this.iteratorCount = 0;
            this.yields = [];
            this.throws = [];
            this.signal = deferred_ts_1.deferred();
          }
          add(iterator) {
            ++this.iteratorCount;
            this.callIteratorNext(iterator);
          }
          async callIteratorNext(iterator) {
            try {
              const { value, done } = await iterator.next();
              if (done) {
                --this.iteratorCount;
              } else {
                this.yields.push({ iterator, value });
              }
            } catch (e) {
              this.throws.push(e);
            }
            this.signal.resolve();
          }
          async *iterate() {
            while (this.iteratorCount > 0) {
              await this.signal;
              for (let i = 0; i < this.yields.length; i++) {
                const { iterator, value } = this.yields[i];
                yield value;
                this.callIteratorNext(iterator);
              }
              if (this.throws.length) {
                for (const e of this.throws) {
                  throw e;
                }
                this.throws.length = 0;
              }
              this.yields.length = 0;
              this.signal = deferred_ts_1.deferred();
            }
          }
          [Symbol.asyncIterator]() {
            return this.iterate();
          }
        };
        exports_41("MuxAsyncIterator", MuxAsyncIterator);
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.62.0/async/mod",
  [
    "https://deno.land/std@0.62.0/async/deferred",
    "https://deno.land/std@0.62.0/async/delay",
    "https://deno.land/std@0.62.0/async/mux_async_iterator",
  ],
  function (exports_42, context_42) {
    "use strict";
    var __moduleName = context_42 && context_42.id;
    function exportStar_3(m) {
      var exports = {};
      for (var n in m) {
        if (n !== "default") exports[n] = m[n];
      }
      exports_42(exports);
    }
    return {
      setters: [
        function (deferred_ts_2_1) {
          exportStar_3(deferred_ts_2_1);
        },
        function (delay_ts_1_1) {
          exportStar_3(delay_ts_1_1);
        },
        function (mux_async_iterator_ts_1_1) {
          exportStar_3(mux_async_iterator_ts_1_1);
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.62.0/textproto/mod",
  [
    "https://deno.land/std@0.62.0/bytes/mod",
    "https://deno.land/std@0.62.0/encoding/utf8",
  ],
  function (exports_43, context_43) {
    "use strict";
    var mod_ts_6, utf8_ts_1, invalidHeaderCharRegex, TextProtoReader;
    var __moduleName = context_43 && context_43.id;
    function str(buf) {
      if (buf == null) {
        return "";
      } else {
        return utf8_ts_1.decode(buf);
      }
    }
    function charCode(s) {
      return s.charCodeAt(0);
    }
    return {
      setters: [
        function (mod_ts_6_1) {
          mod_ts_6 = mod_ts_6_1;
        },
        function (utf8_ts_1_1) {
          utf8_ts_1 = utf8_ts_1_1;
        },
      ],
      execute: function () {
        invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/g;
        TextProtoReader = class TextProtoReader {
          constructor(r) {
            this.r = r;
          }
          async readLine() {
            const s = await this.readLineSlice();
            if (s === null) {
              return null;
            }
            return str(s);
          }
          async readMIMEHeader() {
            const m = new Headers();
            let line;
            let buf = await this.r.peek(1);
            if (buf === null) {
              return null;
            } else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
              line = (await this.readLineSlice());
            }
            buf = await this.r.peek(1);
            if (buf === null) {
              throw new Deno.errors.UnexpectedEof();
            } else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
              throw new Deno.errors.InvalidData(
                `malformed MIME header initial line: ${str(line)}`,
              );
            }
            while (true) {
              const kv = await this.readLineSlice();
              if (kv === null) {
                throw new Deno.errors.UnexpectedEof();
              }
              if (kv.byteLength === 0) {
                return m;
              }
              let i = kv.indexOf(charCode(":"));
              if (i < 0) {
                throw new Deno.errors.InvalidData(
                  `malformed MIME header line: ${str(kv)}`,
                );
              }
              const key = str(kv.subarray(0, i));
              if (key == "") {
                continue;
              }
              i++;
              while (
                i < kv.byteLength &&
                (kv[i] == charCode(" ") || kv[i] == charCode("\t"))
              ) {
                i++;
              }
              const value = str(kv.subarray(i)).replace(
                invalidHeaderCharRegex,
                encodeURI,
              );
              try {
                m.append(key, value);
              } catch {
              }
            }
          }
          async readLineSlice() {
            let line;
            while (true) {
              const r = await this.r.readLine();
              if (r === null) {
                return null;
              }
              const { line: l, more } = r;
              if (!line && !more) {
                if (this.skipSpace(l) === 0) {
                  return new Uint8Array(0);
                }
                return l;
              }
              line = line ? mod_ts_6.concat(line, l) : l;
              if (!more) {
                break;
              }
            }
            return line;
          }
          skipSpace(l) {
            let n = 0;
            for (let i = 0; i < l.length; i++) {
              if (l[i] === charCode(" ") || l[i] === charCode("\t")) {
                continue;
              }
              n++;
            }
            return n;
          }
        };
        exports_43("TextProtoReader", TextProtoReader);
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.62.0/http/http_status",
  [],
  function (exports_44, context_44) {
    "use strict";
    var Status, STATUS_TEXT;
    var __moduleName = context_44 && context_44.id;
    return {
      setters: [],
      execute: function () {
        (function (Status) {
          Status[Status["Continue"] = 100] = "Continue";
          Status[Status["SwitchingProtocols"] = 101] = "SwitchingProtocols";
          Status[Status["Processing"] = 102] = "Processing";
          Status[Status["EarlyHints"] = 103] = "EarlyHints";
          Status[Status["OK"] = 200] = "OK";
          Status[Status["Created"] = 201] = "Created";
          Status[Status["Accepted"] = 202] = "Accepted";
          Status[Status["NonAuthoritativeInfo"] = 203] = "NonAuthoritativeInfo";
          Status[Status["NoContent"] = 204] = "NoContent";
          Status[Status["ResetContent"] = 205] = "ResetContent";
          Status[Status["PartialContent"] = 206] = "PartialContent";
          Status[Status["MultiStatus"] = 207] = "MultiStatus";
          Status[Status["AlreadyReported"] = 208] = "AlreadyReported";
          Status[Status["IMUsed"] = 226] = "IMUsed";
          Status[Status["MultipleChoices"] = 300] = "MultipleChoices";
          Status[Status["MovedPermanently"] = 301] = "MovedPermanently";
          Status[Status["Found"] = 302] = "Found";
          Status[Status["SeeOther"] = 303] = "SeeOther";
          Status[Status["NotModified"] = 304] = "NotModified";
          Status[Status["UseProxy"] = 305] = "UseProxy";
          Status[Status["TemporaryRedirect"] = 307] = "TemporaryRedirect";
          Status[Status["PermanentRedirect"] = 308] = "PermanentRedirect";
          Status[Status["BadRequest"] = 400] = "BadRequest";
          Status[Status["Unauthorized"] = 401] = "Unauthorized";
          Status[Status["PaymentRequired"] = 402] = "PaymentRequired";
          Status[Status["Forbidden"] = 403] = "Forbidden";
          Status[Status["NotFound"] = 404] = "NotFound";
          Status[Status["MethodNotAllowed"] = 405] = "MethodNotAllowed";
          Status[Status["NotAcceptable"] = 406] = "NotAcceptable";
          Status[Status["ProxyAuthRequired"] = 407] = "ProxyAuthRequired";
          Status[Status["RequestTimeout"] = 408] = "RequestTimeout";
          Status[Status["Conflict"] = 409] = "Conflict";
          Status[Status["Gone"] = 410] = "Gone";
          Status[Status["LengthRequired"] = 411] = "LengthRequired";
          Status[Status["PreconditionFailed"] = 412] = "PreconditionFailed";
          Status[Status["RequestEntityTooLarge"] = 413] =
            "RequestEntityTooLarge";
          Status[Status["RequestURITooLong"] = 414] = "RequestURITooLong";
          Status[Status["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
          Status[Status["RequestedRangeNotSatisfiable"] = 416] =
            "RequestedRangeNotSatisfiable";
          Status[Status["ExpectationFailed"] = 417] = "ExpectationFailed";
          Status[Status["Teapot"] = 418] = "Teapot";
          Status[Status["MisdirectedRequest"] = 421] = "MisdirectedRequest";
          Status[Status["UnprocessableEntity"] = 422] = "UnprocessableEntity";
          Status[Status["Locked"] = 423] = "Locked";
          Status[Status["FailedDependency"] = 424] = "FailedDependency";
          Status[Status["TooEarly"] = 425] = "TooEarly";
          Status[Status["UpgradeRequired"] = 426] = "UpgradeRequired";
          Status[Status["PreconditionRequired"] = 428] = "PreconditionRequired";
          Status[Status["TooManyRequests"] = 429] = "TooManyRequests";
          Status[Status["RequestHeaderFieldsTooLarge"] = 431] =
            "RequestHeaderFieldsTooLarge";
          Status[Status["UnavailableForLegalReasons"] = 451] =
            "UnavailableForLegalReasons";
          Status[Status["InternalServerError"] = 500] = "InternalServerError";
          Status[Status["NotImplemented"] = 501] = "NotImplemented";
          Status[Status["BadGateway"] = 502] = "BadGateway";
          Status[Status["ServiceUnavailable"] = 503] = "ServiceUnavailable";
          Status[Status["GatewayTimeout"] = 504] = "GatewayTimeout";
          Status[Status["HTTPVersionNotSupported"] = 505] =
            "HTTPVersionNotSupported";
          Status[Status["VariantAlsoNegotiates"] = 506] =
            "VariantAlsoNegotiates";
          Status[Status["InsufficientStorage"] = 507] = "InsufficientStorage";
          Status[Status["LoopDetected"] = 508] = "LoopDetected";
          Status[Status["NotExtended"] = 510] = "NotExtended";
          Status[Status["NetworkAuthenticationRequired"] = 511] =
            "NetworkAuthenticationRequired";
        })(Status || (Status = {}));
        exports_44("Status", Status);
        exports_44(
          "STATUS_TEXT",
          STATUS_TEXT = new Map([
            [Status.Continue, "Continue"],
            [Status.SwitchingProtocols, "Switching Protocols"],
            [Status.Processing, "Processing"],
            [Status.EarlyHints, "Early Hints"],
            [Status.OK, "OK"],
            [Status.Created, "Created"],
            [Status.Accepted, "Accepted"],
            [Status.NonAuthoritativeInfo, "Non-Authoritative Information"],
            [Status.NoContent, "No Content"],
            [Status.ResetContent, "Reset Content"],
            [Status.PartialContent, "Partial Content"],
            [Status.MultiStatus, "Multi-Status"],
            [Status.AlreadyReported, "Already Reported"],
            [Status.IMUsed, "IM Used"],
            [Status.MultipleChoices, "Multiple Choices"],
            [Status.MovedPermanently, "Moved Permanently"],
            [Status.Found, "Found"],
            [Status.SeeOther, "See Other"],
            [Status.NotModified, "Not Modified"],
            [Status.UseProxy, "Use Proxy"],
            [Status.TemporaryRedirect, "Temporary Redirect"],
            [Status.PermanentRedirect, "Permanent Redirect"],
            [Status.BadRequest, "Bad Request"],
            [Status.Unauthorized, "Unauthorized"],
            [Status.PaymentRequired, "Payment Required"],
            [Status.Forbidden, "Forbidden"],
            [Status.NotFound, "Not Found"],
            [Status.MethodNotAllowed, "Method Not Allowed"],
            [Status.NotAcceptable, "Not Acceptable"],
            [Status.ProxyAuthRequired, "Proxy Authentication Required"],
            [Status.RequestTimeout, "Request Timeout"],
            [Status.Conflict, "Conflict"],
            [Status.Gone, "Gone"],
            [Status.LengthRequired, "Length Required"],
            [Status.PreconditionFailed, "Precondition Failed"],
            [Status.RequestEntityTooLarge, "Request Entity Too Large"],
            [Status.RequestURITooLong, "Request URI Too Long"],
            [Status.UnsupportedMediaType, "Unsupported Media Type"],
            [
              Status.RequestedRangeNotSatisfiable,
              "Requested Range Not Satisfiable",
            ],
            [Status.ExpectationFailed, "Expectation Failed"],
            [Status.Teapot, "I'm a teapot"],
            [Status.MisdirectedRequest, "Misdirected Request"],
            [Status.UnprocessableEntity, "Unprocessable Entity"],
            [Status.Locked, "Locked"],
            [Status.FailedDependency, "Failed Dependency"],
            [Status.TooEarly, "Too Early"],
            [Status.UpgradeRequired, "Upgrade Required"],
            [Status.PreconditionRequired, "Precondition Required"],
            [Status.TooManyRequests, "Too Many Requests"],
            [
              Status.RequestHeaderFieldsTooLarge,
              "Request Header Fields Too Large",
            ],
            [
              Status.UnavailableForLegalReasons,
              "Unavailable For Legal Reasons",
            ],
            [Status.InternalServerError, "Internal Server Error"],
            [Status.NotImplemented, "Not Implemented"],
            [Status.BadGateway, "Bad Gateway"],
            [Status.ServiceUnavailable, "Service Unavailable"],
            [Status.GatewayTimeout, "Gateway Timeout"],
            [Status.HTTPVersionNotSupported, "HTTP Version Not Supported"],
            [Status.VariantAlsoNegotiates, "Variant Also Negotiates"],
            [Status.InsufficientStorage, "Insufficient Storage"],
            [Status.LoopDetected, "Loop Detected"],
            [Status.NotExtended, "Not Extended"],
            [
              Status.NetworkAuthenticationRequired,
              "Network Authentication Required",
            ],
          ]),
        );
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.62.0/http/_io",
  [
    "https://deno.land/std@0.62.0/io/bufio",
    "https://deno.land/std@0.62.0/textproto/mod",
    "https://deno.land/std@0.62.0/_util/assert",
    "https://deno.land/std@0.62.0/encoding/utf8",
    "https://deno.land/std@0.62.0/http/server",
    "https://deno.land/std@0.62.0/http/http_status",
  ],
  function (exports_45, context_45) {
    "use strict";
    var bufio_ts_2,
      mod_ts_7,
      assert_ts_6,
      utf8_ts_2,
      server_ts_1,
      http_status_ts_1;
    var __moduleName = context_45 && context_45.id;
    function emptyReader() {
      return {
        read(_) {
          return Promise.resolve(null);
        },
      };
    }
    exports_45("emptyReader", emptyReader);
    function bodyReader(contentLength, r) {
      let totalRead = 0;
      let finished = false;
      async function read(buf) {
        if (finished) {
          return null;
        }
        let result;
        const remaining = contentLength - totalRead;
        if (remaining >= buf.byteLength) {
          result = await r.read(buf);
        } else {
          const readBuf = buf.subarray(0, remaining);
          result = await r.read(readBuf);
        }
        if (result !== null) {
          totalRead += result;
        }
        finished = totalRead === contentLength;
        return result;
      }
      return { read };
    }
    exports_45("bodyReader", bodyReader);
    function chunkedBodyReader(h, r) {
      const tp = new mod_ts_7.TextProtoReader(r);
      let finished = false;
      const chunks = [];
      async function read(buf) {
        if (finished) {
          return null;
        }
        const [chunk] = chunks;
        if (chunk) {
          const chunkRemaining = chunk.data.byteLength - chunk.offset;
          const readLength = Math.min(chunkRemaining, buf.byteLength);
          for (let i = 0; i < readLength; i++) {
            buf[i] = chunk.data[chunk.offset + i];
          }
          chunk.offset += readLength;
          if (chunk.offset === chunk.data.byteLength) {
            chunks.shift();
            if ((await tp.readLine()) === null) {
              throw new Deno.errors.UnexpectedEof();
            }
          }
          return readLength;
        }
        const line = await tp.readLine();
        if (line === null) {
          throw new Deno.errors.UnexpectedEof();
        }
        const [chunkSizeString] = line.split(";");
        const chunkSize = parseInt(chunkSizeString, 16);
        if (Number.isNaN(chunkSize) || chunkSize < 0) {
          throw new Error("Invalid chunk size");
        }
        if (chunkSize > 0) {
          if (chunkSize > buf.byteLength) {
            let eof = await r.readFull(buf);
            if (eof === null) {
              throw new Deno.errors.UnexpectedEof();
            }
            const restChunk = new Uint8Array(chunkSize - buf.byteLength);
            eof = await r.readFull(restChunk);
            if (eof === null) {
              throw new Deno.errors.UnexpectedEof();
            } else {
              chunks.push({
                offset: 0,
                data: restChunk,
              });
            }
            return buf.byteLength;
          } else {
            const bufToFill = buf.subarray(0, chunkSize);
            const eof = await r.readFull(bufToFill);
            if (eof === null) {
              throw new Deno.errors.UnexpectedEof();
            }
            if ((await tp.readLine()) === null) {
              throw new Deno.errors.UnexpectedEof();
            }
            return chunkSize;
          }
        } else {
          assert_ts_6.assert(chunkSize === 0);
          if ((await r.readLine()) === null) {
            throw new Deno.errors.UnexpectedEof();
          }
          await readTrailers(h, r);
          finished = true;
          return null;
        }
      }
      return { read };
    }
    exports_45("chunkedBodyReader", chunkedBodyReader);
    function isProhibidedForTrailer(key) {
      const s = new Set(["transfer-encoding", "content-length", "trailer"]);
      return s.has(key.toLowerCase());
    }
    async function readTrailers(headers, r) {
      const trailers = parseTrailer(headers.get("trailer"));
      if (trailers == null) {
        return;
      }
      const trailerNames = [...trailers.keys()];
      const tp = new mod_ts_7.TextProtoReader(r);
      const result = await tp.readMIMEHeader();
      if (result == null) {
        throw new Deno.errors.InvalidData("Missing trailer header.");
      }
      const undeclared = [...result.keys()].filter((k) =>
        !trailerNames.includes(k)
      );
      if (undeclared.length > 0) {
        throw new Deno.errors.InvalidData(
          `Undeclared trailers: ${Deno.inspect(undeclared)}.`,
        );
      }
      for (const [k, v] of result) {
        headers.append(k, v);
      }
      const missingTrailers = trailerNames.filter((k) => !result.has(k));
      if (missingTrailers.length > 0) {
        throw new Deno.errors.InvalidData(
          `Missing trailers: ${Deno.inspect(missingTrailers)}.`,
        );
      }
      headers.delete("trailer");
    }
    exports_45("readTrailers", readTrailers);
    function parseTrailer(field) {
      if (field == null) {
        return undefined;
      }
      const trailerNames = field.split(",").map((v) => v.trim().toLowerCase());
      if (trailerNames.length === 0) {
        throw new Deno.errors.InvalidData("Empty trailer header.");
      }
      const prohibited = trailerNames.filter((k) => isProhibidedForTrailer(k));
      if (prohibited.length > 0) {
        throw new Deno.errors.InvalidData(
          `Prohibited trailer names: ${Deno.inspect(prohibited)}.`,
        );
      }
      return new Headers(trailerNames.map((key) => [key, ""]));
    }
    async function writeChunkedBody(w, r) {
      const writer = bufio_ts_2.BufWriter.create(w);
      for await (const chunk of Deno.iter(r)) {
        if (chunk.byteLength <= 0) {
          continue;
        }
        const start = utf8_ts_2.encoder.encode(
          `${chunk.byteLength.toString(16)}\r\n`,
        );
        const end = utf8_ts_2.encoder.encode("\r\n");
        await writer.write(start);
        await writer.write(chunk);
        await writer.write(end);
      }
      const endChunk = utf8_ts_2.encoder.encode("0\r\n\r\n");
      await writer.write(endChunk);
    }
    exports_45("writeChunkedBody", writeChunkedBody);
    async function writeTrailers(w, headers, trailers) {
      const trailer = headers.get("trailer");
      if (trailer === null) {
        throw new TypeError("Missing trailer header.");
      }
      const transferEncoding = headers.get("transfer-encoding");
      if (transferEncoding === null || !transferEncoding.match(/^chunked/)) {
        throw new TypeError(
          `Trailers are only allowed for "transfer-encoding: chunked", got "transfer-encoding: ${transferEncoding}".`,
        );
      }
      const writer = bufio_ts_2.BufWriter.create(w);
      const trailerNames = trailer.split(",").map((s) =>
        s.trim().toLowerCase()
      );
      const prohibitedTrailers = trailerNames.filter((k) =>
        isProhibidedForTrailer(k)
      );
      if (prohibitedTrailers.length > 0) {
        throw new TypeError(
          `Prohibited trailer names: ${Deno.inspect(prohibitedTrailers)}.`,
        );
      }
      const undeclared = [...trailers.keys()].filter((k) =>
        !trailerNames.includes(k)
      );
      if (undeclared.length > 0) {
        throw new TypeError(
          `Undeclared trailers: ${Deno.inspect(undeclared)}.`,
        );
      }
      for (const [key, value] of trailers) {
        await writer.write(utf8_ts_2.encoder.encode(`${key}: ${value}\r\n`));
      }
      await writer.write(utf8_ts_2.encoder.encode("\r\n"));
      await writer.flush();
    }
    exports_45("writeTrailers", writeTrailers);
    async function writeResponse(w, r) {
      const protoMajor = 1;
      const protoMinor = 1;
      const statusCode = r.status || 200;
      const statusText = http_status_ts_1.STATUS_TEXT.get(statusCode);
      const writer = bufio_ts_2.BufWriter.create(w);
      if (!statusText) {
        throw new Deno.errors.InvalidData("Bad status code");
      }
      if (!r.body) {
        r.body = new Uint8Array();
      }
      if (typeof r.body === "string") {
        r.body = utf8_ts_2.encoder.encode(r.body);
      }
      let out =
        `HTTP/${protoMajor}.${protoMinor} ${statusCode} ${statusText}\r\n`;
      const headers = r.headers ?? new Headers();
      if (r.body && !headers.get("content-length")) {
        if (r.body instanceof Uint8Array) {
          out += `content-length: ${r.body.byteLength}\r\n`;
        } else if (!headers.get("transfer-encoding")) {
          out += "transfer-encoding: chunked\r\n";
        }
      }
      for (const [key, value] of headers) {
        out += `${key}: ${value}\r\n`;
      }
      out += `\r\n`;
      const header = utf8_ts_2.encoder.encode(out);
      const n = await writer.write(header);
      assert_ts_6.assert(n === header.byteLength);
      if (r.body instanceof Uint8Array) {
        const n = await writer.write(r.body);
        assert_ts_6.assert(n === r.body.byteLength);
      } else if (headers.has("content-length")) {
        const contentLength = headers.get("content-length");
        assert_ts_6.assert(contentLength != null);
        const bodyLength = parseInt(contentLength);
        const n = await Deno.copy(r.body, writer);
        assert_ts_6.assert(n === bodyLength);
      } else {
        await writeChunkedBody(writer, r.body);
      }
      if (r.trailers) {
        const t = await r.trailers();
        await writeTrailers(writer, headers, t);
      }
      await writer.flush();
    }
    exports_45("writeResponse", writeResponse);
    function parseHTTPVersion(vers) {
      switch (vers) {
        case "HTTP/1.1":
          return [1, 1];
        case "HTTP/1.0":
          return [1, 0];
        default: {
          const Big = 1000000;
          if (!vers.startsWith("HTTP/")) {
            break;
          }
          const dot = vers.indexOf(".");
          if (dot < 0) {
            break;
          }
          const majorStr = vers.substring(vers.indexOf("/") + 1, dot);
          const major = Number(majorStr);
          if (!Number.isInteger(major) || major < 0 || major > Big) {
            break;
          }
          const minorStr = vers.substring(dot + 1);
          const minor = Number(minorStr);
          if (!Number.isInteger(minor) || minor < 0 || minor > Big) {
            break;
          }
          return [major, minor];
        }
      }
      throw new Error(`malformed HTTP version ${vers}`);
    }
    exports_45("parseHTTPVersion", parseHTTPVersion);
    async function readRequest(conn, bufr) {
      const tp = new mod_ts_7.TextProtoReader(bufr);
      const firstLine = await tp.readLine();
      if (firstLine === null) {
        return null;
      }
      const headers = await tp.readMIMEHeader();
      if (headers === null) {
        throw new Deno.errors.UnexpectedEof();
      }
      const req = new server_ts_1.ServerRequest();
      req.conn = conn;
      req.r = bufr;
      [req.method, req.url, req.proto] = firstLine.split(" ", 3);
      [req.protoMinor, req.protoMajor] = parseHTTPVersion(req.proto);
      req.headers = headers;
      fixLength(req);
      return req;
    }
    exports_45("readRequest", readRequest);
    function fixLength(req) {
      const contentLength = req.headers.get("Content-Length");
      if (contentLength) {
        const arrClen = contentLength.split(",");
        if (arrClen.length > 1) {
          const distinct = [...new Set(arrClen.map((e) => e.trim()))];
          if (distinct.length > 1) {
            throw Error("cannot contain multiple Content-Length headers");
          } else {
            req.headers.set("Content-Length", distinct[0]);
          }
        }
        const c = req.headers.get("Content-Length");
        if (req.method === "HEAD" && c && c !== "0") {
          throw Error("http: method cannot contain a Content-Length");
        }
        if (c && req.headers.has("transfer-encoding")) {
          throw new Error(
            "http: Transfer-Encoding and Content-Length cannot be send together",
          );
        }
      }
    }
    return {
      setters: [
        function (bufio_ts_2_1) {
          bufio_ts_2 = bufio_ts_2_1;
        },
        function (mod_ts_7_1) {
          mod_ts_7 = mod_ts_7_1;
        },
        function (assert_ts_6_1) {
          assert_ts_6 = assert_ts_6_1;
        },
        function (utf8_ts_2_1) {
          utf8_ts_2 = utf8_ts_2_1;
        },
        function (server_ts_1_1) {
          server_ts_1 = server_ts_1_1;
        },
        function (http_status_ts_1_1) {
          http_status_ts_1 = http_status_ts_1_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std@0.62.0/http/server",
  [
    "https://deno.land/std@0.62.0/encoding/utf8",
    "https://deno.land/std@0.62.0/io/bufio",
    "https://deno.land/std@0.62.0/_util/assert",
    "https://deno.land/std@0.62.0/async/mod",
    "https://deno.land/std@0.62.0/http/_io",
  ],
  function (exports_46, context_46) {
    "use strict";
    var utf8_ts_3,
      bufio_ts_3,
      assert_ts_7,
      mod_ts_8,
      _io_ts_1,
      ServerRequest,
      Server;
    var __moduleName = context_46 && context_46.id;
    function _parseAddrFromStr(addr) {
      let url;
      try {
        const host = addr.startsWith(":") ? `0.0.0.0${addr}` : addr;
        url = new URL(`http://${host}`);
      } catch {
        throw new TypeError("Invalid address.");
      }
      if (
        url.username ||
        url.password ||
        url.pathname != "/" ||
        url.search ||
        url.hash
      ) {
        throw new TypeError("Invalid address.");
      }
      return {
        hostname: url.hostname,
        port: url.port === "" ? 80 : Number(url.port),
      };
    }
    exports_46("_parseAddrFromStr", _parseAddrFromStr);
    function serve(addr) {
      if (typeof addr === "string") {
        addr = _parseAddrFromStr(addr);
      }
      const listener = Deno.listen(addr);
      return new Server(listener);
    }
    exports_46("serve", serve);
    async function listenAndServe(addr, handler) {
      const server = serve(addr);
      for await (const request of server) {
        handler(request);
      }
    }
    exports_46("listenAndServe", listenAndServe);
    function serveTLS(options) {
      const tlsOptions = {
        ...options,
        transport: "tcp",
      };
      const listener = Deno.listenTls(tlsOptions);
      return new Server(listener);
    }
    exports_46("serveTLS", serveTLS);
    async function listenAndServeTLS(options, handler) {
      const server = serveTLS(options);
      for await (const request of server) {
        handler(request);
      }
    }
    exports_46("listenAndServeTLS", listenAndServeTLS);
    return {
      setters: [
        function (utf8_ts_3_1) {
          utf8_ts_3 = utf8_ts_3_1;
        },
        function (bufio_ts_3_1) {
          bufio_ts_3 = bufio_ts_3_1;
        },
        function (assert_ts_7_1) {
          assert_ts_7 = assert_ts_7_1;
        },
        function (mod_ts_8_1) {
          mod_ts_8 = mod_ts_8_1;
        },
        function (_io_ts_1_1) {
          _io_ts_1 = _io_ts_1_1;
        },
      ],
      execute: function () {
        ServerRequest = class ServerRequest {
          constructor() {
            this.done = mod_ts_8.deferred();
            this._contentLength = undefined;
            this._body = null;
            this.finalized = false;
          }
          get contentLength() {
            if (this._contentLength === undefined) {
              const cl = this.headers.get("content-length");
              if (cl) {
                this._contentLength = parseInt(cl);
                if (Number.isNaN(this._contentLength)) {
                  this._contentLength = null;
                }
              } else {
                this._contentLength = null;
              }
            }
            return this._contentLength;
          }
          get body() {
            if (!this._body) {
              if (this.contentLength != null) {
                this._body = _io_ts_1.bodyReader(this.contentLength, this.r);
              } else {
                const transferEncoding = this.headers.get("transfer-encoding");
                if (transferEncoding != null) {
                  const parts = transferEncoding
                    .split(",")
                    .map((e) => e.trim().toLowerCase());
                  assert_ts_7.assert(
                    parts.includes("chunked"),
                    'transfer-encoding must include "chunked" if content-length is not set',
                  );
                  this._body = _io_ts_1.chunkedBodyReader(this.headers, this.r);
                } else {
                  this._body = _io_ts_1.emptyReader();
                }
              }
            }
            return this._body;
          }
          async respond(r) {
            let err;
            try {
              await _io_ts_1.writeResponse(this.w, r);
            } catch (e) {
              try {
                this.conn.close();
              } catch {
              }
              err = e;
            }
            this.done.resolve(err);
            if (err) {
              throw err;
            }
          }
          async finalize() {
            if (this.finalized) {
              return;
            }
            const body = this.body;
            const buf = new Uint8Array(1024);
            while ((await body.read(buf)) !== null) {
            }
            this.finalized = true;
          }
        };
        exports_46("ServerRequest", ServerRequest);
        Server = class Server {
          constructor(listener) {
            this.listener = listener;
            this.closing = false;
            this.connections = [];
          }
          close() {
            this.closing = true;
            this.listener.close();
            for (const conn of this.connections) {
              try {
                conn.close();
              } catch (e) {
                if (!(e instanceof Deno.errors.BadResource)) {
                  throw e;
                }
              }
            }
          }
          async *iterateHttpRequests(conn) {
            const reader = new bufio_ts_3.BufReader(conn);
            const writer = new bufio_ts_3.BufWriter(conn);
            while (!this.closing) {
              let request;
              try {
                request = await _io_ts_1.readRequest(conn, reader);
              } catch (error) {
                if (
                  error instanceof Deno.errors.InvalidData ||
                  error instanceof Deno.errors.UnexpectedEof
                ) {
                  await _io_ts_1.writeResponse(writer, {
                    status: 400,
                    body: utf8_ts_3.encode(`${error.message}\r\n\r\n`),
                  });
                }
                break;
              }
              if (request === null) {
                break;
              }
              request.w = writer;
              yield request;
              const responseError = await request.done;
              if (responseError) {
                this.untrackConnection(request.conn);
                return;
              }
              await request.finalize();
            }
            this.untrackConnection(conn);
            try {
              conn.close();
            } catch (e) {
            }
          }
          trackConnection(conn) {
            this.connections.push(conn);
          }
          untrackConnection(conn) {
            const index = this.connections.indexOf(conn);
            if (index !== -1) {
              this.connections.splice(index, 1);
            }
          }
          async *acceptConnAndIterateHttpRequests(mux) {
            if (this.closing) {
              return;
            }
            let conn;
            try {
              conn = await this.listener.accept();
            } catch (error) {
              if (
                error instanceof Deno.errors.BadResource ||
                error instanceof Deno.errors.InvalidData ||
                error instanceof Deno.errors.UnexpectedEof
              ) {
                return mux.add(this.acceptConnAndIterateHttpRequests(mux));
              }
              throw error;
            }
            this.trackConnection(conn);
            mux.add(this.acceptConnAndIterateHttpRequests(mux));
            yield* this.iterateHttpRequests(conn);
          }
          [Symbol.asyncIterator]() {
            const mux = new mod_ts_8.MuxAsyncIterator();
            mux.add(this.acceptConnAndIterateHttpRequests(mux));
            return mux.iterate();
          }
        };
        exports_46("Server", Server);
      },
    };
  },
);
System.register(
  "https://deno.land/x/gentleRpc@v1.1/jsonRpc2Types",
  [],
  function (exports_47, context_47) {
    "use strict";
    var __moduleName = context_47 && context_47.id;
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/x/gentleRpc@v1.1/rpcServer",
  [],
  function (exports_48, context_48) {
    "use strict";
    var ServerError;
    var __moduleName = context_48 && context_48.id;
    function isJsonRpcVersion(input) {
      return input === "2.0";
    }
    function isJsonRpcMethod(input) {
      return typeof input === "string" && !input.startsWith("rpc.");
    }
    function isJsonRpcParams(input) {
      return typeof input === "object";
    }
    function isJsonRpcId(input) {
      switch (typeof input) {
        case "string":
          return true;
        case "number":
          return input % 1 === 0;
        case "object":
          let isNull = input === null;
          if (isNull) {
            console.warn("Use of null ID in JSONRPC 2.0 is discouraged.");
            return true;
          } else {
            return false;
          }
        default:
          return false;
      }
    }
    function validateRpcObj(decodedBody, methods) {
      if (decodedBody instanceof ServerError) {
        return decodedBody;
      }
      if (
        typeof decodedBody === "object" &&
        !Array.isArray(decodedBody) &&
        decodedBody !== null
      ) {
        if (
          !isJsonRpcVersion(decodedBody.jsonrpc) ||
          !isJsonRpcMethod(decodedBody.method)
        ) {
          return new ServerError(
            -32600,
            "Invalid Request",
            isJsonRpcId(decodedBody.id) ? decodedBody.id : null,
          );
        } else if (typeof methods[decodedBody.method] !== "function") {
          return new ServerError(
            -32601,
            "Method not found",
            "id" in decodedBody
              ? isJsonRpcId(decodedBody.id) ? decodedBody.id : null
              : undefined,
          );
        } else if (
          "params" in decodedBody && typeof decodedBody.params !== "object"
        ) {
          return new ServerError(
            -32602,
            "Invalid parameters",
            "id" in decodedBody
              ? isJsonRpcId(decodedBody.id) ? decodedBody.id : null
              : undefined,
          );
        } else {
          return "id" in decodedBody
            ? isJsonRpcId(decodedBody.id)
              ? decodedBody
              : new ServerError(-32600, "Invalid Request", null)
            : { ...decodedBody, id: undefined };
        }
      } else {
        return new ServerError(-32600, "Invalid Request", null);
      }
    }
    async function executeMethods(rpcReqObj, methods, req) {
      try {
        if (rpcReqObj instanceof ServerError) {
          return rpcReqObj;
        } else {
          if (req) {
            return Array.isArray(rpcReqObj.params)
              ? {
                result: await methods[rpcReqObj.method](
                  req,
                  ...rpcReqObj.params,
                ),
                id: rpcReqObj.id,
              }
              : {
                result: await methods[rpcReqObj.method]({
                  ...rpcReqObj.params,
                  req,
                }),
                id: rpcReqObj.id,
              };
          } else {
            return Array.isArray(rpcReqObj.params)
              ? {
                result: await methods[rpcReqObj.method](...rpcReqObj.params),
                id: rpcReqObj.id,
              }
              : {
                result: await methods[rpcReqObj.method](rpcReqObj.params),
                id: rpcReqObj.id,
              };
          }
        }
      } catch (err) {
        return new ServerError(
          -32000,
          "Server error",
          "id" in rpcReqObj
            ? isJsonRpcId(rpcReqObj.id) ? rpcReqObj.id : null
            : undefined,
        );
      }
    }
    async function respondRpc(
      req,
      methods,
      { includeServerErrorStack = false, callMethodsWithRequestObj = false } =
        {},
    ) {
      const decodedBody = new TextDecoder().decode(
        await Deno.readAll(req.body),
      );
      const resObject = callMethodsWithRequestObj
        ? await handleData(decodedBody, methods, includeServerErrorStack, req)
        : await handleData(decodedBody, methods, includeServerErrorStack);
      const headers = new Headers();
      headers.set("content-type", "application/json");
      req.respond(
        resObject
          ? {
            body: new TextEncoder().encode(JSON.stringify(resObject)),
            headers,
            status: 200,
          }
          : { status: 204 },
      );
      return resObject;
    }
    exports_48("respondRpc", respondRpc);
    function parseJson(json) {
      try {
        return JSON.parse(json);
      } catch (err) {
        return new ServerError(-32700, "Parse error", null);
      }
    }
    async function handleData(
      decodedBody,
      methods,
      includeServerErrorStack = false,
      req,
    ) {
      const data = parseJson(decodedBody);
      const result = Array.isArray(data) && data.length > 0
        ? await Promise.all(
          data
            .map((body) => validateRpcObj(body, methods))
            .map((validatedRpcReq) =>
              req
                ? executeMethods(validatedRpcReq, methods, req)
                : executeMethods(validatedRpcReq, methods)
            ),
        )
        : req
        ? await executeMethods(validateRpcObj(data, methods), methods, req)
        : await executeMethods(validateRpcObj(data, methods), methods);
      return createRPCResponseObject(result, includeServerErrorStack);
    }
    exports_48("handleData", handleData);
    function createRPCResponseObject(result, includeServerErrorStack) {
      if (Array.isArray(result)) {
        const responseBatchObj = result
          .map((result) => createObject(result, includeServerErrorStack))
          .filter((result) => result != null);
        return responseBatchObj.length > 0 ? responseBatchObj : null;
      } else {
        return createObject(result, includeServerErrorStack);
      }
    }
    function createObject(data, includeServerErrorStack) {
      function isNotNotification(result) {
        return (("id" in result && result.id !== undefined) ||
          (result instanceof ServerError && result.rpcRequestID !== undefined));
      }
      if (isNotNotification(data)) {
        if ("id" in data) {
          return {
            jsonrpc: "2.0",
            result: data.result === undefined ? null : data.result,
            id: data.id,
          };
        } else {
          const rpcResObj = {
            jsonrpc: "2.0",
            error: {
              code: data.rpcErrorID || -32603,
              message: data.message,
            },
            id: data.rpcRequestID,
          };
          if (data.stack && includeServerErrorStack) {
            rpcResObj.error.data = { stack: data.stack };
          }
          return rpcResObj;
        }
      } else {
        return null;
      }
    }
    return {
      setters: [],
      execute: function () {
        ServerError = class ServerError extends Error {
          constructor(rpcErrorID, message, rpcRequestID) {
            super(message);
            this.rpcErrorID = rpcErrorID;
            this.rpcRequestID = rpcRequestID;
          }
        };
      },
    };
  },
);
System.register(
  "https://deno.land/x/dotenv@v0.5.0/util",
  [],
  function (exports_49, context_49) {
    "use strict";
    var __moduleName = context_49 && context_49.id;
    function trim(val) {
      return val.trim();
    }
    exports_49("trim", trim);
    function compact(obj) {
      return Object.keys(obj).reduce((result, key) => {
        if (obj[key]) {
          result[key] = obj[key];
        }
        return result;
      }, {});
    }
    exports_49("compact", compact);
    function difference(arrA, arrB) {
      return arrA.filter((a) => arrB.indexOf(a) < 0);
    }
    exports_49("difference", difference);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/x/dotenv@v0.5.0/mod",
  ["https://deno.land/x/dotenv@v0.5.0/util"],
  function (exports_50, context_50) {
    "use strict";
    var util_ts_5, MissingEnvVarsError;
    var __moduleName = context_50 && context_50.id;
    function parse(rawDotenv) {
      return rawDotenv.split("\n").reduce((acc, line) => {
        if (!isVariableStart(line)) {
          return acc;
        }
        let [key, ...vals] = line.split("=");
        let value = util_ts_5.trim(vals.join("="));
        if (/^"/.test(value)) {
          value = expandNewlines(value);
        }
        acc[util_ts_5.trim(key)] = util_ts_5.trim(cleanQuotes(value));
        return acc;
      }, {});
    }
    exports_50("parse", parse);
    function config(options = {}) {
      const o = Object.assign({
        path: `.env`,
        export: false,
        safe: false,
        example: `.env.example`,
        allowEmptyValues: false,
        defaults: `.env.defaults`,
      }, options);
      const conf = parseFile(o.path);
      if (o.safe) {
        const confExample = parseFile(o.example);
        assertSafe(conf, confExample, o.allowEmptyValues);
      }
      if (o.defaults) {
        const confDefaults = parseFile(o.defaults);
        for (let key in confDefaults) {
          if (!(key in conf)) {
            conf[key] = confDefaults[key];
          }
        }
      }
      if (o.export) {
        for (let key in conf) {
          Deno.env.set(key, conf[key]);
        }
      }
      return conf;
    }
    exports_50("config", config);
    function parseFile(filepath) {
      try {
        return parse(
          new TextDecoder("utf-8").decode(Deno.readFileSync(filepath)),
        );
      } catch (e) {
        if (e instanceof Deno.errors.NotFound) {
          return {};
        }
        throw e;
      }
    }
    function isVariableStart(str) {
      return /^\s*?[a-zA-Z_][a-zA-Z_0-9 ]*=/.test(str);
    }
    function cleanQuotes(value = "") {
      return value.replace(/^['"]([\s\S]*)['"]$/gm, "$1");
    }
    function expandNewlines(str) {
      return str.replace("\\n", "\n");
    }
    function assertSafe(conf, confExample, allowEmptyValues) {
      const currentEnv = Deno.env.toObject();
      const confWithEnv = Object.assign({}, currentEnv, conf);
      const missing = util_ts_5.difference(
        Object.keys(confExample),
        Object.keys(
          allowEmptyValues ? confWithEnv : util_ts_5.compact(confWithEnv),
        ),
      );
      if (missing.length > 0) {
        const errorMessages = [
          `The following variables were defined in the example file but are not present in the environment:\n  ${
            missing.join(", ")
          }`,
          `Make sure to add them to your env file.`,
          !allowEmptyValues &&
          `If you expect any of these variables to be empty, you can set the allowEmptyValues option to true.`,
        ];
        throw new MissingEnvVarsError(
          errorMessages.filter(Boolean).join("\n\n"),
        );
      }
    }
    return {
      setters: [
        function (util_ts_5_1) {
          util_ts_5 = util_ts_5_1;
        },
      ],
      execute: function () {
        MissingEnvVarsError = class MissingEnvVarsError extends Error {
          constructor(message) {
            super(message);
            this.name = "MissingEnvVarsError";
            Object.setPrototypeOf(this, new.target.prototype);
          }
        };
        exports_50("MissingEnvVarsError", MissingEnvVarsError);
      },
    };
  },
);
System.register(
  "file:///Users/davischilling/Documents/Davi/study-projects/deno/rpc-server/src/deps",
  [
    "https://deno.land/x/mongo@v0.11.1/mod",
    "https://deno.land/std@0.62.0/http/server",
    "https://deno.land/x/gentleRpc@v1.1/rpcServer",
    "https://deno.land/x/dotenv@v0.5.0/mod",
  ],
  function (exports_51, context_51) {
    "use strict";
    var __moduleName = context_51 && context_51.id;
    return {
      setters: [
        function (mod_ts_9_1) {
          exports_51({
            "MongoClient": mod_ts_9_1["MongoClient"],
          });
        },
        function (server_ts_2_1) {
          exports_51({
            "serve": server_ts_2_1["serve"],
            "ServerRequest": server_ts_2_1["ServerRequest"],
          });
        },
        function (rpcServer_ts_1_1) {
          exports_51({
            "respondRpc": rpcServer_ts_1_1["respondRpc"],
          });
        },
        function (mod_ts_10_1) {
          exports_51({
            "config": mod_ts_10_1["config"],
          });
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "file:///Users/davischilling/Documents/Davi/study-projects/deno/rpc-server/src/mongodb",
  ["file:///Users/davischilling/Documents/Davi/study-projects/deno/rpc-server/src/deps"],
  function (exports_52, context_52) {
    "use strict";
    var deps_ts_3, deps_ts_4, client, db;
    var __moduleName = context_52 && context_52.id;
    return {
      setters: [
        function (deps_ts_3_1) {
          deps_ts_3 = deps_ts_3_1;
          deps_ts_4 = deps_ts_3_1;
        },
      ],
      execute: function () {
        client = new deps_ts_3.MongoClient();
        client.connectWithUri(
          `${Deno.env.get("MONGO_URL") || deps_ts_4.config()["MONGO_URL"]}-${
            Deno.env.get("DENO_ENV")
          }`,
        );
        console.log(
          `${Deno.env.get("MONGO_URL") || deps_ts_4.config()["MONGO_URL"]}-${
            Deno.env.get("DENO_ENV")
          }`,
        );
        exports_52(
          "db",
          db = client.database(
            `${Deno.env.get("DB_DATABASE") ||
              deps_ts_4.config()["DB_DATABASE"]}-${Deno.env.get("DENO_ENV")}`,
          ),
        );
      },
    };
  },
);
System.register(
  "file:///Users/davischilling/Documents/Davi/study-projects/deno/rpc-server/src/models/User",
  ["file:///Users/davischilling/Documents/Davi/study-projects/deno/rpc-server/src/mongodb"],
  function (exports_53, context_53) {
    "use strict";
    var mongodb_ts_1, users;
    var __moduleName = context_53 && context_53.id;
    return {
      setters: [
        function (mongodb_ts_1_1) {
          mongodb_ts_1 = mongodb_ts_1_1;
        },
      ],
      execute: function () {
        exports_53("users", users = mongodb_ts_1.db.collection("users"));
      },
    };
  },
);
System.register(
  "file:///Users/davischilling/Documents/Davi/study-projects/deno/rpc-server/src/rpc-methods",
  ["file:///Users/davischilling/Documents/Davi/study-projects/deno/rpc-server/src/models/User"],
  function (exports_54, context_54) {
    "use strict";
    var User_ts_1, rpcMethods;
    var __moduleName = context_54 && context_54.id;
    return {
      setters: [
        function (User_ts_1_1) {
          User_ts_1 = User_ts_1_1;
        },
      ],
      execute: function () {
        exports_54(
          "rpcMethods",
          rpcMethods = {
            createUser: async ({ username, password }) => {
              if (!username || !password) {
                return {
                  success: false,
                  user: null,
                };
              } else {
                const _id = await User_ts_1.users.insertOne(
                  { username, password },
                );
                return {
                  success: true,
                  user: await User_ts_1.users.findOne({ _id }),
                };
              }
            },
            getUsers: async () => {
              return {
                success: true,
                users: await User_ts_1.users.find({}),
              };
            },
          },
        );
      },
    };
  },
);
System.register(
  "file:///Users/davischilling/Documents/Davi/study-projects/deno/rpc-server/src/app",
  [
    "file:///Users/davischilling/Documents/Davi/study-projects/deno/rpc-server/src/deps",
    "file:///Users/davischilling/Documents/Davi/study-projects/deno/rpc-server/src/rpc-methods",
  ],
  function (exports_55, context_55) {
    "use strict";
    var deps_ts_5, deps_ts_6, rpc_methods_ts_1, deps_ts_7, s;
    var __moduleName = context_55 && context_55.id;
    return {
      setters: [
        function (deps_ts_5_1) {
          deps_ts_5 = deps_ts_5_1;
          deps_ts_6 = deps_ts_5_1;
          deps_ts_7 = deps_ts_5_1;
        },
        function (rpc_methods_ts_1_1) {
          rpc_methods_ts_1 = rpc_methods_ts_1_1;
        },
      ],
      execute: async function () {
        console.log(
          `listening on ${Deno.env.get("PORT") || deps_ts_7.config()["PORT"]}`,
        );
        console.log(Deno.env.get("DENO_ENV"), deps_ts_7.config()["PORT"]);
        s = deps_ts_5.serve(Deno.env.get("PORT") || deps_ts_7.config()["PORT"]);
        for await (const req of s) {
          await deps_ts_6.respondRpc(req, rpc_methods_ts_1.rpcMethods);
        }
      },
    };
  },
);

await __instantiate(
  "file:///Users/davischilling/Documents/Davi/study-projects/deno/rpc-server/src/app",
  true,
);
