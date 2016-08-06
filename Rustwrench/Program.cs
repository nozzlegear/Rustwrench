using System;
using Mono.Unix;
using Mono.Unix.Native;
using Nancy.Hosting.Self;

namespace Rustwrench
{
    class Program
    {
        static void Main(string[] args)
        {
            const string url = "http://localhost:4001";

            Console.WriteLine($"Rustwrench running on {url}");           

            var uri = new Uri(url);
            var host = new NancyHost(new HostConfiguration()
            {
                UrlReservations = new UrlReservations()
                {
                    CreateAutomatically = true,
                },
            }, uri);

            host.Start();

            if (IsRunningOnMono())
            {
                var terminationSignals = GetUnixTerminationSignals();

                UnixSignal.WaitAny(terminationSignals);
            }
            else
            {
                Console.ReadLine();
            }

            host.Stop();
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
