using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Reflection;
using DotEnv = DotEnvFile.DotEnvFile;

namespace Rustwrench
{
    /// <summary>
    /// A helper class for pulling AppSetting keys from App.config.
    /// </summary>
    public static class Config
    {
        static Config()
        {
            var path = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), "../../AppSettings.private.env");
            
            try
            {
                EnvFile = DotEnv.LoadFile(path);
            }
            catch (FileNotFoundException e)
            {
                Console.WriteLine(e.Message);
            }
        }

        static Dictionary<string, string> EnvFile = new Dictionary<string, string>();

        public static string AppVersion = Assembly.GetExecutingAssembly().GetName().Version.ToString();

        /// <summary>
        /// Attempts to get a configuration value from the AppSettings.private.env file. If the value is not found, it will then attempt to get it from the App.config file, and then from the environment variables.
        /// If a prefixed value is found, it will take precedence.
        /// </summary>
        private static string Get(string key, string prefix = "SCI-")
        {
            string fromEnvFile = EnvFile.ContainsKey(prefix + key) ? EnvFile[prefix + key] : EnvFile.ContainsKey(key) ? EnvFile[key] : null;
            string prefixed = ConfigurationManager.AppSettings.Get(prefix + key) ?? Environment.GetEnvironmentVariable(prefix + key);
            string unprefixed = ConfigurationManager.AppSettings.Get(key) ?? Environment.GetEnvironmentVariable(key); 

            return fromEnvFile ?? prefixed ?? unprefixed;
        }
    }
}