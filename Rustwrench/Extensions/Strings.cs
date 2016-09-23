using System;

namespace Rustwrench
{
    public static class StringExtensions
    {
        /// <summary>
        /// Checks whether the strings are equal, ignoring case.
        /// </summary>
        public static bool EqualsIgnoreCase(this string str, string comparison)
        {
            return str.Equals(comparison, StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Checks whether the string contains another string, ignoring case.
        /// </summary>
        public static bool ContainsIgnoreCase(this string str, string comparison)
        {
            return str.ToLower().Contains(comparison.ToLower());
        }
    }
}