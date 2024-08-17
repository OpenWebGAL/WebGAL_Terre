var __umd_name_edit_this = (function (exports, require$$0, require$$1, require$$2, require$$3) {
    'use strict';

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) 2024 TypeFox and others.
     * Licensed under the MIT License. See LICENSE in the package root for license information.
     * ------------------------------------------------------------------------------------------ */
    class DisposableCollection {
        constructor() {
            this.disposables = [];
        }
        dispose() {
            while (this.disposables.length !== 0) {
                this.disposables.pop().dispose();
            }
        }
        push(disposable) {
            const disposables = this.disposables;
            disposables.push(disposable);
            return {
                dispose() {
                    const index = disposables.indexOf(disposable);
                    if (index !== -1) {
                        disposables.splice(index, 1);
                    }
                }
            };
        }
    }

    var messageReader$1 = {};

    var ral = {};

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */
    Object.defineProperty(ral, "__esModule", { value: true });
    let _ral;
    function RAL() {
        if (_ral === undefined) {
            throw new Error(`No runtime abstraction layer installed`);
        }
        return _ral;
    }
    (function (RAL) {
        function install(ral) {
            if (ral === undefined) {
                throw new Error(`No runtime abstraction layer provided`);
            }
            _ral = ral;
        }
        RAL.install = install;
    })(RAL || (RAL = {}));
    ral.default = RAL;

    var is$1 = {};

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */
    Object.defineProperty(is$1, "__esModule", { value: true });
    is$1.stringArray = is$1.array = is$1.func = is$1.error = is$1.number = is$1.string = is$1.boolean = void 0;
    function boolean$1(value) {
        return value === true || value === false;
    }
    is$1.boolean = boolean$1;
    function string$1(value) {
        return typeof value === 'string' || value instanceof String;
    }
    is$1.string = string$1;
    function number$1(value) {
        return typeof value === 'number' || value instanceof Number;
    }
    is$1.number = number$1;
    function error$1(value) {
        return value instanceof Error;
    }
    is$1.error = error$1;
    function func$1(value) {
        return typeof value === 'function';
    }
    is$1.func = func$1;
    function array$1(value) {
        return Array.isArray(value);
    }
    is$1.array = array$1;
    function stringArray$1(value) {
        return array$1(value) && value.every(elem => string$1(elem));
    }
    is$1.stringArray = stringArray$1;

    var events$1 = {};

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */
    Object.defineProperty(events$1, "__esModule", { value: true });
    events$1.Emitter = events$1.Event = void 0;
    const ral_1$3 = ral;
    var Event;
    (function (Event) {
        const _disposable = { dispose() { } };
        Event.None = function () { return _disposable; };
    })(Event || (events$1.Event = Event = {}));
    class CallbackList {
        add(callback, context = null, bucket) {
            if (!this._callbacks) {
                this._callbacks = [];
                this._contexts = [];
            }
            this._callbacks.push(callback);
            this._contexts.push(context);
            if (Array.isArray(bucket)) {
                bucket.push({ dispose: () => this.remove(callback, context) });
            }
        }
        remove(callback, context = null) {
            if (!this._callbacks) {
                return;
            }
            let foundCallbackWithDifferentContext = false;
            for (let i = 0, len = this._callbacks.length; i < len; i++) {
                if (this._callbacks[i] === callback) {
                    if (this._contexts[i] === context) {
                        // callback & context match => remove it
                        this._callbacks.splice(i, 1);
                        this._contexts.splice(i, 1);
                        return;
                    }
                    else {
                        foundCallbackWithDifferentContext = true;
                    }
                }
            }
            if (foundCallbackWithDifferentContext) {
                throw new Error('When adding a listener with a context, you should remove it with the same context');
            }
        }
        invoke(...args) {
            if (!this._callbacks) {
                return [];
            }
            const ret = [], callbacks = this._callbacks.slice(0), contexts = this._contexts.slice(0);
            for (let i = 0, len = callbacks.length; i < len; i++) {
                try {
                    ret.push(callbacks[i].apply(contexts[i], args));
                }
                catch (e) {
                    // eslint-disable-next-line no-console
                    (0, ral_1$3.default)().console.error(e);
                }
            }
            return ret;
        }
        isEmpty() {
            return !this._callbacks || this._callbacks.length === 0;
        }
        dispose() {
            this._callbacks = undefined;
            this._contexts = undefined;
        }
    }
    class Emitter {
        constructor(_options) {
            this._options = _options;
        }
        /**
         * For the public to allow to subscribe
         * to events from this Emitter
         */
        get event() {
            if (!this._event) {
                this._event = (listener, thisArgs, disposables) => {
                    if (!this._callbacks) {
                        this._callbacks = new CallbackList();
                    }
                    if (this._options && this._options.onFirstListenerAdd && this._callbacks.isEmpty()) {
                        this._options.onFirstListenerAdd(this);
                    }
                    this._callbacks.add(listener, thisArgs);
                    const result = {
                        dispose: () => {
                            if (!this._callbacks) {
                                // disposable is disposed after emitter is disposed.
                                return;
                            }
                            this._callbacks.remove(listener, thisArgs);
                            result.dispose = Emitter._noop;
                            if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
                                this._options.onLastListenerRemove(this);
                            }
                        }
                    };
                    if (Array.isArray(disposables)) {
                        disposables.push(result);
                    }
                    return result;
                };
            }
            return this._event;
        }
        /**
         * To be kept private to fire an event to
         * subscribers
         */
        fire(event) {
            if (this._callbacks) {
                this._callbacks.invoke.call(this._callbacks, event);
            }
        }
        dispose() {
            if (this._callbacks) {
                this._callbacks.dispose();
                this._callbacks = undefined;
            }
        }
    }
    events$1.Emitter = Emitter;
    Emitter._noop = function () { };

    var semaphore = {};

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */
    Object.defineProperty(semaphore, "__esModule", { value: true });
    semaphore.Semaphore = void 0;
    const ral_1$2 = ral;
    class Semaphore {
        constructor(capacity = 1) {
            if (capacity <= 0) {
                throw new Error('Capacity must be greater than 0');
            }
            this._capacity = capacity;
            this._active = 0;
            this._waiting = [];
        }
        lock(thunk) {
            return new Promise((resolve, reject) => {
                this._waiting.push({ thunk, resolve, reject });
                this.runNext();
            });
        }
        get active() {
            return this._active;
        }
        runNext() {
            if (this._waiting.length === 0 || this._active === this._capacity) {
                return;
            }
            (0, ral_1$2.default)().timer.setImmediate(() => this.doRunNext());
        }
        doRunNext() {
            if (this._waiting.length === 0 || this._active === this._capacity) {
                return;
            }
            const next = this._waiting.shift();
            this._active++;
            if (this._active > this._capacity) {
                throw new Error(`To many thunks active`);
            }
            try {
                const result = next.thunk();
                if (result instanceof Promise) {
                    result.then((value) => {
                        this._active--;
                        next.resolve(value);
                        this.runNext();
                    }, (err) => {
                        this._active--;
                        next.reject(err);
                        this.runNext();
                    });
                }
                else {
                    this._active--;
                    next.resolve(result);
                    this.runNext();
                }
            }
            catch (err) {
                this._active--;
                next.reject(err);
                this.runNext();
            }
        }
    }
    semaphore.Semaphore = Semaphore;

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */
    Object.defineProperty(messageReader$1, "__esModule", { value: true });
    messageReader$1.ReadableStreamMessageReader = AbstractMessageReader_1 = messageReader$1.AbstractMessageReader = messageReader$1.MessageReader = void 0;
    const ral_1$1 = ral;
    const Is$1 = is$1;
    const events_1$1 = events$1;
    const semaphore_1$1 = semaphore;
    var MessageReader;
    (function (MessageReader) {
        function is(value) {
            let candidate = value;
            return candidate && Is$1.func(candidate.listen) && Is$1.func(candidate.dispose) &&
                Is$1.func(candidate.onError) && Is$1.func(candidate.onClose) && Is$1.func(candidate.onPartialMessage);
        }
        MessageReader.is = is;
    })(MessageReader || (messageReader$1.MessageReader = MessageReader = {}));
    class AbstractMessageReader {
        constructor() {
            this.errorEmitter = new events_1$1.Emitter();
            this.closeEmitter = new events_1$1.Emitter();
            this.partialMessageEmitter = new events_1$1.Emitter();
        }
        dispose() {
            this.errorEmitter.dispose();
            this.closeEmitter.dispose();
        }
        get onError() {
            return this.errorEmitter.event;
        }
        fireError(error) {
            this.errorEmitter.fire(this.asError(error));
        }
        get onClose() {
            return this.closeEmitter.event;
        }
        fireClose() {
            this.closeEmitter.fire(undefined);
        }
        get onPartialMessage() {
            return this.partialMessageEmitter.event;
        }
        firePartialMessage(info) {
            this.partialMessageEmitter.fire(info);
        }
        asError(error) {
            if (error instanceof Error) {
                return error;
            }
            else {
                return new Error(`Reader received error. Reason: ${Is$1.string(error.message) ? error.message : 'unknown'}`);
            }
        }
    }
    var AbstractMessageReader_1 = messageReader$1.AbstractMessageReader = AbstractMessageReader;
    var ResolvedMessageReaderOptions;
    (function (ResolvedMessageReaderOptions) {
        function fromOptions(options) {
            let charset;
            let contentDecoder;
            const contentDecoders = new Map();
            let contentTypeDecoder;
            const contentTypeDecoders = new Map();
            if (options === undefined || typeof options === 'string') {
                charset = options ?? 'utf-8';
            }
            else {
                charset = options.charset ?? 'utf-8';
                if (options.contentDecoder !== undefined) {
                    contentDecoder = options.contentDecoder;
                    contentDecoders.set(contentDecoder.name, contentDecoder);
                }
                if (options.contentDecoders !== undefined) {
                    for (const decoder of options.contentDecoders) {
                        contentDecoders.set(decoder.name, decoder);
                    }
                }
                if (options.contentTypeDecoder !== undefined) {
                    contentTypeDecoder = options.contentTypeDecoder;
                    contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
                }
                if (options.contentTypeDecoders !== undefined) {
                    for (const decoder of options.contentTypeDecoders) {
                        contentTypeDecoders.set(decoder.name, decoder);
                    }
                }
            }
            if (contentTypeDecoder === undefined) {
                contentTypeDecoder = (0, ral_1$1.default)().applicationJson.decoder;
                contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
            }
            return { charset, contentDecoder, contentDecoders, contentTypeDecoder, contentTypeDecoders };
        }
        ResolvedMessageReaderOptions.fromOptions = fromOptions;
    })(ResolvedMessageReaderOptions || (ResolvedMessageReaderOptions = {}));
    class ReadableStreamMessageReader extends AbstractMessageReader {
        constructor(readable, options) {
            super();
            this.readable = readable;
            this.options = ResolvedMessageReaderOptions.fromOptions(options);
            this.buffer = (0, ral_1$1.default)().messageBuffer.create(this.options.charset);
            this._partialMessageTimeout = 10000;
            this.nextMessageLength = -1;
            this.messageToken = 0;
            this.readSemaphore = new semaphore_1$1.Semaphore(1);
        }
        set partialMessageTimeout(timeout) {
            this._partialMessageTimeout = timeout;
        }
        get partialMessageTimeout() {
            return this._partialMessageTimeout;
        }
        listen(callback) {
            this.nextMessageLength = -1;
            this.messageToken = 0;
            this.partialMessageTimer = undefined;
            this.callback = callback;
            const result = this.readable.onData((data) => {
                this.onData(data);
            });
            this.readable.onError((error) => this.fireError(error));
            this.readable.onClose(() => this.fireClose());
            return result;
        }
        onData(data) {
            try {
                this.buffer.append(data);
                while (true) {
                    if (this.nextMessageLength === -1) {
                        const headers = this.buffer.tryReadHeaders(true);
                        if (!headers) {
                            return;
                        }
                        const contentLength = headers.get('content-length');
                        if (!contentLength) {
                            this.fireError(new Error(`Header must provide a Content-Length property.\n${JSON.stringify(Object.fromEntries(headers))}`));
                            return;
                        }
                        const length = parseInt(contentLength);
                        if (isNaN(length)) {
                            this.fireError(new Error(`Content-Length value must be a number. Got ${contentLength}`));
                            return;
                        }
                        this.nextMessageLength = length;
                    }
                    const body = this.buffer.tryReadBody(this.nextMessageLength);
                    if (body === undefined) {
                        /** We haven't received the full message yet. */
                        this.setPartialMessageTimer();
                        return;
                    }
                    this.clearPartialMessageTimer();
                    this.nextMessageLength = -1;
                    // Make sure that we convert one received message after the
                    // other. Otherwise it could happen that a decoding of a second
                    // smaller message finished before the decoding of a first larger
                    // message and then we would deliver the second message first.
                    this.readSemaphore.lock(async () => {
                        const bytes = this.options.contentDecoder !== undefined
                            ? await this.options.contentDecoder.decode(body)
                            : body;
                        const message = await this.options.contentTypeDecoder.decode(bytes, this.options);
                        this.callback(message);
                    }).catch((error) => {
                        this.fireError(error);
                    });
                }
            }
            catch (error) {
                this.fireError(error);
            }
        }
        clearPartialMessageTimer() {
            if (this.partialMessageTimer) {
                this.partialMessageTimer.dispose();
                this.partialMessageTimer = undefined;
            }
        }
        setPartialMessageTimer() {
            this.clearPartialMessageTimer();
            if (this._partialMessageTimeout <= 0) {
                return;
            }
            this.partialMessageTimer = (0, ral_1$1.default)().timer.setTimeout((token, timeout) => {
                this.partialMessageTimer = undefined;
                if (token === this.messageToken) {
                    this.firePartialMessage({ messageToken: token, waitingTime: timeout });
                    this.setPartialMessageTimer();
                }
            }, this._partialMessageTimeout, this.messageToken, this._partialMessageTimeout);
        }
    }
    messageReader$1.ReadableStreamMessageReader = ReadableStreamMessageReader;

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) 2024 TypeFox and others.
     * Licensed under the MIT License. See LICENSE in the package root for license information.
     * ------------------------------------------------------------------------------------------ */
    class WebSocketMessageReader extends AbstractMessageReader_1 {
        constructor(socket) {
            super();
            this.state = 'initial';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.events = [];
            this.socket = socket;
            this.socket.onMessage(message => this.readMessage(message));
            this.socket.onError(error => this.fireError(error));
            this.socket.onClose((code, reason) => {
                if (code !== 1000) {
                    const error = {
                        name: '' + code,
                        message: `Error during socket reconnect: code = ${code}, reason = ${reason}`
                    };
                    this.fireError(error);
                }
                this.fireClose();
            });
        }
        listen(callback) {
            if (this.state === 'initial') {
                this.state = 'listening';
                this.callback = callback;
                while (this.events.length !== 0) {
                    const event = this.events.pop();
                    if (event.message) {
                        this.readMessage(event.message);
                    }
                    else if (event.error) {
                        this.fireError(event.error);
                    }
                    else {
                        this.fireClose();
                    }
                }
            }
            return {
                dispose: () => {
                    if (this.callback === callback) {
                        this.state = 'initial';
                        this.callback = undefined;
                    }
                }
            };
        }
        dispose() {
            super.dispose();
            this.state = 'initial';
            this.callback = undefined;
            this.events.splice(0, this.events.length);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readMessage(message) {
            if (this.state === 'initial') {
                this.events.splice(0, 0, { message });
            }
            else if (this.state === 'listening') {
                try {
                    const data = JSON.parse(message);
                    this.callback(data);
                }
                catch (err) {
                    const error = {
                        name: '' + 400,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        message: `Error during message parsing, reason = ${typeof err === 'object' ? err.message : 'unknown'}`
                    };
                    this.fireError(error);
                }
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fireError(error) {
            if (this.state === 'initial') {
                this.events.splice(0, 0, { error });
            }
            else if (this.state === 'listening') {
                super.fireError(error);
            }
        }
        fireClose() {
            if (this.state === 'initial') {
                this.events.splice(0, 0, {});
            }
            else if (this.state === 'listening') {
                super.fireClose();
            }
            this.state = 'closed';
        }
    }

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var messageWriter$1 = {};

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */
    Object.defineProperty(messageWriter$1, "__esModule", { value: true });
    messageWriter$1.WriteableStreamMessageWriter = AbstractMessageWriter_1 = messageWriter$1.AbstractMessageWriter = messageWriter$1.MessageWriter = void 0;
    const ral_1 = ral;
    const Is = is$1;
    const semaphore_1 = semaphore;
    const events_1 = events$1;
    const ContentLength = 'Content-Length: ';
    const CRLF = '\r\n';
    var MessageWriter;
    (function (MessageWriter) {
        function is(value) {
            let candidate = value;
            return candidate && Is.func(candidate.dispose) && Is.func(candidate.onClose) &&
                Is.func(candidate.onError) && Is.func(candidate.write);
        }
        MessageWriter.is = is;
    })(MessageWriter || (messageWriter$1.MessageWriter = MessageWriter = {}));
    class AbstractMessageWriter {
        constructor() {
            this.errorEmitter = new events_1.Emitter();
            this.closeEmitter = new events_1.Emitter();
        }
        dispose() {
            this.errorEmitter.dispose();
            this.closeEmitter.dispose();
        }
        get onError() {
            return this.errorEmitter.event;
        }
        fireError(error, message, count) {
            this.errorEmitter.fire([this.asError(error), message, count]);
        }
        get onClose() {
            return this.closeEmitter.event;
        }
        fireClose() {
            this.closeEmitter.fire(undefined);
        }
        asError(error) {
            if (error instanceof Error) {
                return error;
            }
            else {
                return new Error(`Writer received error. Reason: ${Is.string(error.message) ? error.message : 'unknown'}`);
            }
        }
    }
    var AbstractMessageWriter_1 = messageWriter$1.AbstractMessageWriter = AbstractMessageWriter;
    var ResolvedMessageWriterOptions;
    (function (ResolvedMessageWriterOptions) {
        function fromOptions(options) {
            if (options === undefined || typeof options === 'string') {
                return { charset: options ?? 'utf-8', contentTypeEncoder: (0, ral_1.default)().applicationJson.encoder };
            }
            else {
                return { charset: options.charset ?? 'utf-8', contentEncoder: options.contentEncoder, contentTypeEncoder: options.contentTypeEncoder ?? (0, ral_1.default)().applicationJson.encoder };
            }
        }
        ResolvedMessageWriterOptions.fromOptions = fromOptions;
    })(ResolvedMessageWriterOptions || (ResolvedMessageWriterOptions = {}));
    class WriteableStreamMessageWriter extends AbstractMessageWriter {
        constructor(writable, options) {
            super();
            this.writable = writable;
            this.options = ResolvedMessageWriterOptions.fromOptions(options);
            this.errorCount = 0;
            this.writeSemaphore = new semaphore_1.Semaphore(1);
            this.writable.onError((error) => this.fireError(error));
            this.writable.onClose(() => this.fireClose());
        }
        async write(msg) {
            return this.writeSemaphore.lock(async () => {
                const payload = this.options.contentTypeEncoder.encode(msg, this.options).then((buffer) => {
                    if (this.options.contentEncoder !== undefined) {
                        return this.options.contentEncoder.encode(buffer);
                    }
                    else {
                        return buffer;
                    }
                });
                return payload.then((buffer) => {
                    const headers = [];
                    headers.push(ContentLength, buffer.byteLength.toString(), CRLF);
                    headers.push(CRLF);
                    return this.doWrite(msg, headers, buffer);
                }, (error) => {
                    this.fireError(error);
                    throw error;
                });
            });
        }
        async doWrite(msg, headers, data) {
            try {
                await this.writable.write(headers.join(''), 'ascii');
                return this.writable.write(data);
            }
            catch (error) {
                this.handleError(error, msg);
                return Promise.reject(error);
            }
        }
        handleError(error, msg) {
            this.errorCount++;
            this.fireError(error, msg, this.errorCount);
        }
        end() {
            this.writable.end();
        }
    }
    messageWriter$1.WriteableStreamMessageWriter = WriteableStreamMessageWriter;

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) 2024 TypeFox and others.
     * Licensed under the MIT License. See LICENSE in the package root for license information.
     * ------------------------------------------------------------------------------------------ */
    class WebSocketMessageWriter extends AbstractMessageWriter_1 {
        constructor(socket) {
            super();
            this.errorCount = 0;
            this.socket = socket;
        }
        end() {
        }
        write(msg) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const content = JSON.stringify(msg);
                    this.socket.send(content);
                }
                catch (e) {
                    this.errorCount++;
                    this.fireError(e, msg, this.errorCount);
                }
            });
        }
    }

    var main = {};

    var is = {};

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */
    Object.defineProperty(is, "__esModule", { value: true });
    function boolean(value) {
        return value === true || value === false;
    }
    is.boolean = boolean;
    function string(value) {
        return typeof value === 'string' || value instanceof String;
    }
    is.string = string;
    function number(value) {
        return typeof value === 'number' || value instanceof Number;
    }
    is.number = number;
    function error(value) {
        return value instanceof Error;
    }
    is.error = error;
    function func(value) {
        return typeof value === 'function';
    }
    is.func = func;
    function array(value) {
        return Array.isArray(value);
    }
    is.array = array;
    function stringArray(value) {
        return array(value) && value.every(elem => string(elem));
    }
    is.stringArray = stringArray;

    var messages = {};

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */

    (function (exports) {
    	Object.defineProperty(exports, "__esModule", { value: true });
    	const is$1 = is;
    	/**
    	 * Predefined error codes.
    	 */
    	var ErrorCodes;
    	(function (ErrorCodes) {
    	    // Defined by JSON RPC
    	    ErrorCodes.ParseError = -32700;
    	    ErrorCodes.InvalidRequest = -32600;
    	    ErrorCodes.MethodNotFound = -32601;
    	    ErrorCodes.InvalidParams = -32602;
    	    ErrorCodes.InternalError = -32603;
    	    ErrorCodes.serverErrorStart = -32099;
    	    ErrorCodes.serverErrorEnd = -32000;
    	    ErrorCodes.ServerNotInitialized = -32002;
    	    ErrorCodes.UnknownErrorCode = -32001;
    	    // Defined by the protocol.
    	    ErrorCodes.RequestCancelled = -32800;
    	    ErrorCodes.ContentModified = -32801;
    	    // Defined by VSCode library.
    	    ErrorCodes.MessageWriteError = 1;
    	    ErrorCodes.MessageReadError = 2;
    	})(ErrorCodes = exports.ErrorCodes || (exports.ErrorCodes = {}));
    	/**
    	 * An error object return in a response in case a request
    	 * has failed.
    	 */
    	class ResponseError extends Error {
    	    constructor(code, message, data) {
    	        super(message);
    	        this.code = is$1.number(code) ? code : ErrorCodes.UnknownErrorCode;
    	        this.data = data;
    	        Object.setPrototypeOf(this, ResponseError.prototype);
    	    }
    	    toJson() {
    	        return {
    	            code: this.code,
    	            message: this.message,
    	            data: this.data,
    	        };
    	    }
    	}
    	exports.ResponseError = ResponseError;
    	/**
    	 * An abstract implementation of a MessageType.
    	 */
    	class AbstractMessageType {
    	    constructor(_method, _numberOfParams) {
    	        this._method = _method;
    	        this._numberOfParams = _numberOfParams;
    	    }
    	    get method() {
    	        return this._method;
    	    }
    	    get numberOfParams() {
    	        return this._numberOfParams;
    	    }
    	}
    	exports.AbstractMessageType = AbstractMessageType;
    	/**
    	 * Classes to type request response pairs
    	 *
    	 * The type parameter RO will be removed in the next major version
    	 * of the JSON RPC library since it is a LSP concept and doesn't
    	 * belong here. For now it is tagged as default never.
    	 */
    	class RequestType0 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 0);
    	    }
    	}
    	exports.RequestType0 = RequestType0;
    	class RequestType extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 1);
    	    }
    	}
    	exports.RequestType = RequestType;
    	class RequestType1 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 1);
    	    }
    	}
    	exports.RequestType1 = RequestType1;
    	class RequestType2 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 2);
    	    }
    	}
    	exports.RequestType2 = RequestType2;
    	class RequestType3 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 3);
    	    }
    	}
    	exports.RequestType3 = RequestType3;
    	class RequestType4 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 4);
    	    }
    	}
    	exports.RequestType4 = RequestType4;
    	class RequestType5 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 5);
    	    }
    	}
    	exports.RequestType5 = RequestType5;
    	class RequestType6 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 6);
    	    }
    	}
    	exports.RequestType6 = RequestType6;
    	class RequestType7 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 7);
    	    }
    	}
    	exports.RequestType7 = RequestType7;
    	class RequestType8 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 8);
    	    }
    	}
    	exports.RequestType8 = RequestType8;
    	class RequestType9 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 9);
    	    }
    	}
    	exports.RequestType9 = RequestType9;
    	/**
    	 * The type parameter RO will be removed in the next major version
    	 * of the JSON RPC library since it is a LSP concept and doesn't
    	 * belong here. For now it is tagged as default never.
    	 */
    	class NotificationType extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 1);
    	        this._ = undefined;
    	    }
    	}
    	exports.NotificationType = NotificationType;
    	class NotificationType0 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 0);
    	    }
    	}
    	exports.NotificationType0 = NotificationType0;
    	class NotificationType1 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 1);
    	    }
    	}
    	exports.NotificationType1 = NotificationType1;
    	class NotificationType2 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 2);
    	    }
    	}
    	exports.NotificationType2 = NotificationType2;
    	class NotificationType3 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 3);
    	    }
    	}
    	exports.NotificationType3 = NotificationType3;
    	class NotificationType4 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 4);
    	    }
    	}
    	exports.NotificationType4 = NotificationType4;
    	class NotificationType5 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 5);
    	    }
    	}
    	exports.NotificationType5 = NotificationType5;
    	class NotificationType6 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 6);
    	    }
    	}
    	exports.NotificationType6 = NotificationType6;
    	class NotificationType7 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 7);
    	    }
    	}
    	exports.NotificationType7 = NotificationType7;
    	class NotificationType8 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 8);
    	    }
    	}
    	exports.NotificationType8 = NotificationType8;
    	class NotificationType9 extends AbstractMessageType {
    	    constructor(method) {
    	        super(method, 9);
    	    }
    	}
    	exports.NotificationType9 = NotificationType9;
    	/**
    	 * Tests if the given message is a request message
    	 */
    	function isRequestMessage(message) {
    	    let candidate = message;
    	    return candidate && is$1.string(candidate.method) && (is$1.string(candidate.id) || is$1.number(candidate.id));
    	}
    	exports.isRequestMessage = isRequestMessage;
    	/**
    	 * Tests if the given message is a notification message
    	 */
    	function isNotificationMessage(message) {
    	    let candidate = message;
    	    return candidate && is$1.string(candidate.method) && message.id === void 0;
    	}
    	exports.isNotificationMessage = isNotificationMessage;
    	/**
    	 * Tests if the given message is a response message
    	 */
    	function isResponseMessage(message) {
    	    let candidate = message;
    	    return candidate && (candidate.result !== void 0 || !!candidate.error) && (is$1.string(candidate.id) || is$1.number(candidate.id) || candidate.id === null);
    	}
    	exports.isResponseMessage = isResponseMessage;
    } (messages));

    var messageReader = {};

    var events = {};

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */

    (function (exports) {
    	Object.defineProperty(exports, "__esModule", { value: true });
    	(function (Disposable) {
    	    function create(func) {
    	        return {
    	            dispose: func
    	        };
    	    }
    	    Disposable.create = create;
    	})(exports.Disposable || (exports.Disposable = {}));
    	(function (Event) {
    	    const _disposable = { dispose() { } };
    	    Event.None = function () { return _disposable; };
    	})(exports.Event || (exports.Event = {}));
    	class CallbackList {
    	    add(callback, context = null, bucket) {
    	        if (!this._callbacks) {
    	            this._callbacks = [];
    	            this._contexts = [];
    	        }
    	        this._callbacks.push(callback);
    	        this._contexts.push(context);
    	        if (Array.isArray(bucket)) {
    	            bucket.push({ dispose: () => this.remove(callback, context) });
    	        }
    	    }
    	    remove(callback, context = null) {
    	        if (!this._callbacks) {
    	            return;
    	        }
    	        var foundCallbackWithDifferentContext = false;
    	        for (var i = 0, len = this._callbacks.length; i < len; i++) {
    	            if (this._callbacks[i] === callback) {
    	                if (this._contexts[i] === context) {
    	                    // callback & context match => remove it
    	                    this._callbacks.splice(i, 1);
    	                    this._contexts.splice(i, 1);
    	                    return;
    	                }
    	                else {
    	                    foundCallbackWithDifferentContext = true;
    	                }
    	            }
    	        }
    	        if (foundCallbackWithDifferentContext) {
    	            throw new Error('When adding a listener with a context, you should remove it with the same context');
    	        }
    	    }
    	    invoke(...args) {
    	        if (!this._callbacks) {
    	            return [];
    	        }
    	        var ret = [], callbacks = this._callbacks.slice(0), contexts = this._contexts.slice(0);
    	        for (var i = 0, len = callbacks.length; i < len; i++) {
    	            try {
    	                ret.push(callbacks[i].apply(contexts[i], args));
    	            }
    	            catch (e) {
    	                // eslint-disable-next-line no-console
    	                console.error(e);
    	            }
    	        }
    	        return ret;
    	    }
    	    isEmpty() {
    	        return !this._callbacks || this._callbacks.length === 0;
    	    }
    	    dispose() {
    	        this._callbacks = undefined;
    	        this._contexts = undefined;
    	    }
    	}
    	class Emitter {
    	    constructor(_options) {
    	        this._options = _options;
    	    }
    	    /**
    	     * For the public to allow to subscribe
    	     * to events from this Emitter
    	     */
    	    get event() {
    	        if (!this._event) {
    	            this._event = (listener, thisArgs, disposables) => {
    	                if (!this._callbacks) {
    	                    this._callbacks = new CallbackList();
    	                }
    	                if (this._options && this._options.onFirstListenerAdd && this._callbacks.isEmpty()) {
    	                    this._options.onFirstListenerAdd(this);
    	                }
    	                this._callbacks.add(listener, thisArgs);
    	                let result;
    	                result = {
    	                    dispose: () => {
    	                        this._callbacks.remove(listener, thisArgs);
    	                        result.dispose = Emitter._noop;
    	                        if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
    	                            this._options.onLastListenerRemove(this);
    	                        }
    	                    }
    	                };
    	                if (Array.isArray(disposables)) {
    	                    disposables.push(result);
    	                }
    	                return result;
    	            };
    	        }
    	        return this._event;
    	    }
    	    /**
    	     * To be kept private to fire an event to
    	     * subscribers
    	     */
    	    fire(event) {
    	        if (this._callbacks) {
    	            this._callbacks.invoke.call(this._callbacks, event);
    	        }
    	    }
    	    dispose() {
    	        if (this._callbacks) {
    	            this._callbacks.dispose();
    	            this._callbacks = undefined;
    	        }
    	    }
    	}
    	exports.Emitter = Emitter;
    	Emitter._noop = function () { };
    } (events));

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */

    (function (exports) {
    	Object.defineProperty(exports, "__esModule", { value: true });
    	const events_1 = events;
    	const Is = is;
    	let DefaultSize = 8192;
    	let CR = Buffer.from('\r', 'ascii')[0];
    	let LF = Buffer.from('\n', 'ascii')[0];
    	let CRLF = '\r\n';
    	class MessageBuffer {
    	    constructor(encoding = 'utf8') {
    	        this.encoding = encoding;
    	        this.index = 0;
    	        this.buffer = Buffer.allocUnsafe(DefaultSize);
    	    }
    	    append(chunk) {
    	        var toAppend = chunk;
    	        if (typeof (chunk) === 'string') {
    	            var str = chunk;
    	            var bufferLen = Buffer.byteLength(str, this.encoding);
    	            toAppend = Buffer.allocUnsafe(bufferLen);
    	            toAppend.write(str, 0, bufferLen, this.encoding);
    	        }
    	        if (this.buffer.length - this.index >= toAppend.length) {
    	            toAppend.copy(this.buffer, this.index, 0, toAppend.length);
    	        }
    	        else {
    	            var newSize = (Math.ceil((this.index + toAppend.length) / DefaultSize) + 1) * DefaultSize;
    	            if (this.index === 0) {
    	                this.buffer = Buffer.allocUnsafe(newSize);
    	                toAppend.copy(this.buffer, 0, 0, toAppend.length);
    	            }
    	            else {
    	                this.buffer = Buffer.concat([this.buffer.slice(0, this.index), toAppend], newSize);
    	            }
    	        }
    	        this.index += toAppend.length;
    	    }
    	    tryReadHeaders() {
    	        let result = undefined;
    	        let current = 0;
    	        while (current + 3 < this.index && (this.buffer[current] !== CR || this.buffer[current + 1] !== LF || this.buffer[current + 2] !== CR || this.buffer[current + 3] !== LF)) {
    	            current++;
    	        }
    	        // No header / body separator found (e.g CRLFCRLF)
    	        if (current + 3 >= this.index) {
    	            return result;
    	        }
    	        result = Object.create(null);
    	        let headers = this.buffer.toString('ascii', 0, current).split(CRLF);
    	        headers.forEach((header) => {
    	            let index = header.indexOf(':');
    	            if (index === -1) {
    	                throw new Error('Message header must separate key and value using :');
    	            }
    	            let key = header.substr(0, index);
    	            let value = header.substr(index + 1).trim();
    	            result[key] = value;
    	        });
    	        let nextStart = current + 4;
    	        this.buffer = this.buffer.slice(nextStart);
    	        this.index = this.index - nextStart;
    	        return result;
    	    }
    	    tryReadContent(length) {
    	        if (this.index < length) {
    	            return null;
    	        }
    	        let result = this.buffer.toString(this.encoding, 0, length);
    	        let nextStart = length;
    	        this.buffer.copy(this.buffer, 0, nextStart);
    	        this.index = this.index - nextStart;
    	        return result;
    	    }
    	    get numberOfBytes() {
    	        return this.index;
    	    }
    	}
    	(function (MessageReader) {
    	    function is(value) {
    	        let candidate = value;
    	        return candidate && Is.func(candidate.listen) && Is.func(candidate.dispose) &&
    	            Is.func(candidate.onError) && Is.func(candidate.onClose) && Is.func(candidate.onPartialMessage);
    	    }
    	    MessageReader.is = is;
    	})(exports.MessageReader || (exports.MessageReader = {}));
    	class AbstractMessageReader {
    	    constructor() {
    	        this.errorEmitter = new events_1.Emitter();
    	        this.closeEmitter = new events_1.Emitter();
    	        this.partialMessageEmitter = new events_1.Emitter();
    	    }
    	    dispose() {
    	        this.errorEmitter.dispose();
    	        this.closeEmitter.dispose();
    	    }
    	    get onError() {
    	        return this.errorEmitter.event;
    	    }
    	    fireError(error) {
    	        this.errorEmitter.fire(this.asError(error));
    	    }
    	    get onClose() {
    	        return this.closeEmitter.event;
    	    }
    	    fireClose() {
    	        this.closeEmitter.fire(undefined);
    	    }
    	    get onPartialMessage() {
    	        return this.partialMessageEmitter.event;
    	    }
    	    firePartialMessage(info) {
    	        this.partialMessageEmitter.fire(info);
    	    }
    	    asError(error) {
    	        if (error instanceof Error) {
    	            return error;
    	        }
    	        else {
    	            return new Error(`Reader received error. Reason: ${Is.string(error.message) ? error.message : 'unknown'}`);
    	        }
    	    }
    	}
    	exports.AbstractMessageReader = AbstractMessageReader;
    	class StreamMessageReader extends AbstractMessageReader {
    	    constructor(readable, encoding = 'utf8') {
    	        super();
    	        this.readable = readable;
    	        this.buffer = new MessageBuffer(encoding);
    	        this._partialMessageTimeout = 10000;
    	    }
    	    set partialMessageTimeout(timeout) {
    	        this._partialMessageTimeout = timeout;
    	    }
    	    get partialMessageTimeout() {
    	        return this._partialMessageTimeout;
    	    }
    	    listen(callback) {
    	        this.nextMessageLength = -1;
    	        this.messageToken = 0;
    	        this.partialMessageTimer = undefined;
    	        this.callback = callback;
    	        this.readable.on('data', (data) => {
    	            this.onData(data);
    	        });
    	        this.readable.on('error', (error) => this.fireError(error));
    	        this.readable.on('close', () => this.fireClose());
    	    }
    	    onData(data) {
    	        this.buffer.append(data);
    	        while (true) {
    	            if (this.nextMessageLength === -1) {
    	                let headers = this.buffer.tryReadHeaders();
    	                if (!headers) {
    	                    return;
    	                }
    	                let contentLength = headers['Content-Length'];
    	                if (!contentLength) {
    	                    throw new Error('Header must provide a Content-Length property.');
    	                }
    	                let length = parseInt(contentLength);
    	                if (isNaN(length)) {
    	                    throw new Error('Content-Length value must be a number.');
    	                }
    	                this.nextMessageLength = length;
    	                // Take the encoding form the header. For compatibility
    	                // treat both utf-8 and utf8 as node utf8
    	            }
    	            var msg = this.buffer.tryReadContent(this.nextMessageLength);
    	            if (msg === null) {
    	                /** We haven't received the full message yet. */
    	                this.setPartialMessageTimer();
    	                return;
    	            }
    	            this.clearPartialMessageTimer();
    	            this.nextMessageLength = -1;
    	            this.messageToken++;
    	            var json = JSON.parse(msg);
    	            this.callback(json);
    	        }
    	    }
    	    clearPartialMessageTimer() {
    	        if (this.partialMessageTimer) {
    	            clearTimeout(this.partialMessageTimer);
    	            this.partialMessageTimer = undefined;
    	        }
    	    }
    	    setPartialMessageTimer() {
    	        this.clearPartialMessageTimer();
    	        if (this._partialMessageTimeout <= 0) {
    	            return;
    	        }
    	        this.partialMessageTimer = setTimeout((token, timeout) => {
    	            this.partialMessageTimer = undefined;
    	            if (token === this.messageToken) {
    	                this.firePartialMessage({ messageToken: token, waitingTime: timeout });
    	                this.setPartialMessageTimer();
    	            }
    	        }, this._partialMessageTimeout, this.messageToken, this._partialMessageTimeout);
    	    }
    	}
    	exports.StreamMessageReader = StreamMessageReader;
    	class IPCMessageReader extends AbstractMessageReader {
    	    constructor(process) {
    	        super();
    	        this.process = process;
    	        let eventEmitter = this.process;
    	        eventEmitter.on('error', (error) => this.fireError(error));
    	        eventEmitter.on('close', () => this.fireClose());
    	    }
    	    listen(callback) {
    	        this.process.on('message', callback);
    	    }
    	}
    	exports.IPCMessageReader = IPCMessageReader;
    	class SocketMessageReader extends StreamMessageReader {
    	    constructor(socket, encoding = 'utf-8') {
    	        super(socket, encoding);
    	    }
    	}
    	exports.SocketMessageReader = SocketMessageReader;
    } (messageReader));

    var messageWriter = {};

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */

    (function (exports) {
    	Object.defineProperty(exports, "__esModule", { value: true });
    	const events_1 = events;
    	const Is = is;
    	let ContentLength = 'Content-Length: ';
    	let CRLF = '\r\n';
    	(function (MessageWriter) {
    	    function is(value) {
    	        let candidate = value;
    	        return candidate && Is.func(candidate.dispose) && Is.func(candidate.onClose) &&
    	            Is.func(candidate.onError) && Is.func(candidate.write);
    	    }
    	    MessageWriter.is = is;
    	})(exports.MessageWriter || (exports.MessageWriter = {}));
    	class AbstractMessageWriter {
    	    constructor() {
    	        this.errorEmitter = new events_1.Emitter();
    	        this.closeEmitter = new events_1.Emitter();
    	    }
    	    dispose() {
    	        this.errorEmitter.dispose();
    	        this.closeEmitter.dispose();
    	    }
    	    get onError() {
    	        return this.errorEmitter.event;
    	    }
    	    fireError(error, message, count) {
    	        this.errorEmitter.fire([this.asError(error), message, count]);
    	    }
    	    get onClose() {
    	        return this.closeEmitter.event;
    	    }
    	    fireClose() {
    	        this.closeEmitter.fire(undefined);
    	    }
    	    asError(error) {
    	        if (error instanceof Error) {
    	            return error;
    	        }
    	        else {
    	            return new Error(`Writer received error. Reason: ${Is.string(error.message) ? error.message : 'unknown'}`);
    	        }
    	    }
    	}
    	exports.AbstractMessageWriter = AbstractMessageWriter;
    	class StreamMessageWriter extends AbstractMessageWriter {
    	    constructor(writable, encoding = 'utf8') {
    	        super();
    	        this.writable = writable;
    	        this.encoding = encoding;
    	        this.errorCount = 0;
    	        this.writable.on('error', (error) => this.fireError(error));
    	        this.writable.on('close', () => this.fireClose());
    	    }
    	    write(msg) {
    	        let json = JSON.stringify(msg);
    	        let contentLength = Buffer.byteLength(json, this.encoding);
    	        let headers = [
    	            ContentLength, contentLength.toString(), CRLF,
    	            CRLF
    	        ];
    	        try {
    	            // Header must be written in ASCII encoding
    	            this.writable.write(headers.join(''), 'ascii');
    	            // Now write the content. This can be written in any encoding
    	            this.writable.write(json, this.encoding);
    	            this.errorCount = 0;
    	        }
    	        catch (error) {
    	            this.errorCount++;
    	            this.fireError(error, msg, this.errorCount);
    	        }
    	    }
    	}
    	exports.StreamMessageWriter = StreamMessageWriter;
    	class IPCMessageWriter extends AbstractMessageWriter {
    	    constructor(process) {
    	        super();
    	        this.process = process;
    	        this.errorCount = 0;
    	        this.queue = [];
    	        this.sending = false;
    	        let eventEmitter = this.process;
    	        eventEmitter.on('error', (error) => this.fireError(error));
    	        eventEmitter.on('close', () => this.fireClose);
    	    }
    	    write(msg) {
    	        if (!this.sending && this.queue.length === 0) {
    	            // See https://github.com/nodejs/node/issues/7657
    	            this.doWriteMessage(msg);
    	        }
    	        else {
    	            this.queue.push(msg);
    	        }
    	    }
    	    doWriteMessage(msg) {
    	        try {
    	            if (this.process.send) {
    	                this.sending = true;
    	                this.process.send(msg, undefined, undefined, (error) => {
    	                    this.sending = false;
    	                    if (error) {
    	                        this.errorCount++;
    	                        this.fireError(error, msg, this.errorCount);
    	                    }
    	                    else {
    	                        this.errorCount = 0;
    	                    }
    	                    if (this.queue.length > 0) {
    	                        this.doWriteMessage(this.queue.shift());
    	                    }
    	                });
    	            }
    	        }
    	        catch (error) {
    	            this.errorCount++;
    	            this.fireError(error, msg, this.errorCount);
    	        }
    	    }
    	}
    	exports.IPCMessageWriter = IPCMessageWriter;
    	class SocketMessageWriter extends AbstractMessageWriter {
    	    constructor(socket, encoding = 'utf8') {
    	        super();
    	        this.socket = socket;
    	        this.queue = [];
    	        this.sending = false;
    	        this.encoding = encoding;
    	        this.errorCount = 0;
    	        this.socket.on('error', (error) => this.fireError(error));
    	        this.socket.on('close', () => this.fireClose());
    	    }
    	    dispose() {
    	        super.dispose();
    	        this.socket.destroy();
    	    }
    	    write(msg) {
    	        if (!this.sending && this.queue.length === 0) {
    	            // See https://github.com/nodejs/node/issues/7657
    	            this.doWriteMessage(msg);
    	        }
    	        else {
    	            this.queue.push(msg);
    	        }
    	    }
    	    doWriteMessage(msg) {
    	        let json = JSON.stringify(msg);
    	        let contentLength = Buffer.byteLength(json, this.encoding);
    	        let headers = [
    	            ContentLength, contentLength.toString(), CRLF,
    	            CRLF
    	        ];
    	        try {
    	            // Header must be written in ASCII encoding
    	            this.sending = true;
    	            this.socket.write(headers.join(''), 'ascii', (error) => {
    	                if (error) {
    	                    this.handleError(error, msg);
    	                }
    	                try {
    	                    // Now write the content. This can be written in any encoding
    	                    this.socket.write(json, this.encoding, (error) => {
    	                        this.sending = false;
    	                        if (error) {
    	                            this.handleError(error, msg);
    	                        }
    	                        else {
    	                            this.errorCount = 0;
    	                        }
    	                        if (this.queue.length > 0) {
    	                            this.doWriteMessage(this.queue.shift());
    	                        }
    	                    });
    	                }
    	                catch (error) {
    	                    this.handleError(error, msg);
    	                }
    	            });
    	        }
    	        catch (error) {
    	            this.handleError(error, msg);
    	        }
    	    }
    	    handleError(error, msg) {
    	        this.errorCount++;
    	        this.fireError(error, msg, this.errorCount);
    	    }
    	}
    	exports.SocketMessageWriter = SocketMessageWriter;
    } (messageWriter));

    var cancellation = {};

    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/

    (function (exports) {
    	Object.defineProperty(exports, "__esModule", { value: true });
    	const events_1 = events;
    	const Is = is;
    	var CancellationToken;
    	(function (CancellationToken) {
    	    CancellationToken.None = Object.freeze({
    	        isCancellationRequested: false,
    	        onCancellationRequested: events_1.Event.None
    	    });
    	    CancellationToken.Cancelled = Object.freeze({
    	        isCancellationRequested: true,
    	        onCancellationRequested: events_1.Event.None
    	    });
    	    function is(value) {
    	        let candidate = value;
    	        return candidate && (candidate === CancellationToken.None
    	            || candidate === CancellationToken.Cancelled
    	            || (Is.boolean(candidate.isCancellationRequested) && !!candidate.onCancellationRequested));
    	    }
    	    CancellationToken.is = is;
    	})(CancellationToken = exports.CancellationToken || (exports.CancellationToken = {}));
    	const shortcutEvent = Object.freeze(function (callback, context) {
    	    let handle = setTimeout(callback.bind(context), 0);
    	    return { dispose() { clearTimeout(handle); } };
    	});
    	class MutableToken {
    	    constructor() {
    	        this._isCancelled = false;
    	    }
    	    cancel() {
    	        if (!this._isCancelled) {
    	            this._isCancelled = true;
    	            if (this._emitter) {
    	                this._emitter.fire(undefined);
    	                this.dispose();
    	            }
    	        }
    	    }
    	    get isCancellationRequested() {
    	        return this._isCancelled;
    	    }
    	    get onCancellationRequested() {
    	        if (this._isCancelled) {
    	            return shortcutEvent;
    	        }
    	        if (!this._emitter) {
    	            this._emitter = new events_1.Emitter();
    	        }
    	        return this._emitter.event;
    	    }
    	    dispose() {
    	        if (this._emitter) {
    	            this._emitter.dispose();
    	            this._emitter = undefined;
    	        }
    	    }
    	}
    	class CancellationTokenSource {
    	    get token() {
    	        if (!this._token) {
    	            // be lazy and create the token only when
    	            // actually needed
    	            this._token = new MutableToken();
    	        }
    	        return this._token;
    	    }
    	    cancel() {
    	        if (!this._token) {
    	            // save an object by returning the default
    	            // cancelled token when cancellation happens
    	            // before someone asks for the token
    	            this._token = CancellationToken.Cancelled;
    	        }
    	        else {
    	            this._token.cancel();
    	        }
    	    }
    	    dispose() {
    	        if (!this._token) {
    	            // ensure to initialize with an empty token if we had none
    	            this._token = CancellationToken.None;
    	        }
    	        else if (this._token instanceof MutableToken) {
    	            // actually dispose
    	            this._token.dispose();
    	        }
    	    }
    	}
    	exports.CancellationTokenSource = CancellationTokenSource;
    } (cancellation));

    var linkedMap = {};

    (function (exports) {
    	/*---------------------------------------------------------------------------------------------
    	 *  Copyright (c) Microsoft Corporation. All rights reserved.
    	 *  Licensed under the MIT License. See License.txt in the project root for license information.
    	 *--------------------------------------------------------------------------------------------*/
    	Object.defineProperty(exports, "__esModule", { value: true });
    	var Touch;
    	(function (Touch) {
    	    Touch.None = 0;
    	    Touch.First = 1;
    	    Touch.Last = 2;
    	})(Touch = exports.Touch || (exports.Touch = {}));
    	class LinkedMap {
    	    constructor() {
    	        this._map = new Map();
    	        this._head = undefined;
    	        this._tail = undefined;
    	        this._size = 0;
    	    }
    	    clear() {
    	        this._map.clear();
    	        this._head = undefined;
    	        this._tail = undefined;
    	        this._size = 0;
    	    }
    	    isEmpty() {
    	        return !this._head && !this._tail;
    	    }
    	    get size() {
    	        return this._size;
    	    }
    	    has(key) {
    	        return this._map.has(key);
    	    }
    	    get(key) {
    	        const item = this._map.get(key);
    	        if (!item) {
    	            return undefined;
    	        }
    	        return item.value;
    	    }
    	    set(key, value, touch = Touch.None) {
    	        let item = this._map.get(key);
    	        if (item) {
    	            item.value = value;
    	            if (touch !== Touch.None) {
    	                this.touch(item, touch);
    	            }
    	        }
    	        else {
    	            item = { key, value, next: undefined, previous: undefined };
    	            switch (touch) {
    	                case Touch.None:
    	                    this.addItemLast(item);
    	                    break;
    	                case Touch.First:
    	                    this.addItemFirst(item);
    	                    break;
    	                case Touch.Last:
    	                    this.addItemLast(item);
    	                    break;
    	                default:
    	                    this.addItemLast(item);
    	                    break;
    	            }
    	            this._map.set(key, item);
    	            this._size++;
    	        }
    	    }
    	    delete(key) {
    	        const item = this._map.get(key);
    	        if (!item) {
    	            return false;
    	        }
    	        this._map.delete(key);
    	        this.removeItem(item);
    	        this._size--;
    	        return true;
    	    }
    	    shift() {
    	        if (!this._head && !this._tail) {
    	            return undefined;
    	        }
    	        if (!this._head || !this._tail) {
    	            throw new Error('Invalid list');
    	        }
    	        const item = this._head;
    	        this._map.delete(item.key);
    	        this.removeItem(item);
    	        this._size--;
    	        return item.value;
    	    }
    	    forEach(callbackfn, thisArg) {
    	        let current = this._head;
    	        while (current) {
    	            if (thisArg) {
    	                callbackfn.bind(thisArg)(current.value, current.key, this);
    	            }
    	            else {
    	                callbackfn(current.value, current.key, this);
    	            }
    	            current = current.next;
    	        }
    	    }
    	    forEachReverse(callbackfn, thisArg) {
    	        let current = this._tail;
    	        while (current) {
    	            if (thisArg) {
    	                callbackfn.bind(thisArg)(current.value, current.key, this);
    	            }
    	            else {
    	                callbackfn(current.value, current.key, this);
    	            }
    	            current = current.previous;
    	        }
    	    }
    	    values() {
    	        let result = [];
    	        let current = this._head;
    	        while (current) {
    	            result.push(current.value);
    	            current = current.next;
    	        }
    	        return result;
    	    }
    	    keys() {
    	        let result = [];
    	        let current = this._head;
    	        while (current) {
    	            result.push(current.key);
    	            current = current.next;
    	        }
    	        return result;
    	    }
    	    /* JSON RPC run on es5 which has no Symbol.iterator
    	    public keys(): IterableIterator<K> {
    	        let current = this._head;
    	        let iterator: IterableIterator<K> = {
    	            [Symbol.iterator]() {
    	                return iterator;
    	            },
    	            next():IteratorResult<K> {
    	                if (current) {
    	                    let result = { value: current.key, done: false };
    	                    current = current.next;
    	                    return result;
    	                } else {
    	                    return { value: undefined, done: true };
    	                }
    	            }
    	        };
    	        return iterator;
    	    }

    	    public values(): IterableIterator<V> {
    	        let current = this._head;
    	        let iterator: IterableIterator<V> = {
    	            [Symbol.iterator]() {
    	                return iterator;
    	            },
    	            next():IteratorResult<V> {
    	                if (current) {
    	                    let result = { value: current.value, done: false };
    	                    current = current.next;
    	                    return result;
    	                } else {
    	                    return { value: undefined, done: true };
    	                }
    	            }
    	        };
    	        return iterator;
    	    }
    	    */
    	    addItemFirst(item) {
    	        // First time Insert
    	        if (!this._head && !this._tail) {
    	            this._tail = item;
    	        }
    	        else if (!this._head) {
    	            throw new Error('Invalid list');
    	        }
    	        else {
    	            item.next = this._head;
    	            this._head.previous = item;
    	        }
    	        this._head = item;
    	    }
    	    addItemLast(item) {
    	        // First time Insert
    	        if (!this._head && !this._tail) {
    	            this._head = item;
    	        }
    	        else if (!this._tail) {
    	            throw new Error('Invalid list');
    	        }
    	        else {
    	            item.previous = this._tail;
    	            this._tail.next = item;
    	        }
    	        this._tail = item;
    	    }
    	    removeItem(item) {
    	        if (item === this._head && item === this._tail) {
    	            this._head = undefined;
    	            this._tail = undefined;
    	        }
    	        else if (item === this._head) {
    	            this._head = item.next;
    	        }
    	        else if (item === this._tail) {
    	            this._tail = item.previous;
    	        }
    	        else {
    	            const next = item.next;
    	            const previous = item.previous;
    	            if (!next || !previous) {
    	                throw new Error('Invalid list');
    	            }
    	            next.previous = previous;
    	            previous.next = next;
    	        }
    	    }
    	    touch(item, touch) {
    	        if (!this._head || !this._tail) {
    	            throw new Error('Invalid list');
    	        }
    	        if ((touch !== Touch.First && touch !== Touch.Last)) {
    	            return;
    	        }
    	        if (touch === Touch.First) {
    	            if (item === this._head) {
    	                return;
    	            }
    	            const next = item.next;
    	            const previous = item.previous;
    	            // Unlink the item
    	            if (item === this._tail) {
    	                // previous must be defined since item was not head but is tail
    	                // So there are more than on item in the map
    	                previous.next = undefined;
    	                this._tail = previous;
    	            }
    	            else {
    	                // Both next and previous are not undefined since item was neither head nor tail.
    	                next.previous = previous;
    	                previous.next = next;
    	            }
    	            // Insert the node at head
    	            item.previous = undefined;
    	            item.next = this._head;
    	            this._head.previous = item;
    	            this._head = item;
    	        }
    	        else if (touch === Touch.Last) {
    	            if (item === this._tail) {
    	                return;
    	            }
    	            const next = item.next;
    	            const previous = item.previous;
    	            // Unlink the item.
    	            if (item === this._head) {
    	                // next must be defined since item was not tail but is head
    	                // So there are more than on item in the map
    	                next.previous = undefined;
    	                this._head = next;
    	            }
    	            else {
    	                // Both next and previous are not undefined since item was neither head nor tail.
    	                next.previous = previous;
    	                previous.next = next;
    	            }
    	            item.next = undefined;
    	            item.previous = this._tail;
    	            this._tail.next = item;
    	            this._tail = item;
    	        }
    	    }
    	}
    	exports.LinkedMap = LinkedMap;
    } (linkedMap));

    var pipeSupport = {};

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */
    Object.defineProperty(pipeSupport, "__esModule", { value: true });
    const path_1 = require$$0;
    const os_1 = require$$1;
    const crypto_1 = require$$2;
    const net_1$1 = require$$3;
    const messageReader_1$1 = messageReader;
    const messageWriter_1$1 = messageWriter;
    function generateRandomPipeName() {
        const randomSuffix = crypto_1.randomBytes(21).toString('hex');
        if (process.platform === 'win32') {
            return `\\\\.\\pipe\\vscode-jsonrpc-${randomSuffix}-sock`;
        }
        else {
            // Mac/Unix: use socket file
            return path_1.join(os_1.tmpdir(), `vscode-${randomSuffix}.sock`);
        }
    }
    pipeSupport.generateRandomPipeName = generateRandomPipeName;
    function createClientPipeTransport(pipeName, encoding = 'utf-8') {
        let connectResolve;
        let connected = new Promise((resolve, _reject) => {
            connectResolve = resolve;
        });
        return new Promise((resolve, reject) => {
            let server = net_1$1.createServer((socket) => {
                server.close();
                connectResolve([
                    new messageReader_1$1.SocketMessageReader(socket, encoding),
                    new messageWriter_1$1.SocketMessageWriter(socket, encoding)
                ]);
            });
            server.on('error', reject);
            server.listen(pipeName, () => {
                server.removeListener('error', reject);
                resolve({
                    onConnected: () => { return connected; }
                });
            });
        });
    }
    pipeSupport.createClientPipeTransport = createClientPipeTransport;
    function createServerPipeTransport(pipeName, encoding = 'utf-8') {
        const socket = net_1$1.createConnection(pipeName);
        return [
            new messageReader_1$1.SocketMessageReader(socket, encoding),
            new messageWriter_1$1.SocketMessageWriter(socket, encoding)
        ];
    }
    pipeSupport.createServerPipeTransport = createServerPipeTransport;

    var socketSupport = {};

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */
    Object.defineProperty(socketSupport, "__esModule", { value: true });
    const net_1 = require$$3;
    const messageReader_1 = messageReader;
    const messageWriter_1 = messageWriter;
    function createClientSocketTransport(port, encoding = 'utf-8') {
        let connectResolve;
        let connected = new Promise((resolve, _reject) => {
            connectResolve = resolve;
        });
        return new Promise((resolve, reject) => {
            let server = net_1.createServer((socket) => {
                server.close();
                connectResolve([
                    new messageReader_1.SocketMessageReader(socket, encoding),
                    new messageWriter_1.SocketMessageWriter(socket, encoding)
                ]);
            });
            server.on('error', reject);
            server.listen(port, '127.0.0.1', () => {
                server.removeListener('error', reject);
                resolve({
                    onConnected: () => { return connected; }
                });
            });
        });
    }
    socketSupport.createClientSocketTransport = createClientSocketTransport;
    function createServerSocketTransport(port, encoding = 'utf-8') {
        const socket = net_1.createConnection(port, '127.0.0.1');
        return [
            new messageReader_1.SocketMessageReader(socket, encoding),
            new messageWriter_1.SocketMessageWriter(socket, encoding)
        ];
    }
    socketSupport.createServerSocketTransport = createServerSocketTransport;

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */

    (function (exports) {
    	function __export(m) {
    	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    	}
    	Object.defineProperty(exports, "__esModule", { value: true });
    	const Is = is;
    	const messages_1 = messages;
    	exports.RequestType = messages_1.RequestType;
    	exports.RequestType0 = messages_1.RequestType0;
    	exports.RequestType1 = messages_1.RequestType1;
    	exports.RequestType2 = messages_1.RequestType2;
    	exports.RequestType3 = messages_1.RequestType3;
    	exports.RequestType4 = messages_1.RequestType4;
    	exports.RequestType5 = messages_1.RequestType5;
    	exports.RequestType6 = messages_1.RequestType6;
    	exports.RequestType7 = messages_1.RequestType7;
    	exports.RequestType8 = messages_1.RequestType8;
    	exports.RequestType9 = messages_1.RequestType9;
    	exports.ResponseError = messages_1.ResponseError;
    	exports.ErrorCodes = messages_1.ErrorCodes;
    	exports.NotificationType = messages_1.NotificationType;
    	exports.NotificationType0 = messages_1.NotificationType0;
    	exports.NotificationType1 = messages_1.NotificationType1;
    	exports.NotificationType2 = messages_1.NotificationType2;
    	exports.NotificationType3 = messages_1.NotificationType3;
    	exports.NotificationType4 = messages_1.NotificationType4;
    	exports.NotificationType5 = messages_1.NotificationType5;
    	exports.NotificationType6 = messages_1.NotificationType6;
    	exports.NotificationType7 = messages_1.NotificationType7;
    	exports.NotificationType8 = messages_1.NotificationType8;
    	exports.NotificationType9 = messages_1.NotificationType9;
    	const messageReader_1 = messageReader;
    	exports.MessageReader = messageReader_1.MessageReader;
    	exports.StreamMessageReader = messageReader_1.StreamMessageReader;
    	exports.IPCMessageReader = messageReader_1.IPCMessageReader;
    	exports.SocketMessageReader = messageReader_1.SocketMessageReader;
    	const messageWriter_1 = messageWriter;
    	exports.MessageWriter = messageWriter_1.MessageWriter;
    	exports.StreamMessageWriter = messageWriter_1.StreamMessageWriter;
    	exports.IPCMessageWriter = messageWriter_1.IPCMessageWriter;
    	exports.SocketMessageWriter = messageWriter_1.SocketMessageWriter;
    	const events_1 = events;
    	exports.Disposable = events_1.Disposable;
    	exports.Event = events_1.Event;
    	exports.Emitter = events_1.Emitter;
    	const cancellation_1 = cancellation;
    	exports.CancellationTokenSource = cancellation_1.CancellationTokenSource;
    	exports.CancellationToken = cancellation_1.CancellationToken;
    	const linkedMap_1 = linkedMap;
    	__export(pipeSupport);
    	__export(socketSupport);
    	var CancelNotification;
    	(function (CancelNotification) {
    	    CancelNotification.type = new messages_1.NotificationType('$/cancelRequest');
    	})(CancelNotification || (CancelNotification = {}));
    	var ProgressNotification;
    	(function (ProgressNotification) {
    	    ProgressNotification.type = new messages_1.NotificationType('$/progress');
    	})(ProgressNotification || (ProgressNotification = {}));
    	class ProgressType {
    	    constructor() {
    	    }
    	}
    	exports.ProgressType = ProgressType;
    	exports.NullLogger = Object.freeze({
    	    error: () => { },
    	    warn: () => { },
    	    info: () => { },
    	    log: () => { }
    	});
    	var Trace;
    	(function (Trace) {
    	    Trace[Trace["Off"] = 0] = "Off";
    	    Trace[Trace["Messages"] = 1] = "Messages";
    	    Trace[Trace["Verbose"] = 2] = "Verbose";
    	})(Trace = exports.Trace || (exports.Trace = {}));
    	(function (Trace) {
    	    function fromString(value) {
    	        if (!Is.string(value)) {
    	            return Trace.Off;
    	        }
    	        value = value.toLowerCase();
    	        switch (value) {
    	            case 'off':
    	                return Trace.Off;
    	            case 'messages':
    	                return Trace.Messages;
    	            case 'verbose':
    	                return Trace.Verbose;
    	            default:
    	                return Trace.Off;
    	        }
    	    }
    	    Trace.fromString = fromString;
    	    function toString(value) {
    	        switch (value) {
    	            case Trace.Off:
    	                return 'off';
    	            case Trace.Messages:
    	                return 'messages';
    	            case Trace.Verbose:
    	                return 'verbose';
    	            default:
    	                return 'off';
    	        }
    	    }
    	    Trace.toString = toString;
    	})(Trace = exports.Trace || (exports.Trace = {}));
    	var TraceFormat;
    	(function (TraceFormat) {
    	    TraceFormat["Text"] = "text";
    	    TraceFormat["JSON"] = "json";
    	})(TraceFormat = exports.TraceFormat || (exports.TraceFormat = {}));
    	(function (TraceFormat) {
    	    function fromString(value) {
    	        value = value.toLowerCase();
    	        if (value === 'json') {
    	            return TraceFormat.JSON;
    	        }
    	        else {
    	            return TraceFormat.Text;
    	        }
    	    }
    	    TraceFormat.fromString = fromString;
    	})(TraceFormat = exports.TraceFormat || (exports.TraceFormat = {}));
    	var SetTraceNotification;
    	(function (SetTraceNotification) {
    	    SetTraceNotification.type = new messages_1.NotificationType('$/setTraceNotification');
    	})(SetTraceNotification = exports.SetTraceNotification || (exports.SetTraceNotification = {}));
    	var LogTraceNotification;
    	(function (LogTraceNotification) {
    	    LogTraceNotification.type = new messages_1.NotificationType('$/logTraceNotification');
    	})(LogTraceNotification = exports.LogTraceNotification || (exports.LogTraceNotification = {}));
    	var ConnectionErrors;
    	(function (ConnectionErrors) {
    	    /**
    	     * The connection is closed.
    	     */
    	    ConnectionErrors[ConnectionErrors["Closed"] = 1] = "Closed";
    	    /**
    	     * The connection got disposed.
    	     */
    	    ConnectionErrors[ConnectionErrors["Disposed"] = 2] = "Disposed";
    	    /**
    	     * The connection is already in listening mode.
    	     */
    	    ConnectionErrors[ConnectionErrors["AlreadyListening"] = 3] = "AlreadyListening";
    	})(ConnectionErrors = exports.ConnectionErrors || (exports.ConnectionErrors = {}));
    	class ConnectionError extends Error {
    	    constructor(code, message) {
    	        super(message);
    	        this.code = code;
    	        Object.setPrototypeOf(this, ConnectionError.prototype);
    	    }
    	}
    	exports.ConnectionError = ConnectionError;
    	(function (ConnectionStrategy) {
    	    function is(value) {
    	        let candidate = value;
    	        return candidate && Is.func(candidate.cancelUndispatched);
    	    }
    	    ConnectionStrategy.is = is;
    	})(exports.ConnectionStrategy || (exports.ConnectionStrategy = {}));
    	var ConnectionState;
    	(function (ConnectionState) {
    	    ConnectionState[ConnectionState["New"] = 1] = "New";
    	    ConnectionState[ConnectionState["Listening"] = 2] = "Listening";
    	    ConnectionState[ConnectionState["Closed"] = 3] = "Closed";
    	    ConnectionState[ConnectionState["Disposed"] = 4] = "Disposed";
    	})(ConnectionState || (ConnectionState = {}));
    	function _createMessageConnection(messageReader, messageWriter, logger, strategy) {
    	    let sequenceNumber = 0;
    	    let notificationSquenceNumber = 0;
    	    let unknownResponseSquenceNumber = 0;
    	    const version = '2.0';
    	    let starRequestHandler = undefined;
    	    let requestHandlers = Object.create(null);
    	    let starNotificationHandler = undefined;
    	    let notificationHandlers = Object.create(null);
    	    let progressHandlers = new Map();
    	    let timer;
    	    let messageQueue = new linkedMap_1.LinkedMap();
    	    let responsePromises = Object.create(null);
    	    let requestTokens = Object.create(null);
    	    let trace = Trace.Off;
    	    let traceFormat = TraceFormat.Text;
    	    let tracer;
    	    let state = ConnectionState.New;
    	    let errorEmitter = new events_1.Emitter();
    	    let closeEmitter = new events_1.Emitter();
    	    let unhandledNotificationEmitter = new events_1.Emitter();
    	    let unhandledProgressEmitter = new events_1.Emitter();
    	    let disposeEmitter = new events_1.Emitter();
    	    function createRequestQueueKey(id) {
    	        return 'req-' + id.toString();
    	    }
    	    function createResponseQueueKey(id) {
    	        if (id === null) {
    	            return 'res-unknown-' + (++unknownResponseSquenceNumber).toString();
    	        }
    	        else {
    	            return 'res-' + id.toString();
    	        }
    	    }
    	    function createNotificationQueueKey() {
    	        return 'not-' + (++notificationSquenceNumber).toString();
    	    }
    	    function addMessageToQueue(queue, message) {
    	        if (messages_1.isRequestMessage(message)) {
    	            queue.set(createRequestQueueKey(message.id), message);
    	        }
    	        else if (messages_1.isResponseMessage(message)) {
    	            queue.set(createResponseQueueKey(message.id), message);
    	        }
    	        else {
    	            queue.set(createNotificationQueueKey(), message);
    	        }
    	    }
    	    function cancelUndispatched(_message) {
    	        return undefined;
    	    }
    	    function isListening() {
    	        return state === ConnectionState.Listening;
    	    }
    	    function isClosed() {
    	        return state === ConnectionState.Closed;
    	    }
    	    function isDisposed() {
    	        return state === ConnectionState.Disposed;
    	    }
    	    function closeHandler() {
    	        if (state === ConnectionState.New || state === ConnectionState.Listening) {
    	            state = ConnectionState.Closed;
    	            closeEmitter.fire(undefined);
    	        }
    	        // If the connection is disposed don't sent close events.
    	    }
    	    function readErrorHandler(error) {
    	        errorEmitter.fire([error, undefined, undefined]);
    	    }
    	    function writeErrorHandler(data) {
    	        errorEmitter.fire(data);
    	    }
    	    messageReader.onClose(closeHandler);
    	    messageReader.onError(readErrorHandler);
    	    messageWriter.onClose(closeHandler);
    	    messageWriter.onError(writeErrorHandler);
    	    function triggerMessageQueue() {
    	        if (timer || messageQueue.size === 0) {
    	            return;
    	        }
    	        timer = setImmediate(() => {
    	            timer = undefined;
    	            processMessageQueue();
    	        });
    	    }
    	    function processMessageQueue() {
    	        if (messageQueue.size === 0) {
    	            return;
    	        }
    	        let message = messageQueue.shift();
    	        try {
    	            if (messages_1.isRequestMessage(message)) {
    	                handleRequest(message);
    	            }
    	            else if (messages_1.isNotificationMessage(message)) {
    	                handleNotification(message);
    	            }
    	            else if (messages_1.isResponseMessage(message)) {
    	                handleResponse(message);
    	            }
    	            else {
    	                handleInvalidMessage(message);
    	            }
    	        }
    	        finally {
    	            triggerMessageQueue();
    	        }
    	    }
    	    let callback = (message) => {
    	        try {
    	            // We have received a cancellation message. Check if the message is still in the queue
    	            // and cancel it if allowed to do so.
    	            if (messages_1.isNotificationMessage(message) && message.method === CancelNotification.type.method) {
    	                let key = createRequestQueueKey(message.params.id);
    	                let toCancel = messageQueue.get(key);
    	                if (messages_1.isRequestMessage(toCancel)) {
    	                    let response = strategy && strategy.cancelUndispatched ? strategy.cancelUndispatched(toCancel, cancelUndispatched) : cancelUndispatched(toCancel);
    	                    if (response && (response.error !== void 0 || response.result !== void 0)) {
    	                        messageQueue.delete(key);
    	                        response.id = toCancel.id;
    	                        traceSendingResponse(response, message.method, Date.now());
    	                        messageWriter.write(response);
    	                        return;
    	                    }
    	                }
    	            }
    	            addMessageToQueue(messageQueue, message);
    	        }
    	        finally {
    	            triggerMessageQueue();
    	        }
    	    };
    	    function handleRequest(requestMessage) {
    	        if (isDisposed()) {
    	            // we return here silently since we fired an event when the
    	            // connection got disposed.
    	            return;
    	        }
    	        function reply(resultOrError, method, startTime) {
    	            let message = {
    	                jsonrpc: version,
    	                id: requestMessage.id
    	            };
    	            if (resultOrError instanceof messages_1.ResponseError) {
    	                message.error = resultOrError.toJson();
    	            }
    	            else {
    	                message.result = resultOrError === void 0 ? null : resultOrError;
    	            }
    	            traceSendingResponse(message, method, startTime);
    	            messageWriter.write(message);
    	        }
    	        function replyError(error, method, startTime) {
    	            let message = {
    	                jsonrpc: version,
    	                id: requestMessage.id,
    	                error: error.toJson()
    	            };
    	            traceSendingResponse(message, method, startTime);
    	            messageWriter.write(message);
    	        }
    	        function replySuccess(result, method, startTime) {
    	            // The JSON RPC defines that a response must either have a result or an error
    	            // So we can't treat undefined as a valid response result.
    	            if (result === void 0) {
    	                result = null;
    	            }
    	            let message = {
    	                jsonrpc: version,
    	                id: requestMessage.id,
    	                result: result
    	            };
    	            traceSendingResponse(message, method, startTime);
    	            messageWriter.write(message);
    	        }
    	        traceReceivedRequest(requestMessage);
    	        let element = requestHandlers[requestMessage.method];
    	        let type;
    	        let requestHandler;
    	        if (element) {
    	            type = element.type;
    	            requestHandler = element.handler;
    	        }
    	        let startTime = Date.now();
    	        if (requestHandler || starRequestHandler) {
    	            let cancellationSource = new cancellation_1.CancellationTokenSource();
    	            let tokenKey = String(requestMessage.id);
    	            requestTokens[tokenKey] = cancellationSource;
    	            try {
    	                let handlerResult;
    	                if (requestMessage.params === void 0 || (type !== void 0 && type.numberOfParams === 0)) {
    	                    handlerResult = requestHandler
    	                        ? requestHandler(cancellationSource.token)
    	                        : starRequestHandler(requestMessage.method, cancellationSource.token);
    	                }
    	                else if (Is.array(requestMessage.params) && (type === void 0 || type.numberOfParams > 1)) {
    	                    handlerResult = requestHandler
    	                        ? requestHandler(...requestMessage.params, cancellationSource.token)
    	                        : starRequestHandler(requestMessage.method, ...requestMessage.params, cancellationSource.token);
    	                }
    	                else {
    	                    handlerResult = requestHandler
    	                        ? requestHandler(requestMessage.params, cancellationSource.token)
    	                        : starRequestHandler(requestMessage.method, requestMessage.params, cancellationSource.token);
    	                }
    	                let promise = handlerResult;
    	                if (!handlerResult) {
    	                    delete requestTokens[tokenKey];
    	                    replySuccess(handlerResult, requestMessage.method, startTime);
    	                }
    	                else if (promise.then) {
    	                    promise.then((resultOrError) => {
    	                        delete requestTokens[tokenKey];
    	                        reply(resultOrError, requestMessage.method, startTime);
    	                    }, error => {
    	                        delete requestTokens[tokenKey];
    	                        if (error instanceof messages_1.ResponseError) {
    	                            replyError(error, requestMessage.method, startTime);
    	                        }
    	                        else if (error && Is.string(error.message)) {
    	                            replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
    	                        }
    	                        else {
    	                            replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
    	                        }
    	                    });
    	                }
    	                else {
    	                    delete requestTokens[tokenKey];
    	                    reply(handlerResult, requestMessage.method, startTime);
    	                }
    	            }
    	            catch (error) {
    	                delete requestTokens[tokenKey];
    	                if (error instanceof messages_1.ResponseError) {
    	                    reply(error, requestMessage.method, startTime);
    	                }
    	                else if (error && Is.string(error.message)) {
    	                    replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
    	                }
    	                else {
    	                    replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
    	                }
    	            }
    	        }
    	        else {
    	            replyError(new messages_1.ResponseError(messages_1.ErrorCodes.MethodNotFound, `Unhandled method ${requestMessage.method}`), requestMessage.method, startTime);
    	        }
    	    }
    	    function handleResponse(responseMessage) {
    	        if (isDisposed()) {
    	            // See handle request.
    	            return;
    	        }
    	        if (responseMessage.id === null) {
    	            if (responseMessage.error) {
    	                logger.error(`Received response message without id: Error is: \n${JSON.stringify(responseMessage.error, undefined, 4)}`);
    	            }
    	            else {
    	                logger.error(`Received response message without id. No further error information provided.`);
    	            }
    	        }
    	        else {
    	            let key = String(responseMessage.id);
    	            let responsePromise = responsePromises[key];
    	            traceReceivedResponse(responseMessage, responsePromise);
    	            if (responsePromise) {
    	                delete responsePromises[key];
    	                try {
    	                    if (responseMessage.error) {
    	                        let error = responseMessage.error;
    	                        responsePromise.reject(new messages_1.ResponseError(error.code, error.message, error.data));
    	                    }
    	                    else if (responseMessage.result !== void 0) {
    	                        responsePromise.resolve(responseMessage.result);
    	                    }
    	                    else {
    	                        throw new Error('Should never happen.');
    	                    }
    	                }
    	                catch (error) {
    	                    if (error.message) {
    	                        logger.error(`Response handler '${responsePromise.method}' failed with message: ${error.message}`);
    	                    }
    	                    else {
    	                        logger.error(`Response handler '${responsePromise.method}' failed unexpectedly.`);
    	                    }
    	                }
    	            }
    	        }
    	    }
    	    function handleNotification(message) {
    	        if (isDisposed()) {
    	            // See handle request.
    	            return;
    	        }
    	        let type = undefined;
    	        let notificationHandler;
    	        if (message.method === CancelNotification.type.method) {
    	            notificationHandler = (params) => {
    	                let id = params.id;
    	                let source = requestTokens[String(id)];
    	                if (source) {
    	                    source.cancel();
    	                }
    	            };
    	        }
    	        else {
    	            let element = notificationHandlers[message.method];
    	            if (element) {
    	                notificationHandler = element.handler;
    	                type = element.type;
    	            }
    	        }
    	        if (notificationHandler || starNotificationHandler) {
    	            try {
    	                traceReceivedNotification(message);
    	                if (message.params === void 0 || (type !== void 0 && type.numberOfParams === 0)) {
    	                    notificationHandler ? notificationHandler() : starNotificationHandler(message.method);
    	                }
    	                else if (Is.array(message.params) && (type === void 0 || type.numberOfParams > 1)) {
    	                    notificationHandler ? notificationHandler(...message.params) : starNotificationHandler(message.method, ...message.params);
    	                }
    	                else {
    	                    notificationHandler ? notificationHandler(message.params) : starNotificationHandler(message.method, message.params);
    	                }
    	            }
    	            catch (error) {
    	                if (error.message) {
    	                    logger.error(`Notification handler '${message.method}' failed with message: ${error.message}`);
    	                }
    	                else {
    	                    logger.error(`Notification handler '${message.method}' failed unexpectedly.`);
    	                }
    	            }
    	        }
    	        else {
    	            unhandledNotificationEmitter.fire(message);
    	        }
    	    }
    	    function handleInvalidMessage(message) {
    	        if (!message) {
    	            logger.error('Received empty message.');
    	            return;
    	        }
    	        logger.error(`Received message which is neither a response nor a notification message:\n${JSON.stringify(message, null, 4)}`);
    	        // Test whether we find an id to reject the promise
    	        let responseMessage = message;
    	        if (Is.string(responseMessage.id) || Is.number(responseMessage.id)) {
    	            let key = String(responseMessage.id);
    	            let responseHandler = responsePromises[key];
    	            if (responseHandler) {
    	                responseHandler.reject(new Error('The received response has neither a result nor an error property.'));
    	            }
    	        }
    	    }
    	    function traceSendingRequest(message) {
    	        if (trace === Trace.Off || !tracer) {
    	            return;
    	        }
    	        if (traceFormat === TraceFormat.Text) {
    	            let data = undefined;
    	            if (trace === Trace.Verbose && message.params) {
    	                data = `Params: ${JSON.stringify(message.params, null, 4)}\n\n`;
    	            }
    	            tracer.log(`Sending request '${message.method} - (${message.id})'.`, data);
    	        }
    	        else {
    	            logLSPMessage('send-request', message);
    	        }
    	    }
    	    function traceSendingNotification(message) {
    	        if (trace === Trace.Off || !tracer) {
    	            return;
    	        }
    	        if (traceFormat === TraceFormat.Text) {
    	            let data = undefined;
    	            if (trace === Trace.Verbose) {
    	                if (message.params) {
    	                    data = `Params: ${JSON.stringify(message.params, null, 4)}\n\n`;
    	                }
    	                else {
    	                    data = 'No parameters provided.\n\n';
    	                }
    	            }
    	            tracer.log(`Sending notification '${message.method}'.`, data);
    	        }
    	        else {
    	            logLSPMessage('send-notification', message);
    	        }
    	    }
    	    function traceSendingResponse(message, method, startTime) {
    	        if (trace === Trace.Off || !tracer) {
    	            return;
    	        }
    	        if (traceFormat === TraceFormat.Text) {
    	            let data = undefined;
    	            if (trace === Trace.Verbose) {
    	                if (message.error && message.error.data) {
    	                    data = `Error data: ${JSON.stringify(message.error.data, null, 4)}\n\n`;
    	                }
    	                else {
    	                    if (message.result) {
    	                        data = `Result: ${JSON.stringify(message.result, null, 4)}\n\n`;
    	                    }
    	                    else if (message.error === void 0) {
    	                        data = 'No result returned.\n\n';
    	                    }
    	                }
    	            }
    	            tracer.log(`Sending response '${method} - (${message.id})'. Processing request took ${Date.now() - startTime}ms`, data);
    	        }
    	        else {
    	            logLSPMessage('send-response', message);
    	        }
    	    }
    	    function traceReceivedRequest(message) {
    	        if (trace === Trace.Off || !tracer) {
    	            return;
    	        }
    	        if (traceFormat === TraceFormat.Text) {
    	            let data = undefined;
    	            if (trace === Trace.Verbose && message.params) {
    	                data = `Params: ${JSON.stringify(message.params, null, 4)}\n\n`;
    	            }
    	            tracer.log(`Received request '${message.method} - (${message.id})'.`, data);
    	        }
    	        else {
    	            logLSPMessage('receive-request', message);
    	        }
    	    }
    	    function traceReceivedNotification(message) {
    	        if (trace === Trace.Off || !tracer || message.method === LogTraceNotification.type.method) {
    	            return;
    	        }
    	        if (traceFormat === TraceFormat.Text) {
    	            let data = undefined;
    	            if (trace === Trace.Verbose) {
    	                if (message.params) {
    	                    data = `Params: ${JSON.stringify(message.params, null, 4)}\n\n`;
    	                }
    	                else {
    	                    data = 'No parameters provided.\n\n';
    	                }
    	            }
    	            tracer.log(`Received notification '${message.method}'.`, data);
    	        }
    	        else {
    	            logLSPMessage('receive-notification', message);
    	        }
    	    }
    	    function traceReceivedResponse(message, responsePromise) {
    	        if (trace === Trace.Off || !tracer) {
    	            return;
    	        }
    	        if (traceFormat === TraceFormat.Text) {
    	            let data = undefined;
    	            if (trace === Trace.Verbose) {
    	                if (message.error && message.error.data) {
    	                    data = `Error data: ${JSON.stringify(message.error.data, null, 4)}\n\n`;
    	                }
    	                else {
    	                    if (message.result) {
    	                        data = `Result: ${JSON.stringify(message.result, null, 4)}\n\n`;
    	                    }
    	                    else if (message.error === void 0) {
    	                        data = 'No result returned.\n\n';
    	                    }
    	                }
    	            }
    	            if (responsePromise) {
    	                let error = message.error ? ` Request failed: ${message.error.message} (${message.error.code}).` : '';
    	                tracer.log(`Received response '${responsePromise.method} - (${message.id})' in ${Date.now() - responsePromise.timerStart}ms.${error}`, data);
    	            }
    	            else {
    	                tracer.log(`Received response ${message.id} without active response promise.`, data);
    	            }
    	        }
    	        else {
    	            logLSPMessage('receive-response', message);
    	        }
    	    }
    	    function logLSPMessage(type, message) {
    	        if (!tracer || trace === Trace.Off) {
    	            return;
    	        }
    	        const lspMessage = {
    	            isLSPMessage: true,
    	            type,
    	            message,
    	            timestamp: Date.now()
    	        };
    	        tracer.log(lspMessage);
    	    }
    	    function throwIfClosedOrDisposed() {
    	        if (isClosed()) {
    	            throw new ConnectionError(ConnectionErrors.Closed, 'Connection is closed.');
    	        }
    	        if (isDisposed()) {
    	            throw new ConnectionError(ConnectionErrors.Disposed, 'Connection is disposed.');
    	        }
    	    }
    	    function throwIfListening() {
    	        if (isListening()) {
    	            throw new ConnectionError(ConnectionErrors.AlreadyListening, 'Connection is already listening');
    	        }
    	    }
    	    function throwIfNotListening() {
    	        if (!isListening()) {
    	            throw new Error('Call listen() first.');
    	        }
    	    }
    	    function undefinedToNull(param) {
    	        if (param === void 0) {
    	            return null;
    	        }
    	        else {
    	            return param;
    	        }
    	    }
    	    function computeMessageParams(type, params) {
    	        let result;
    	        let numberOfParams = type.numberOfParams;
    	        switch (numberOfParams) {
    	            case 0:
    	                result = null;
    	                break;
    	            case 1:
    	                result = undefinedToNull(params[0]);
    	                break;
    	            default:
    	                result = [];
    	                for (let i = 0; i < params.length && i < numberOfParams; i++) {
    	                    result.push(undefinedToNull(params[i]));
    	                }
    	                if (params.length < numberOfParams) {
    	                    for (let i = params.length; i < numberOfParams; i++) {
    	                        result.push(null);
    	                    }
    	                }
    	                break;
    	        }
    	        return result;
    	    }
    	    let connection = {
    	        sendNotification: (type, ...params) => {
    	            throwIfClosedOrDisposed();
    	            let method;
    	            let messageParams;
    	            if (Is.string(type)) {
    	                method = type;
    	                switch (params.length) {
    	                    case 0:
    	                        messageParams = null;
    	                        break;
    	                    case 1:
    	                        messageParams = params[0];
    	                        break;
    	                    default:
    	                        messageParams = params;
    	                        break;
    	                }
    	            }
    	            else {
    	                method = type.method;
    	                messageParams = computeMessageParams(type, params);
    	            }
    	            let notificationMessage = {
    	                jsonrpc: version,
    	                method: method,
    	                params: messageParams
    	            };
    	            traceSendingNotification(notificationMessage);
    	            messageWriter.write(notificationMessage);
    	        },
    	        onNotification: (type, handler) => {
    	            throwIfClosedOrDisposed();
    	            if (Is.func(type)) {
    	                starNotificationHandler = type;
    	            }
    	            else if (handler) {
    	                if (Is.string(type)) {
    	                    notificationHandlers[type] = { type: undefined, handler };
    	                }
    	                else {
    	                    notificationHandlers[type.method] = { type, handler };
    	                }
    	            }
    	        },
    	        onProgress: (_type, token, handler) => {
    	            if (progressHandlers.has(token)) {
    	                throw new Error(`Progress handler for token ${token} already registered`);
    	            }
    	            progressHandlers.set(token, handler);
    	            return {
    	                dispose: () => {
    	                    progressHandlers.delete(token);
    	                }
    	            };
    	        },
    	        sendProgress: (_type, token, value) => {
    	            connection.sendNotification(ProgressNotification.type, { token, value });
    	        },
    	        onUnhandledProgress: unhandledProgressEmitter.event,
    	        sendRequest: (type, ...params) => {
    	            throwIfClosedOrDisposed();
    	            throwIfNotListening();
    	            let method;
    	            let messageParams;
    	            let token = undefined;
    	            if (Is.string(type)) {
    	                method = type;
    	                switch (params.length) {
    	                    case 0:
    	                        messageParams = null;
    	                        break;
    	                    case 1:
    	                        // The cancellation token is optional so it can also be undefined.
    	                        if (cancellation_1.CancellationToken.is(params[0])) {
    	                            messageParams = null;
    	                            token = params[0];
    	                        }
    	                        else {
    	                            messageParams = undefinedToNull(params[0]);
    	                        }
    	                        break;
    	                    default:
    	                        const last = params.length - 1;
    	                        if (cancellation_1.CancellationToken.is(params[last])) {
    	                            token = params[last];
    	                            if (params.length === 2) {
    	                                messageParams = undefinedToNull(params[0]);
    	                            }
    	                            else {
    	                                messageParams = params.slice(0, last).map(value => undefinedToNull(value));
    	                            }
    	                        }
    	                        else {
    	                            messageParams = params.map(value => undefinedToNull(value));
    	                        }
    	                        break;
    	                }
    	            }
    	            else {
    	                method = type.method;
    	                messageParams = computeMessageParams(type, params);
    	                let numberOfParams = type.numberOfParams;
    	                token = cancellation_1.CancellationToken.is(params[numberOfParams]) ? params[numberOfParams] : undefined;
    	            }
    	            let id = sequenceNumber++;
    	            let result = new Promise((resolve, reject) => {
    	                let requestMessage = {
    	                    jsonrpc: version,
    	                    id: id,
    	                    method: method,
    	                    params: messageParams
    	                };
    	                let responsePromise = { method: method, timerStart: Date.now(), resolve, reject };
    	                traceSendingRequest(requestMessage);
    	                try {
    	                    messageWriter.write(requestMessage);
    	                }
    	                catch (e) {
    	                    // Writing the message failed. So we need to reject the promise.
    	                    responsePromise.reject(new messages_1.ResponseError(messages_1.ErrorCodes.MessageWriteError, e.message ? e.message : 'Unknown reason'));
    	                    responsePromise = null;
    	                }
    	                if (responsePromise) {
    	                    responsePromises[String(id)] = responsePromise;
    	                }
    	            });
    	            if (token) {
    	                token.onCancellationRequested(() => {
    	                    connection.sendNotification(CancelNotification.type, { id });
    	                });
    	            }
    	            return result;
    	        },
    	        onRequest: (type, handler) => {
    	            throwIfClosedOrDisposed();
    	            if (Is.func(type)) {
    	                starRequestHandler = type;
    	            }
    	            else if (handler) {
    	                if (Is.string(type)) {
    	                    requestHandlers[type] = { type: undefined, handler };
    	                }
    	                else {
    	                    requestHandlers[type.method] = { type, handler };
    	                }
    	            }
    	        },
    	        trace: (_value, _tracer, sendNotificationOrTraceOptions) => {
    	            let _sendNotification = false;
    	            let _traceFormat = TraceFormat.Text;
    	            if (sendNotificationOrTraceOptions !== void 0) {
    	                if (Is.boolean(sendNotificationOrTraceOptions)) {
    	                    _sendNotification = sendNotificationOrTraceOptions;
    	                }
    	                else {
    	                    _sendNotification = sendNotificationOrTraceOptions.sendNotification || false;
    	                    _traceFormat = sendNotificationOrTraceOptions.traceFormat || TraceFormat.Text;
    	                }
    	            }
    	            trace = _value;
    	            traceFormat = _traceFormat;
    	            if (trace === Trace.Off) {
    	                tracer = undefined;
    	            }
    	            else {
    	                tracer = _tracer;
    	            }
    	            if (_sendNotification && !isClosed() && !isDisposed()) {
    	                connection.sendNotification(SetTraceNotification.type, { value: Trace.toString(_value) });
    	            }
    	        },
    	        onError: errorEmitter.event,
    	        onClose: closeEmitter.event,
    	        onUnhandledNotification: unhandledNotificationEmitter.event,
    	        onDispose: disposeEmitter.event,
    	        dispose: () => {
    	            if (isDisposed()) {
    	                return;
    	            }
    	            state = ConnectionState.Disposed;
    	            disposeEmitter.fire(undefined);
    	            let error = new Error('Connection got disposed.');
    	            Object.keys(responsePromises).forEach((key) => {
    	                responsePromises[key].reject(error);
    	            });
    	            responsePromises = Object.create(null);
    	            requestTokens = Object.create(null);
    	            messageQueue = new linkedMap_1.LinkedMap();
    	            // Test for backwards compatibility
    	            if (Is.func(messageWriter.dispose)) {
    	                messageWriter.dispose();
    	            }
    	            if (Is.func(messageReader.dispose)) {
    	                messageReader.dispose();
    	            }
    	        },
    	        listen: () => {
    	            throwIfClosedOrDisposed();
    	            throwIfListening();
    	            state = ConnectionState.Listening;
    	            messageReader.listen(callback);
    	        },
    	        inspect: () => {
    	            // eslint-disable-next-line no-console
    	            console.log('inspect');
    	        }
    	    };
    	    connection.onNotification(LogTraceNotification.type, (params) => {
    	        if (trace === Trace.Off || !tracer) {
    	            return;
    	        }
    	        tracer.log(params.message, trace === Trace.Verbose ? params.verbose : undefined);
    	    });
    	    connection.onNotification(ProgressNotification.type, (params) => {
    	        const handler = progressHandlers.get(params.token);
    	        if (handler) {
    	            handler(params.value);
    	        }
    	        else {
    	            unhandledProgressEmitter.fire(params);
    	        }
    	    });
    	    return connection;
    	}
    	function isMessageReader(value) {
    	    return value.listen !== void 0 && value.read === void 0;
    	}
    	function isMessageWriter(value) {
    	    return value.write !== void 0 && value.end === void 0;
    	}
    	function createMessageConnection(input, output, logger, strategy) {
    	    if (!logger) {
    	        logger = exports.NullLogger;
    	    }
    	    let reader = isMessageReader(input) ? input : new messageReader_1.StreamMessageReader(input);
    	    let writer = isMessageWriter(output) ? output : new messageWriter_1.StreamMessageWriter(output);
    	    return _createMessageConnection(reader, writer, logger, strategy);
    	}
    	exports.createMessageConnection = createMessageConnection;
    } (main));

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) 2024 TypeFox and others.
     * Licensed under the MIT License. See LICENSE in the package root for license information.
     * ------------------------------------------------------------------------------------------ */
    function createWebSocketConnection(socket, logger) {
        const messageReader = new WebSocketMessageReader(socket);
        const messageWriter = new WebSocketMessageWriter(socket);
        const connection = main.createMessageConnection(messageReader, messageWriter, logger);
        connection.onClose(() => connection.dispose());
        return connection;
    }

    class ConsoleLogger {
        error(message) {
            console.error(message);
        }
        warn(message) {
            console.warn(message);
        }
        info(message) {
            console.info(message);
        }
        log(message) {
            console.log(message);
        }
        debug(message) {
            console.debug(message);
        }
    }

    /* --------------------------------------------------------------------------------------------
     * Copyright (c) 2024 TypeFox and others.
     * Licensed under the MIT License. See LICENSE in the package root for license information.
     * ------------------------------------------------------------------------------------------ */
    function listen(options) {
        const { webSocket, onConnection } = options;
        const logger = options.logger || new ConsoleLogger();
        webSocket.onopen = () => {
            const socket = toSocket(webSocket);
            const connection = createWebSocketConnection(socket, logger);
            onConnection(connection);
        };
    }
    function toSocket(webSocket) {
        return {
            send: content => webSocket.send(content),
            onMessage: cb => {
                webSocket.onmessage = event => cb(event.data);
            },
            onError: cb => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                webSocket.onerror = (event) => {
                    if (Object.hasOwn(event, 'message')) {
                        cb(event.message);
                    }
                };
            },
            onClose: cb => {
                webSocket.onclose = event => cb(event.code, event.reason);
            },
            dispose: () => webSocket.close()
        };
    }

    exports.ConsoleLogger = ConsoleLogger;
    exports.DisposableCollection = DisposableCollection;
    exports.WebSocketMessageReader = WebSocketMessageReader;
    exports.WebSocketMessageWriter = WebSocketMessageWriter;
    exports.createWebSocketConnection = createWebSocketConnection;
    exports.listen = listen;
    exports.toSocket = toSocket;

    return exports;

})({}, require$$0, require$$1, require$$2, require$$3);
//# sourceMappingURL=index.global.js.map
