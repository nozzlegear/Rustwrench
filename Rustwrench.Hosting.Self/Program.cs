using System;
using Mono.Unix;
using Mono.Unix.Native;
using Nancy.Hosting.Self;
using System.Threading;
using Rustwrench.Infrastructure;
using System.Threading.Tasks;

namespace Rustwrench.Hosting.Self
{
    class Program
    {
        static NancyHost Host;

        static void Main(string[] args)
        {
            const string url = "http://localhost:4005";
            var cancellation = new CancellationTokenSource();

            Console.CancelKeyPress += (s, e) =>
            {
                Console.WriteLine("Stopping Rustwrench API host...");

                e.Cancel = true;
                cancellation.Cancel();

                Stop();
            };
            
            Host = new NancyHost(new HostConfiguration()
            {
                UrlReservations = new UrlReservations()
                {
                    CreateAutomatically = true,
                },
            }, new Uri(url));

            Host.Start();

            Console.WriteLine($"Rustwrench API running on {url}. Press CTRL+C to stop host.");

            if (IsRunningOnMono())
            {
                var terminationSignals = GetUnixTerminationSignals();

                UnixSignal.WaitAny(terminationSignals);
            }
            else
            {
                // Do not end the process on Windows when enter is pressed. Only cancel/kill signals should end it.
                while (true)
                {
                    Console.ReadLine();
                }
            }

            Stop();
        }

        static void Stop()
        {
            if (Host != null)
            {
                Host.Stop();
            }

            Environment.Exit(0);
        }

        private static bool IsRunningOnMono()
        {
            return Type.GetType("Mono.Runtime") != null;
        }

        private static UnixSignal[] GetUnixTerminationSignals()
        {
            return new[]
            {
                new UnixSignal(Signum.SIGINT),
                new UnixSignal(Signum.SIGTERM),
                new UnixSignal(Signum.SIGQUIT),
                new UnixSignal(Signum.SIGHUP)
            };
        }
    }
}
