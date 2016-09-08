@echo off
:: Expected debug process is to start the API in the console, and then run webpack-dev-server for the client.

echo "Executing debug command from directory %cd%"

:: 1. Restore Paket packages
call :ExecuteCmd ".paket/paket.bootstrapper.exe"
call :ExecuteCmd ".paket/paket.exe" install
if %ERRORLEVEL% NEQ 0 goto error

:: 2. Build the Self-host project
call :ExecuteCmd msbuild "Rustwrench.Hosting.Self/Rustwrench.Hosting.Self.csproj" /verbosity:m 
IF %ERRORLEVEL% NEQ 0 goto error

:: 3. Launch the npm 'watch' command, which runs the webpack dev server and the self-hosted API at the same time
cd Client
call :ExecuteCmd npm run watch
IF %ERRORLEVEL% NEQ 0 goto error

goto end

:: Execute command routine that will echo out when error
:ExecuteCmd
setlocal
set _CMD_=%*
call %_CMD_%
if "%ERRORLEVEL%" NEQ "0" echo Failed exitCode=%ERRORLEVEL%, command=%_CMD_%
exit /b %ERRORLEVEL%

:error
endlocal
echo An error has occurred during debug command. ErrorLevel: %ERRORLEVEL%
call :exitSetErrorLevel
call :exitFromFunction 2>nul

:exitSetErrorLevel
exit /b 1

:exitFromFunction
()

:end
endlocal
echo Finished successfully.