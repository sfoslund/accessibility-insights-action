// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { IMock, Mock, MockBehavior, Times } from 'typemoq';
import { VError } from 'verror';
import { BaseTelemetryProperties } from './base-telemetry-properties';
import { ConsoleLoggerClient } from './console-logger-client';
import { Logger } from './logger';
import { LoggerClient } from './logger-client';
import { LogLevel } from './log-level';

describe(Logger, () => {
    let loggerClient1Mock: IMock<LoggerClient>;
    let loggerClient2Mock: IMock<LoggerClient>;
    let testSubject: Logger;
    let processStub: typeof process;

    beforeEach(() => {
        processStub = { execArgv: ['--test'] } as typeof process;
        loggerClient1Mock = Mock.ofType2(ConsoleLoggerClient, null, MockBehavior.Strict);
        loggerClient2Mock = Mock.ofType2(ConsoleLoggerClient, null, MockBehavior.Strict);

        testSubject = new Logger([loggerClient1Mock.object, loggerClient2Mock.object], processStub);
    });

    describe('setup', () => {
        it('verify default setup', async () => {
            setupCallsForTelemetrySetup();

            await testSubject.setup();

            verifyMocks();
        });

        it('does not initialize more than once', async () => {
            const baseProps: BaseTelemetryProperties = { foo: 'bar', source: 'test-source' };

            setupCallsForTelemetrySetup(baseProps);

            await testSubject.setup(baseProps);
            await testSubject.setup(baseProps);

            verifyMocks();
        });

        it('initializes with additional common properties', async () => {
            const baseProps: BaseTelemetryProperties = { foo: 'bar', source: 'test-source' };

            setupCallsForTelemetrySetup(baseProps);

            await testSubject.setup(baseProps);

            verifyMocks();
        });
    });

    describe('log', () => {
        it('throw if called before setup', () => {
            expect(() => {
                testSubject.log('trace1', LogLevel.warning);
            }).toThrowError(
                'The logger instance is not initialized. Ensure the setup() method is invoked by derived class implementation.',
            );
        });

        it('when properties not passed', async () => {
            setupCallsForTelemetrySetup();
            await testSubject.setup();

            invokeAllLoggerClientMocks((m) => m.setup((c) => c.log('trace1', LogLevel.error, undefined)).verifiable(Times.once()));

            testSubject.log('trace1', LogLevel.error);

            verifyMocks();
        });

        it('when properties passed', async () => {
            const properties = { foo: 'bar' };
            setupCallsForTelemetrySetup();
            await testSubject.setup();

            invokeAllLoggerClientMocks((m) => m.setup((c) => c.log('trace1', LogLevel.error, properties)).verifiable(Times.once()));

            testSubject.log('trace1', LogLevel.error, properties);

            verifyMocks();
        });
    });

    describe('logInfo', () => {
        it('throw if called before setup', () => {
            expect(() => {
                testSubject.logInfo('info1');
            }).toThrowError(
                'The logger instance is not initialized. Ensure the setup() method is invoked by derived class implementation.',
            );
        });

        it('when properties not passed', async () => {
            setupCallsForTelemetrySetup();
            await testSubject.setup();

            invokeAllLoggerClientMocks((m) => m.setup((c) => c.log('info1', LogLevel.info, undefined)).verifiable(Times.once()));

            testSubject.logInfo('info1');

            verifyMocks();
        });

        it('when properties passed', async () => {
            const properties = { foo: 'bar' };
            setupCallsForTelemetrySetup();
            await testSubject.setup();

            invokeAllLoggerClientMocks((m) => m.setup((c) => c.log('info1', LogLevel.info, properties)).verifiable(Times.once()));

            testSubject.logInfo('info1', properties);

            verifyMocks();
        });
    });

    describe('logWarning', () => {
        it('throw if called before setup', () => {
            expect(() => {
                testSubject.logWarning('warn1');
            }).toThrowError(
                'The logger instance is not initialized. Ensure the setup() method is invoked by derived class implementation.',
            );
        });

        it('when properties not passed', async () => {
            setupCallsForTelemetrySetup();
            await testSubject.setup();

            invokeAllLoggerClientMocks((m) => m.setup((c) => c.log('warn1', LogLevel.warning, undefined)).verifiable(Times.once()));

            testSubject.logWarning('warn1');

            verifyMocks();
        });

        it('when properties passed', async () => {
            const properties = { foo: 'bar' };
            setupCallsForTelemetrySetup();
            await testSubject.setup();

            invokeAllLoggerClientMocks((m) => m.setup((c) => c.log('warn1', LogLevel.warning, properties)).verifiable(Times.once()));

            testSubject.logWarning('warn1', properties);

            verifyMocks();
        });
    });

    describe('logError', () => {
        it('throw if called before setup', () => {
            expect(() => {
                testSubject.logError('error1');
            }).toThrowError(
                'The logger instance is not initialized. Ensure the setup() method is invoked by derived class implementation.',
            );
        });

        it('when properties not passed', async () => {
            setupCallsForTelemetrySetup();
            await testSubject.setup();

            invokeAllLoggerClientMocks((m) => m.setup((c) => c.log('error1', LogLevel.error, undefined)).verifiable(Times.once()));

            testSubject.logError('error1');

            verifyMocks();
        });

        it('when properties passed', async () => {
            const properties = { foo: 'bar' };
            setupCallsForTelemetrySetup();
            await testSubject.setup();

            invokeAllLoggerClientMocks((m) => m.setup((c) => c.log('error1', LogLevel.error, properties)).verifiable(Times.once()));

            testSubject.logError('error1', properties);

            verifyMocks();
        });
    });

    describe('logDebug', () => {
        describe('in normal mode', () => {
            beforeEach(async () => {
                processStub.execArgv = ['--t'];

                setupCallsForTelemetrySetup();
                await testSubject.setup();
            });

            it('when properties not passed', () => {
                invokeAllLoggerClientMocks((m) => m.setup((c) => c.log('HealthCheck', LogLevel.debug, undefined)).verifiable(Times.once()));

                testSubject.logDebug('HealthCheck');

                verifyMocks();
            });

            it('when properties passed', () => {
                const properties = { foo: 'bar' };

                invokeAllLoggerClientMocks((m) =>
                    m.setup((c) => c.log('HealthCheck', LogLevel.debug, properties)).verifiable(Times.once()),
                );

                testSubject.logDebug('HealthCheck', properties);

                verifyMocks();
            });
        });
    });

    describe('logStartGroup', () => {
        describe('in normal mode', () => {
            beforeEach(async () => {
                processStub.execArgv = ['--t'];

                setupCallsForTelemetrySetup();
                await testSubject.setup();
            });

            it('when properties not passed', () => {
                invokeAllLoggerClientMocks((m) => m.setup((c) => c.log('HealthCheck', LogLevel.group, undefined)).verifiable(Times.once()));

                testSubject.logStartGroup('HealthCheck');

                verifyMocks();
            });

            it('when properties passed', () => {
                const properties = { foo: 'bar' };

                invokeAllLoggerClientMocks((m) =>
                    m.setup((c) => c.log('HealthCheck', LogLevel.group, properties)).verifiable(Times.once()),
                );

                testSubject.logStartGroup('HealthCheck', properties);

                verifyMocks();
            });
        });
    });

    describe('logEndGroup', () => {
        describe('in normal mode', () => {
            beforeEach(async () => {
                processStub.execArgv = ['--t'];

                setupCallsForTelemetrySetup();
                await testSubject.setup();
            });

            it('when properties not passed', () => {
                invokeAllLoggerClientMocks((m) => m.setup((c) => c.log('', LogLevel.endgroup, undefined)).verifiable(Times.once()));

                testSubject.logEndGroup();

                verifyMocks();
            });

            it('when properties passed', () => {
                const properties = { foo: 'bar' };

                invokeAllLoggerClientMocks((m) => m.setup((c) => c.log('', LogLevel.endgroup, properties)).verifiable(Times.once()));

                testSubject.logEndGroup(properties);

                verifyMocks();
            });
        });
    });

    describe('trackException', () => {
        it('throw if called before setup', () => {
            expect(() => {
                testSubject.trackException(new Error('test error'));
            }).toThrowError(
                'The logger instance is not initialized. Ensure the setup() method is invoked by derived class implementation.',
            );
        });

        it('trackException', async () => {
            const error = new Error('some error');
            setupCallsForTelemetrySetup();
            await testSubject.setup();

            invokeAllLoggerClientMocks((m) => m.setup((c) => c.trackException(error)).verifiable(Times.once()));

            testSubject.trackException(error);

            verifyMocks();
        });
    });

    describe('trackExceptionAny', () => {
        it('throw if called before setup', () => {
            expect(() => {
                testSubject.trackExceptionAny(new Error('test error'), 'error message');
            }).toThrowError(
                'The logger instance is not initialized. Ensure the setup() method is invoked by derived class implementation.',
            );
        });

        it('handles when passed error object', async () => {
            const underlyingError = new Error('internal error');
            const errorMessage = 'error message';

            setupCallsForTelemetrySetup();
            await testSubject.setup();

            invokeAllLoggerClientMocks((m) =>
                m.setup((c) => c.trackException(new VError(underlyingError, errorMessage))).verifiable(Times.once()),
            );

            testSubject.trackExceptionAny(underlyingError, errorMessage);

            verifyMocks();
        });

        it('handles when passed non-error object', async () => {
            const underlyingError = { err: 'internal error' };
            const errorMessage = 'error message';

            setupCallsForTelemetrySetup();
            await testSubject.setup();

            invokeAllLoggerClientMocks((m) =>
                m
                    .setup((c) => c.trackException(new VError(new Error(testSubject.serializeError(underlyingError)), errorMessage)))
                    .verifiable(Times.once()),
            );

            testSubject.trackExceptionAny(underlyingError, errorMessage);

            verifyMocks();
        });
    });

    function verifyMocks(): void {
        loggerClient1Mock.verifyAll();
        loggerClient2Mock.verifyAll();
    }

    function setupCallsForTelemetrySetup(additionalCommonProps?: BaseTelemetryProperties): void {
        invokeAllLoggerClientMocks((loggerClient) =>
            loggerClient
                .setup(async (c) => c.setup(additionalCommonProps))
                .returns(async () => Promise.resolve())
                .verifiable(Times.once()),
        );
    }

    function invokeAllLoggerClientMocks(action: (loggerClient: IMock<LoggerClient>) => void): void {
        action(loggerClient1Mock);
        action(loggerClient2Mock);
    }
});
